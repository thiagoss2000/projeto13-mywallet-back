import { Router } from "express";

import { regiterUser, logUser } from "../controllers/userController.js";

const userRouter = Router();

userRouter.post('/sign-up' ,regiterUser);
userRouter.post('/sign-in' ,logUser);

export default userRouter;