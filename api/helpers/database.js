const mysql = require('mysql2/promise');
/* database connection object */
const databaseConnection = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DB,
    password: process.env.MYSQL_PASS,
    namedPlaceholders: true,
};

module.exports.createConnection = async () => {
    const connection = await mysql.createConnection(databaseConnection);
    return connection;
}

module.exports.releaseConnection = async (connection) => {
    try {
        await connection.end();
        return true;
    } catch (err) {
        if (err instanceof Error) {
            console.log('error:', err);
            return false;
        }
    }
}

const defaultErrorDatabaseHandler = (error) => {
    console.log('error:', error);
    return {
        "fieldCount": 0,
        "affectedRows": 0,
        "insertId": 0,
        "info": `error: ${error}`,
        "serverStatus": 0,
        "warningStatus": 0,
        "changedRows": 0,
    }
}

module.exports.executeUnpreparedQuery = async (connection, query) => {
    try {
        const [rows] = await connection.query(query);
        return rows;
    } catch (err) {
        if (err instanceof Error) {
            // return default placeholder
            return defaultErrorDatabaseHandler(err);
        }
    }
}

module.exports.executePreparedQuery = async (connection, query, params) => {
    try {
        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (err) {
        if (err instanceof Error) {
            // return default placeholder
            return defaultErrorDatabaseHandler(err);
        }
    }
}