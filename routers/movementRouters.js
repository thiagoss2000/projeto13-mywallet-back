import { Router } from "express";

import { inputMovement, updateMovement, outputMovement, deleteMovement } from "../controllers/movementController.js";

const movementRouter = Router();

movementRouter.post('/move', inputMovement);
movementRouter.put('/move', updateMovement);
movementRouter.get('/move', outputMovement);
movementRouter.delete('/move', deleteMovement);

export default movementRouter;