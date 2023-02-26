declare namespace Express {
    interface Request {
        prisma: import("@prisma/client").PrismaClient;
        token: string | null;
        tokenType: string | null;
        user: any;
    }
}

interface BigInt {
  toJSON: () => string;
}
