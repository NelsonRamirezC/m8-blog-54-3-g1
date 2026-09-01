import Usuario from "./Usuario.model.js";
import Publicacion from "./Publicacion.model.js";
import Comentario from "./Comentario.model.js";

//RELACIONES ENTRE MODELOS

Usuario.hasMany(Publicacion, { foreignKey: "usuarioId" });
Publicacion.belongsTo(Usuario, { foreignKey: "usuarioId" });

Usuario.hasMany(Comentario, { foreignKey: "usuarioId" });
Comentario.belongsTo(Usuario, { foreignKey: "usuarioId" });

Publicacion.hasMany(Comentario, { foreignKey: "publicacionId" });
Comentario.belongsTo(Publicacion, { foreignKey: "publicacionId" });

export default {
    Usuario, Publicacion, Comentario
}