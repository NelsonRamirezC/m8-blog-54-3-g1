export const getAllUsuarios = async (req, res) => {
    try {
        
        res.json({message: "Ruta usuarios..."})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor"});
    }
}