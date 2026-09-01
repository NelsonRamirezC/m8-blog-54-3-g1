import modelos from "../models/index.js";
import sequelize from "../config/db.js";

const { Comentario, Usuario, Publicacion } = modelos;

const usuarioAttributes = ["id", "nombre", "email"];

const obtenerDatosComentario = (body) => {
    const { publicacionId, usuarioId, contenido } = body;

    return { publicacionId, usuarioId, contenido };
};

export const getAllComentarios = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const comentarios = await Comentario.findAll({
            include: [
                { model: Usuario, attributes: usuarioAttributes },
                { model: Publicacion },
            ],
            order: [["fechaCreacion", "ASC"]],
            transaction: t,
        });

        await t.commit();
        res.json({
            status: "ok",
            totalComentarios: comentarios.length,
            comentarios,
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

export const getComentarioById = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const comentario = await Comentario.findByPk(id, {
            include: [
                { model: Usuario, attributes: usuarioAttributes },
                { model: Publicacion },
            ],
            transaction: t,
        });

        if (!comentario) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún comentario con id: ${id}.`,
            });
        }

        await t.commit();
        res.json({ status: "ok", comentario });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const createComentario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { publicacionId, usuarioId, contenido } = obtenerDatosComentario(req.body);

        if (!publicacionId || !usuarioId || !contenido) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message:
                    "Se requieren los campos: publicacionId, usuarioId y contenido.",
            });
        }

        const [publicacion, usuario] = await Promise.all([
            Publicacion.findByPk(publicacionId, { transaction: t }),
            Usuario.findByPk(usuarioId, { transaction: t }),
        ]);

        if (!publicacion) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ninguna publicación con id: ${publicacionId}.`,
            });
        }

        if (!usuario) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún usuario con id: ${usuarioId}.`,
            });
        }

        const comentario = await Comentario.create(
            { publicacionId, usuarioId, contenido },
            { transaction: t },
        );

        await t.commit();
        res.status(201).json({ status: "ok", comentario });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const updateComentario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const datos = obtenerDatosComentario(req.body);

        if (!datos.publicacionId || !datos.usuarioId || !datos.contenido) {
            await t.rollback();
            return res.status(400).json({
                status: "fail",
                message:
                    "Se requieren los campos: publicacionId, usuarioId y contenido.",
            });
        }

        const comentario = await Comentario.findByPk(id, { transaction: t });
        if (!comentario) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún comentario con id: ${id}.`,
            });
        }

        const [publicacion, usuario] = await Promise.all([
            Publicacion.findByPk(datos.publicacionId, { transaction: t }),
            Usuario.findByPk(datos.usuarioId, { transaction: t }),
        ]);

        if (!publicacion) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ninguna publicación con id: ${datos.publicacionId}.`,
            });
        }

        if (!usuario) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún usuario con id: ${datos.usuarioId}.`,
            });
        }

        await comentario.update(datos, { transaction: t });
        await t.commit();
        res.json({ status: "ok", comentario });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).json({
            status: "fail",
            message: "Error interno del servidor",
        });
    }
};

export const deleteComentario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const result = await Comentario.destroy({
            where: { id },
            transaction: t,
        });

        if (!result) {
            await t.rollback();
            return res.status(404).json({
                status: "fail",
                message: `No se encontró ningún comentario con id: ${id}.`,
            });
        }

        await t.commit();
        res.json({
            status: "ok",
            message: `Comentario con id: ${id} eliminado con éxito.`,
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
