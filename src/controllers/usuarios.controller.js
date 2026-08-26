import Usuario from "../models/Usuario.model.js";

export const getAllUsuarios = async (req, res) => {
    try {
    
        const usuarios = await Usuario.findAll();
        
        res.json({status: "ok", usuarios});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor"});
    }
}