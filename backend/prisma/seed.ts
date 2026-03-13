import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database with demo data...');

  // 1. Clean existing records (Optional, good for resetting)
  await prisma.review.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@garageconnect.com',
      passwordHash,
      fullName: 'System Administrator',
      role: 'ADMIN'
    }
  });

  // 3. Create Garage Owner & Garage
  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@fastfix.com',
      passwordHash,
      fullName: 'Mike Mechanic',
      role: 'GARAGE_OWNER',
    }
  });

  const garage = await prisma.garage.create({
    data: {
      userId: ownerUser.id,
      garageName: 'FastFix Auto Repair',
      address: '101 Motor Way',
      city: 'Portland',
      state: 'OR',
      pincode: '97204',
      isVerified: true,
      latitude: 45.5231,
      longitude: -122.6765,
      services: {
        create: [
          { name: 'Standard Oil Change', basePrice: 49.99, pricingType: 'FIXED', vehicleTypes: ['FOUR_WHEELER'] },
          { name: 'Brake Inspection', basePrice: 20.00, pricingType: 'INSPECTION_BASED', vehicleTypes: ['FOUR_WHEELER'] },
          { name: 'Bike Chain Lube', basePrice: 15.00, pricingType: 'FIXED', vehicleTypes: ['TWO_WHEELER'] }
        ]
      }
    },
    include: { services: true }
  });

  // 4. Create Customer & Vehicle
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      passwordHash,
      fullName: 'Jane Driver',
      role: 'CUSTOMER',
      customer: {
        create: {
          vehicles: {
            create: [
              { make: 'Toyota', model: 'Camry', year: 2018, vehicleNumber: 'ABC-1234', vehicleType: 'FOUR_WHEELER' }
            ]
          }
        }
      }
    },
    include: { customer: { include: { vehicles: true } } }
  });

  const customerId = customerUser.customer!.id;
  const vehicleId = customerUser.customer!.vehicles[0].id;

  // 5. Create a PENDING Booking
  await prisma.booking.create({
    data: {
      customerId,
      garageId: garage.id,
      vehicleId,
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      customerIssue: 'Need an oil change before my road trip.',
      status: 'PENDING',
      totalAmount: garage.services[0].basePrice,
      items: {
        create: [
          { serviceId: garage.services[0].id, price: garage.services[0].basePrice || 0 }
        ]
      }
    }
  });

  // 6. Create a COMPLETED Booking with Review
  const completedBooking = await prisma.booking.create({
    data: {
      customerId,
      garageId: garage.id,
      vehicleId,
      scheduledDate: new Date(Date.now() - 86400000), // Yesterday
      customerIssue: 'Brakes squeaking',
      status: 'COMPLETED',
      totalAmount: garage.services[1].basePrice,
      items: {
        create: [
          { serviceId: garage.services[1].id, price: garage.services[1].basePrice || 0 }
        ]
      }
    }
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      customerId,
      garageId: garage.id,
      rating: 5,
      comment: 'Excellent and fast service!'
    }
  });

  // 7. Update garage rating based on review
  await prisma.garage.update({
    where: { id: garage.id },
    data: { rating: 5.0 }
  });

  console.log('Seed completed successfully!');
  console.log('\nDemo Accounts (password: password123):');
  console.log('- Admin: ' + adminUser.email);
  console.log('- Owner: ' + ownerUser.email);
  console.log('- Customer: ' + customerUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
