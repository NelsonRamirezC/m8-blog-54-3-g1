import Usuario from "../models/Usuario.model.js";
import sequelize from "../config/db.js";
import { generarHash, decodeHash } from "../utils/utils.js";

export const getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ["id", "nombre", "email"],
            // where: {
            //     admin: false
            // }
        });

        res.json({ status: "ok", usuarios });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const createUsuario = async (req, res) => {

    const t = await sequelize.transaction();
    try {
        let { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            await t.rollback();
            return res
                .status(400)
                .json({
                    status: "fail",
                    message: `No se proporcionan los campos requeridos: [nombre, email, password].`,
                });
        }

        const usuario = await Usuario.findOne({
            where: {
                email,
            },
            transaction: t
        });

        if (usuario) {
            await t.rollback();
            return res
                .status(400)
                .json({
                    status: "fail",
                    message: `Ya existe un usuario registrado con el email: ${email}, si usted es el propietario de dicho email, intente recuperar su password, de lo contrario debe ponerse en contacto contacto con el administrador: admin@admin.com`,
                });
        }

        let passwordHash = generarHash(password);
        const newUsuario = await Usuario.create({ nombre, email, password: passwordHash }, {transaction: t});

        await t.commit();
        res.json({ status: "ok", usuario: newUsuario });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



export const login = async (req, res) => {

    const t = await sequelize.transaction();
    try {
        let { email, password} = req.body;

        if (!email || !password) {
            await t.rollback();
            return res
                .status(400)
                .json({
                    status: "fail",
                    message: `No se proporcionan los campos requeridos: [email, password].`,
                });
        }

        const usuario = await Usuario.findOne({
            where: {
                email,
            },
            transaction: t
        });

        if (!usuario || !decodeHash(password, usuario.password)) {
            await t.rollback();
            return res
                .status(400)
                .json({
                    status: "fail",
                    message: `Credenciales inválidas`,
                });
        }

        await t.commit();

        res.json({ status: "ok", message: "Login correcto." });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
