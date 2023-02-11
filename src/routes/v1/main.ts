import { Request, Response, Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    return res.status(418).send("I'm a teapot");
});

module.exports = router;
