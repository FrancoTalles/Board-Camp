import { Router } from "express";
import { buscarJogos, criarJogo } from "../Controllers/gamesController.js";

import { validateSchema } from "../Middleware/validateSchema.js";
import { gameSchema } from "../Schemas/gameSchema.js";

const gamesRouter = Router();

gamesRouter.get("/games", buscarJogos);
gamesRouter.post("/games", validateSchema(gameSchema), criarJogo);

export default gamesRouter;