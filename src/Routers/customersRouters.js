import { Router } from "express";
import {
  atualizarCliente,
  buscarClientePorId,
  buscarClientes,
  criarCliente,
} from "../Controllers/customersController.js";

import { validateSchema } from "../Middleware/validateSchema.js";
import { customerSchema } from "../Schemas/customerSchema.js";

const customersRouter = Router();

customersRouter.get("/customers", buscarClientes);
customersRouter.get("/customers/:id", buscarClientePorId);
customersRouter.post(
  "/customers",
  validateSchema(customerSchema),
  criarCliente
);
customersRouter.put(
  "/customers/:id",
  validateSchema(customerSchema),
  atualizarCliente
);

export default customersRouter;
