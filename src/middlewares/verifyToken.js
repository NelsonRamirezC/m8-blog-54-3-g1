import jwt from "jsonwebtoken";

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

    jwt.verify(token, process.env.SECRETO_JWT, (error, decoded) => {
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

        next();
    });
};

export default verifyToken;
