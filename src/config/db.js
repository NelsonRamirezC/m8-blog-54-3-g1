import { Sequelize } from 'sequelize';

const URI_DATABASE = process.env.URI_DATABASE;

const sequelize = new Sequelize(URI_DATABASE, {
    quoteIdentifiers: false
});


export default sequelize;