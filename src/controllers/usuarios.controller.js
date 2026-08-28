import Usuario from "../models/Usuario.model.js";
import sequelize from "../config/db.js";
import { generarHash, decodeHash } from "../utils/utils.js";

export const getAllUsuarios = async (req, res) => {
    try {
        let { limit, offset, sortBy, order } = req.query;

        console.log(limit, offset, sortBy, order);

        // 1. Whitelist de campos y sentidos permitidos
        const allowedFields = ["id", "nombre", "email"];
        const allowedOrders = ["ASC", "DESC"];

        // 2. Construir la cláusula de ordenamiento opcional
        let orderClause = undefined;

        if (sortBy && allowedFields.includes(sortBy)) {
            const direction = allowedOrders.includes(order?.toUpperCase())
                ? order.toUpperCase()
                : "ASC";

            orderClause = [[sortBy, direction]];
        }

        console.log(orderClause);

        // 3. Consulta con paginación y orden dinámico
        const { count, rows } = await Usuario.findAndCountAll({
            attributes: ["id", "nombre", "email"],
            offset: offset ? Number(offset) : undefined,
            limit: limit ? Number(limit) : undefined,
            order: orderClause,
        });

        res.json({ status: "ok", totalUsuarios: count, usuarios: rows });
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
            return res.status(400).json({
                status: "fail",
                message: `No se proporcionan los campos requeridos: [nombre, email, password].`,
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                email,
            },
            transaction: t,
        });

        if (usuario) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message: `Ya existe un usuario registrado con el email: ${email}, si usted es el propietario de dicho email, intente recuperar su password, de lo contrario debe ponerse en contacto contacto con el administrador: admin@admin.com`,
            });
        }

        let passwordHash = generarHash(password);
        const newUsuario = await Usuario.create(
            { nombre, email, password: passwordHash },
            { transaction: t },
        );

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
        let { email, password } = req.body;

        if (!email || !password) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message: `No se proporcionan los campos requeridos: [email, password].`,
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                email,
            },
            transaction: t,
        });

        if (!usuario || !decodeHash(password, usuario.password)) {
            await t.rollback();
            return res.status(400).json({
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

// ACTUALIZAR USUARIOS
export const updateUsuario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let { id } = req.params;

        let { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message: `No se proporcionan los campos requeridos: [nombre, email, password].`,
            });
        }

        let passwordHash = generarHash(password);

        const [result] = await Usuario.update(
            { nombre, email, password: passwordHash },
            { where: { id }, transaction: t },
        );

        if (result == 0) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún usuario con id: ${id}, en la BD.`,
            });
        }

        await t.commit();
        res.status(201).json({ status: "Usuario actualizado." });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//ELIMINAR USUARIOS POR ID
export const deleteUsuario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let { id } = req.params;

        const result = await Usuario.destroy({
            where: { id },
            transaction: t,
        });

        if (result == 0) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún usuario con id: ${id}, en la BD.`,
            });
        }

        await t.commit();
        res.json({
            status: "ok",
            message: `Usuario con ID: ${id} eliminado con éxito.`,
        });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
