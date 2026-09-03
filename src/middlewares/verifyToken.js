import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.model.js";

const verifyToken = (req, res, next) => {
    console.log(req.headers);

    if (!req.headers["authorization"]) {
        return res.status(401).json({
            status: "fail",
            message: "Primero debe iniciar sesión, falta enviar token.",
        });
    }

    let bearerToken = req.headers["authorization"];

    const token = bearerToken.split(" ")[1];

    jwt.verify(token, process.env.SECRETO_JWT, async (error, decoded) => {
        if (error) {
            return res
                .status(401)
                .json({
                    status: "fail",
                    message:
                        "Token inválido o caducado, vuelva a iniciar sesión.",
                });
        }

        req.userToken = decoded;

        const usuario = await Usuario.findByPk(decoded.id);

        if(!usuario){
            return res
                .status(404)
                .json({
                    status: "Not found",
                    message:
                        "No existe un usuario en la BD con el ID:" + decoded.id,
                });
        }

        next();
    });
};

export default verifyToken;
