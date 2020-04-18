const mysql = require('mysql2')

function connectToDatabase() {
    return mysql.createConnection(process.env.CLEARDB_DATABASE_URL || {
        host: process.env.DB_URL,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }).promise()
}

module.exports = {
    connectToDatabase
}