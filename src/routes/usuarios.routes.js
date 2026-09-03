import express from "express";
import * as usuariosController from "../controllers/usuarios.controller.js";
import validateBody from "../middlewares/validateBody.js";
import verifyToken from "../middlewares/verifyToken.js";


const usuariosRoutes = express.Router();

//OBTENER TODOS LOS USUARIOS
usuariosRoutes.get("/", usuariosController.getAllUsuarios);

//ACTUALIZAR DATOS DEL USUARIO
usuariosRoutes.put("/:id", validateBody, usuariosController.updateUsuario);

//ELIMINAR USUARIO
usuariosRoutes.delete("/:id", verifyToken, usuariosController.deleteUsuario);

//REGISTRAR NUEVOS USUARIOS
usuariosRoutes.post("/", validateBody, usuariosController.createUsuario);

//VALIDAR CREDENCIALES DEL USUARIO
usuariosRoutes.post("/login", validateBody, usuariosController.login);

//OBTENER AVATAR DE USUARIOS COMO IMAGEN
usuariosRoutes.get("/:id/avatar", usuariosController.getAvatar);


export default usuariosRoutes;