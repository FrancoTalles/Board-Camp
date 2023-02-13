import { Router } from "express";
import {
  buscarAlugueis,
  finalizarAluguel,
  inserirAluguel,
} from "../Controllers/rentalsController.js";

import { validateSchema } from "../Middleware/validateSchema.js";
import { rentalSchema } from "../Schemas/rentalSchema.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", buscarAlugueis);
rentalsRouter.post("/rentals", validateSchema(rentalSchema), inserirAluguel);
rentalsRouter.post("/rentals/:id/return", finalizarAluguel);

export default rentalsRouter;
