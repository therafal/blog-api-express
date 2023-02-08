import { PrismaClient } from "@prisma/client";
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

const port = process.env.PORT || 3001;

const prisma: PrismaClient = new PrismaClient();

const app: Express = express();


app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "150mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "150mb" }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});