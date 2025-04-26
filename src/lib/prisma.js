const { PrismaClient } = require('../../prisma/generated/prisma-client-js')

const globalForPrisma = global // Use 'global' for Node.js standard environment

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

module.exports = prisma
