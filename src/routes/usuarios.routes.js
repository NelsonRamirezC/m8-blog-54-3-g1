import express from "express";
import * as usuariosController from "../controllers/usuarios.controller.js";

const usuariosRoutes = express.Router();

//OBTENER TODOS LOS USUARIOS
usuariosRoutes.get("/", usuariosController.getAllUsuarios);


export default usuariosRoutes;