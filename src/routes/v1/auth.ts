import { Request, Response, Router } from "express";
import randomstring from "randomstring";
import { verifyPassword } from "../../utils/hash";

const router = Router();

router.post("/auth/login", async (req: Request, res: Response) => {
    if (req.user) return res.status(400).send("Already logged in");

    if (!req.body.username || !req.body.password) return res.status(400).send("Missing username or password");

    const user = await req.prisma.users.findFirst({
        where: {
            username: req.body.username
        },
        select: {
            id: true,
            username: true,
            password: true
        }
    });

    if (!user) return res.status(403).send("Invalid username or password");

    if (!(await verifyPassword(req.body.password, user.password))) return res.status(403).send("Invalid username or password");

    const token = randomstring.generate(1024);

    await req.prisma.tokens.create({
        data: {
            token: token,
            user_id: user.id,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
    });

    res.status(200).send({
        token: token,
        user: {
            id: user.id,
            username: user.username
        }
    });
});

router.delete("/auth/sessions", async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    await req.prisma.tokens.deleteMany({
        where: {
            user_id: req.user.id
        }
    });

    res.status(204).send();
});

module.exports = router;
