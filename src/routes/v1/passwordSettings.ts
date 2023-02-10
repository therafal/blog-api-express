import { NextFunction, Request, Response, Router } from "express";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { users } from "@prisma/client";

const router = Router();

router.post("/user/me/password", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(404).send("Not found");
        if (!req.body.password) return res.status(400).send("Missing password");
        if (!req.body.new_password) return res.status(400).send("Missing new password");
        if (typeof req.body.password !== "string") return res.status(400).send("Invalid password");
        if (typeof req.body.new_password !== "string") return res.status(400).send("Invalid new password");

        if (req.body.password == req.body.new_password) return res.status(400).send("New password is the same as old password");

        const user = await req.prisma.users.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                id: true,
                username: true,
                password: true
            }
        });
        
        if (!user) return res.status(404).send("Not found");

        if (await verifyPassword(req.body.password, user.password)) {
            const hashedPassword = await hashPassword(req.body.new_password);
            const updatedUser = await req.prisma.users.update({
                where: {
                    id: user.id
                },
                data: {
                    password: hashedPassword
                },
                select: {
                    id: true,
                    username: true
                }
            });

            res.send({
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username
                }
            });
        } else return res.status(403).send("Invalid password");
    } catch (err) {
        next(err);
    }
});

router.post("/user/:id/password", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(404).send("Not found");
        if (!req.body.password) return res.status(400).send("Missing password");
        if (!req.body.new_password) return res.status(400).send("Missing new password");
        if (req.user.id == req.params.id) return res.status(400).send("Use /user/me/password instead");

        const uid: bigint = BigInt(req.params.id);

        const permission_level = await req.prisma.users.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                id: true,
                permission_level: true
            }
        });

        if (!permission_level) return res.status(404).send("Not found");
        if (permission_level.permission_level != 8) return res.status(401).send("Unauthorized");

        const user = await req.prisma.users.findUnique({
            where: {
                id: uid
            },
            select: {
                id: true,
                username: true,
                password: true
            }
        });

        if (!user) return res.status(404).send("Not found");
    
        const hashedPassword = await hashPassword(req.body.new_password);
        const updatedUser = await req.prisma.users.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            },
            select: {
                id: true,
                username: true
            }
        });

        res.send({
            user: {
                id: updatedUser.id,
                username: updatedUser.username
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;