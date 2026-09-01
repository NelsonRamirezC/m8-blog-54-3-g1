import express from "express";
import * as publicacionesController from "../controllers/publicaciones.controller.js";
import validateBody from "../middlewares/validateBody.js";

const publicacionesRoutes = express.Router();

//OBTENER TODAS LAS PUBLICACIONES
publicacionesRoutes.get("/", publicacionesController.getAllPublicaciones);

//OBTENER PUBLICACIONES POR ID
publicacionesRoutes.get("/:id", publicacionesController.getPublicacionById);

//CREAR PUBLICACIONES
publicacionesRoutes.post("/", validateBody, publicacionesController.createPublicacion);

//ACTUALIZAR PUBLICACIONES
publicacionesRoutes.put("/:id", validateBody, publicacionesController.updatePublicacion);

//ELIMINAR PUBLICACIONES POR ID
publicacionesRoutes.delete("/:id", publicacionesController.deletePublicacion);

export default publicacionesRoutes;
