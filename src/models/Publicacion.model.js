import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Usuario from "./Usuario.model.js";

class Publicacion extends Model {}

Publicacion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
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
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        contenido: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "fecha_creacion",
            allowNull: false,
        },
        fechaActualizacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "fecha_actualizacion",
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "publicacion",
        tableName: "publicaciones",
        timestamps: true,
        createdAt: "fechaCreacion",
        updatedAt: "fechaActualizacion",
        underscored: true
    }
);

export default Publicacion;