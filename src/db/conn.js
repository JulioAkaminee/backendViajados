const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

async function testarConexao() {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('Conexão bem-sucedida!', rows);
        return rows;
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
}

module.exports = { pool, testarConexao };