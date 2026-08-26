const { Model, DataTypes } = require("sequelize");

class Usuario extends Model {
    static initModel(sequelize) {
        Usuario.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                nombre: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: true,
                    },
                },
                password: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                admin: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                status: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                modelName: "usuario",
                tableName: "usuarios",
                timestamps: false, // Cámbialo a true si la tabla maneja createdAt/updatedAt
            },
        );
        return Usuario;
    }
}

export default Usuario;
