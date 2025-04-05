import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('DatabaseReset');

async function resetDatabase() {
  try {
    logger.log('Starting database reset...');

    // Delete all data in reverse order of dependencies
    logger.log('Removing all bills...');
    await prisma.bill.deleteMany();
    
    logger.log('Removing all clients...');
    await prisma.client.deleteMany();

    // You can perform any additional resets here if needed
    
    logger.log('Database reset completed successfully.');
  } catch (error) {
    logger.error(`Error resetting database: ${error.message}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
