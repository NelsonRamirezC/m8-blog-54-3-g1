import modelos from "../models/index.js";
import sequelize from "../config/db.js";

const { Publicacion, Usuario, Comentario } = modelos;

const usuarioAttributes = ["id", "nombre", "email"];

const obtenerDatosPublicacion = (body) => {
    const { usuarioId, titulo, contenido } = body;

    return { usuarioId, titulo, contenido };
};

export const getAllPublicaciones = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const publicaciones = await Publicacion.findAll({
            order: [["fechaCreacion", "DESC"]],
            transaction: t,
        });

        await t.commit();

        res.json({
            status: "ok",
            totalPublicaciones: publicaciones.length,
            publicaciones,
        });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const getPublicacionById = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const publicacion = await Publicacion.findByPk(id, {
            include: [
                { model: Usuario, attributes: usuarioAttributes },
                {
                    model: Comentario,
                    include: [
                        { model: Usuario, attributes: usuarioAttributes },
                    ],
                },
            ],
            transaction: t,
        });

        if (!publicacion) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ninguna publicación con id: ${id}.`,
            });
        }

        await t.commit();
        res.json({ status: "ok", publicacion });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const createPublicacion = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { titulo, contenido } = obtenerDatosPublicacion(
            req.body,
        );


        if (!titulo || !contenido) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message:
                    "Se requieren los campos: titulo y contenido.",
            });
        }

        let userToken = req.userToken;

        let usuarioId = userToken.id;

        const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún usuario con id: ${usuarioId}.`,
            });
        }

        const publicacion = await Publicacion.create(
            {
                usuarioId,
                titulo,
                contenido,
            },
            { transaction: t },
        );
        await t.commit();
        res.status(201).json({ status: "ok", publicacion });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const updatePublicacion = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const datos = obtenerDatosPublicacion(req.body);

        if (!datos.usuarioId || !datos.titulo || !datos.contenido) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message:
                    "Se requieren los campos: usuarioId, titulo y contenido.",
            });
        }

        const publicacion = await Publicacion.findByPk(id, { transaction: t });
        if (!publicacion) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ninguna publicación con id: ${id}.`,
            });
        }

        const usuario = await Usuario.findByPk(datos.usuarioId, {
            transaction: t,
        });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún usuario con id: ${datos.usuarioId}.`,
            });
        }

        await publicacion.update(datos, { transaction: t });
        await t.commit();
        res.json({ status: "ok", publicacion });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const deletePublicacion = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const result = await Publicacion.destroy({
            where: { id },
            transaction: t,
        });

        if (!result) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ninguna publicación con id: ${id}.`,
            });
        }

        await t.commit();
        res.json({
            status: "ok",
            message: `Publicación con id: ${id} eliminada con éxito.`,
        });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};
