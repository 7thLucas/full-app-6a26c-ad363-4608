import { Router } from "express";
import routes from "./routes";
import { initializeModels } from "./models";
import erpRoutes from "./erp-routes";

// Initialize models
await initializeModels();

const combined = Router();
combined.use(routes);
combined.use(erpRoutes);

export default combined;
