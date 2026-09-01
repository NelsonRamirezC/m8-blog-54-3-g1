import express from "express";
import * as comentariosController from "../controllers/comentarios.controller.js";
import validateBody from "../middlewares/validateBody.js";

const comentariosRoutes = express.Router();

//OBTENER TODOS LOS COMENTARIOS
comentariosRoutes.get("/", comentariosController.getAllComentarios);

//OBTENER COMENTARIO POR ID
comentariosRoutes.get("/:id", comentariosController.getComentarioById);

//CREAR COMENTARIOS
comentariosRoutes.post("/", validateBody, comentariosController.createComentario);

//ACTUALIZAR COMENTARIOS
comentariosRoutes.put("/:id", validateBody,comentariosController.updateComentario);

//ELIMINAR COMENTARIOS POR ID
comentariosRoutes.delete("/:id", comentariosController.deleteComentario);

export default comentariosRoutes;
