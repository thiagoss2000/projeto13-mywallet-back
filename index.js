import express, { json } from "express";
import cors from 'cors';

import userRouter from "./routers/userRouters.js";
import movementRouter from "./routers/movementRouters.js";

const app = express();
app.use(json());
app.use(cors());

app.use(userRouter);
app.use(movementRouter);

app.listen(5000, () => {
    console.log("server on");
})