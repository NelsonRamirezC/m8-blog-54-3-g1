import express from "express";
import * as usuariosController from "../controllers/usuarios.controller.js";
import validateBody from "../middlewares/validateBody.js";


const usuariosRoutes = express.Router();

//OBTENER TODOS LOS USUARIOS
usuariosRoutes.get("/", usuariosController.getAllUsuarios);

//REGISTRAR NUEVOS USUARIOS
usuariosRoutes.post("/", validateBody, usuariosController.createUsuario);

//VALIDAR CREDENCIALES DEL USUARIO
usuariosRoutes.post("/login", validateBody, usuariosController.login);


export default usuariosRoutes;