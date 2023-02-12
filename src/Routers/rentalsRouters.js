import { Router } from "express";
import { buscarAlugueis, inserirAluguel } from "../Controllers/rentalsController.js";

import { validateSchema } from "../Middleware/validateSchema.js";
import { rentalSchema } from "../Schemas/rentalSchema.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", buscarAlugueis);
rentalsRouter.post("/rentals", validateSchema(rentalSchema), inserirAluguel)

export default rentalsRouter;