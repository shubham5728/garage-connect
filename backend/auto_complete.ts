import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function autoProgressBookings() {
  console.log("Started auto-complete background service...");
  
  setInterval(async () => {
    try {
      const pendingBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ['PENDING', 'APPROVED', 'IN_PROGRESS']
          }
        }
      });

      for (const b of pendingBookings) {
        await prisma.booking.update({
          where: { id: b.id },
          data: { status: 'COMPLETED' }
        });
        console.log(`Auto-completed booking ${b.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  }, 5000);
}

autoProgressBookings();
