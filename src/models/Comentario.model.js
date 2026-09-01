import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Usuario from "./Usuario.model.js";
import Publicacion from "./Publicacion.model.js";

class Comentario extends Model {}

Comentario.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        publicacionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "publicacion_id",
            references: {
                model: Publicacion,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "usuario_id",
            references: {
                model: Usuario,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        contenido: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            field: "fecha_creacion",
        },
        fechaActualizacion: {
            type: DataTypes.DATE,
            field: "fecha_actualizacion",
        },
    },
    {
        sequelize,
        modelName: "comentario",
        tableName: "comentarios",
        timestamps: true,
        createdAt: "fechaCreacion",
        updatedAt: "fechaActualizacion",
        underscored: true
    }
);

export default Comentario;