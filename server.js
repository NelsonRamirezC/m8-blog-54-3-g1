import app from "./src/app.js";
import sequelize from "./src/config/db.js";

const PORT = 3000;

const main = async () => {
    try {
        await sequelize.sync();
        console.log("Base de datos activa");
        app.listen(PORT, () => {
            console.log("Servidor iniciado.");
        });
    } catch (error) {
        console.log(error);
    }
};

main();
