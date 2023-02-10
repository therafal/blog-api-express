import { PrismaClient } from "@prisma/client";
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import fs from 'fs';

const port = process.env.PORT || 3000;

const prisma: PrismaClient = new PrismaClient();

const app: Express = express();


app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "150mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "150mb" }));

app.use(async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Powered-By", `${Math.round(Math.random() * 100000000000).toString(16)}`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    req.prisma = prisma;

    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        const type = req.headers.authorization.split(" ")[0];

        req.token = token;
        req.tokenType = type;

        if (type === "Bearer") {
            const tokens = await prisma.tokens.findMany({
                where: {
                    token: token
                }
            });

            if (tokens.length > 0) {
                const user = await prisma.users.findUnique({
                    where: {
                        id: tokens[0].user_id
                    }
                });

                if (user) {
                    req.user = user;
                    next();
                } else {
                    return res.status(401).send("Unauthorized");
                }
            } else {
                return res.status(401).send("Unauthorized");
            }
        } else {
            return res.status(401).send("Unauthorized");
        }
    } else next();
});

app.get("/", (req: Request, res: Response) => {
    res.status(418);
    res.send("I'm a teapot");
});

fs.readdirSync(__dirname + "/routes").forEach((version: string) => {
    if (fs.lstatSync(__dirname + "/routes/" + version).isDirectory()) {
        fs.readdirSync(__dirname + "/routes/" + version).forEach((file: string) => {
            const route = require(__dirname + "/routes/" + version + "/" + file);
            app.use("/" + version, route);
        });
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});