import Usuario from "../models/Usuario.model.js";
import sequelize from "../config/db.js";
import { generarHash, decodeHash } from "../utils/utils.js";
import jwt from "jsonwebtoken";

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

        const usuarios = rows.map((u) => {
            u = u.toJSON();
            u.urlAvatar = `/api/usuarios/${u.id}/avatar`;

            return u;
        });

        res.json({ status: "ok", totalUsuarios: count, usuarios });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const createUsuario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let { nombre, email, password } = req.body;

        let { avatar } = req.files;

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

        let formatosPermitidos = ["jpg", "jpeg", "png", "svg"];

        if (avatar) {
            let extension = avatar.mimetype.split("/")[1];

            if (!formatosPermitidos.includes(extension)) {
                await t.rollback();
                return res.status(400).json({
                    status: "fail",
                    message: "Formato de imagen no permitido...",
                });
            }
        }

        //VALIDAR SI TAMAÑO DEL ARCHIVO
        const LIMIT_MB_AVATAR = 5 * 1024 * 1024; //5 MBS

        if (avatar.size > LIMIT_MB_AVATAR) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message: `Tamaño de imagen supera el límite permito de 5mbs.`,
            });
        }

        let passwordHash = generarHash(password);

        //TOMAR DATA EN BINARIO COMPATIBLE CON CAMPO DE TIPO BLOB DE POSTGRESQL Y EL MIMETYPE

        const imgAvatar = avatar.data;
        const mimetype = avatar.mimetype;

        let newUsuario = await Usuario.create(
            { nombre, email, password: passwordHash, imgAvatar, mimetype },
            { transaction: t },
        );

        newUsuario = newUsuario.toJSON();

        let usuarioObj = {
            id: newUsuario.id,
            nombre: newUsuario.nombre,
            email: newUsuario.email,
        };

        await t.commit();
        res.json({ status: "ok", usuario: usuarioObj });
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

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            admin: usuario.admin,
            status: usuario.status,
        };

        const llaveSecreta = process.env.SECRETO_JWT;

        const token = jwt.sign(payload, llaveSecreta, {
            algorithm: "HS256",
            expiresIn: "5m",
        });

        await t.commit();
        res.json({ status: "ok", message: "Login correcto.", token });
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

        let userToken = req.userToken;

        let { id } = req.params;

        if (userToken.id != id) {
            if (!userToken.admin) {
                return res.status(403).json({
                    status: "fail",
                    message: `Usted no tiene los permisos necesarios para actualizar la cuenta del usuario id: ${id}`,
                });
            }
        }


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
        if (!req.userToken) {
            return res.status(401).json({
                status: "fail",
                message: `No está autorizado a realizar está solicitud, primero inicie sesión.`,
            });
        }

        let userToken = req.userToken;
        let { id } = req.params;

        if (userToken.id != id) {
            if (!userToken.admin) {
                return res.status(403).json({
                    status: "fail",
                    message: `Usted no tiene los permisos necesarios para eliminar la cuenta del usuario id: ${id}`,
                });
            }
        }

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

//ELIMINAR USUARIOS POR ID
export const getAvatar = async (req, res) => {
    try {
        let { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            attributes: ["imgAvatar", "mimetype"],
        });

        if (!usuario) {
            return res
                .status(400)
                .json({
                    status: "fail",
                    message: "No existe un usuaro con el id: " + id,
                });
        }

        if (!usuario.imgAvatar) {
            return res.status(404).send("No existe imagen");
        }

        //CONFIGURAR HEADERS PARA LA IMAGEN
        res.set("Content-Type", usuario.mimetype);
        res.set("Cache-Cntrol", "public, max-age=3600");

        res.send(usuario.imgAvatar);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
