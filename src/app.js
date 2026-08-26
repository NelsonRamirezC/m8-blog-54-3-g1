import express from "express";
import usuariosRoutes from "./routes/usuarios.routes.js";

const app = express();


//MIDDLEWARES GLOBALES
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//RUTAS ENDPOINTS
app.use("/api/usuarios", usuariosRoutes);

export default app;