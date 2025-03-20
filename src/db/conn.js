const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }  // 🔹 Adicionado para conexões seguras
});

async function testarConexao() {
    try {
        console.log('🔄 Tentando conectar ao banco de dados...');
        const conexao = await pool.getConnection(); // 🔹 Obtém uma conexão
        const [rows] = await conexao.query('SELECT 1'); // 🔹 Testa a conexão
        conexao.release(); // 🔹 Libera a conexão após o uso
        console.log('✅ Conexão bem-sucedida!', rows);
    } catch (err) {
        console.error('❌ Erro ao conectar ao banco de dados:');
        console.error('Código:', err.code);
        console.error('Mensagem:', err.sqlMessage || err.message);
        console.error('Detalhes:', err);
    }
}

testarConexao();

module.exports = pool;
