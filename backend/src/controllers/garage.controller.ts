import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { SearchGaragesQuery } from "../validators/garage.validator.js";

function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
}

export const searchGarages = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as unknown as SearchGaragesQuery;
    
    // Build Prisma query
    const whereClause: any = {};

    if (query.isVerified !== undefined) {
      whereClause.isVerified = query.isVerified;
    }

    if (query.vehicleType) {
      whereClause.services = {
        some: { vehicleTypes: { has: query.vehicleType } }
      };
    }

    if (query.service) {
      // Using contains for fuzzy match on service name
      whereClause.services = {
        ...(whereClause.services || {}),
        some: {
          ...(whereClause.services?.some || {}),
          name: { contains: query.service, mode: "insensitive" }
        }
      };
    }

    if (query.minRating) {
      whereClause.rating = { gte: query.minRating };
    }

    let garages = await prisma.garage.findMany({
      where: whereClause,
      include: {
        services: true
      }
    });

    // Handle Radius filtering logic manually if geometry types aren't active
    if (query.lat !== undefined && query.lng !== undefined && query.radiusKm !== undefined) {
      const radiusMiles = query.radiusKm * 0.621371;
      garages = garages.filter((g: any) => {
        if (g.latitude === null || g.longitude === null) return false;
        const dist = getDistanceMiles(query.lat as number, query.lng as number, g.latitude, g.longitude);
        return dist <= radiusMiles;
      });
      
      // Optionally sort by distance if location provided
      garages.sort((a: any, b: any) => {
        const distA = getDistanceMiles(query.lat as number, query.lng as number, a.latitude as number, a.longitude as number);
        const distB = getDistanceMiles(query.lat as number, query.lng as number, b.latitude as number, b.longitude as number);
        return distA - distB;
      });
    }

    res.status(200).json({ success: true, count: garages.length, garages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to search garages" });
  }
};

export const getGarageDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const garage = await prisma.garage.findUnique({
      where: { id },
      include: {
        services: true,
        reviews: {
          include: {
            customer: {
              include: { user: { select: { fullName: true } } }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!garage) {
      res.status(404).json({ success: false, message: "Garage not found" });
      return;
    }

    res.status(200).json({ success: true, garage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch garage details" });
  }
};
