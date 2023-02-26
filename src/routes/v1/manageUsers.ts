import { NextFunction, Request, Response, Router } from "express";
import { hashPassword, verifyPassword } from "../../utils/hash";

const router = Router();

router.post(
  "/user",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      if (!req.body.username) return res.status(400).send("Missing username");
      if (!req.body.password) return res.status(400).send("Missing password");
      if (typeof req.body.username !== "string")
        return res.status(400).send("Invalid username");
      if (typeof req.body.password !== "string")
        return res.status(400).send("Invalid password");
      if (typeof req.body.permissions !== "object")
        return res.status(400).send("Invalid permissions");

      if (!req.user.permissions.includes("admin"))
        return res.status(403).send("Forbidden");

      const hashedPassword = await hashPassword(req.body.password);

      const user = await req.prisma.users.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
        },
      });

      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/user/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      if (!req.body.username) return res.status(400).send("Missing username");
      if (typeof req.body.username !== "string")
        return res.status(400).send("Invalid username");

      const user = await req.prisma.users.update({
        where: {
          id: req.user.id,
        },
        data: {
          username: req.body.username,
        },
        select: {
          id: true,
          username: true,
        },
      });

      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/user/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");
      if (!req.body.username) return res.status(400).send("Missing username");
      if (typeof req.body.username !== "string")
        return res.status(400).send("Invalid username");

      if (!req.user.permissions.includes("admin"))
        return res.status(403).send("Forbidden");

      const user = await req.prisma.users.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          username: req.body.username,
        },
        select: {
          id: true,
          username: true,
        },
      });

      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/user/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      await req.prisma.users.delete({
        where: {
          id: req.user.id,
        },
      });

      await req.prisma.tokens.deleteMany({
        where: {
          user_id: req.user.id,
        },
      });

      res.status(200).send("Account deleted");
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/user/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).send("Unauthorized");

      if (!req.user.permissions.includes("admin"))
        return res.status(403).send("Forbidden");

      await req.prisma.users.delete({
        where: {
          id: Number(req.params.id),
        },
      });

      await req.prisma.tokens.deleteMany({
        where: {
          user_id: Number(req.params.id),
        },
      });

      res.status(200).send("User deleted");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
