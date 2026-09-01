import express from "express";
import usuariosRoutes from "./routes/usuarios.routes.js";
import publicacionesRoutes from "./routes/publicaciones.routes.js";
import comentariosRoutes from "./routes/comentarios.routes.js";
import fileUpload from "express-fileupload";

const app = express();


//MIDDLEWARES GLOBALES
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload()); // req.files para archivos y req.body paara textos


//RUTAS ENDPOINTS
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/publicaciones", publicacionesRoutes);
app.use("/api/comentarios", comentariosRoutes);

export default app;