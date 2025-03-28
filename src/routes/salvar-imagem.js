const express = require('express');
const db = require("../db/conn");

const router = express.Router();

// Rota para cadastrar a foto do usuário específico com idUsuario
router.post("/", async (req, res) => {
  try {
    const { foto_usuario, idUsuario } = req.body; // Recebe a foto como base64 e o id do usuário

    // Verificar se a foto e o idUsuario estão presentes
    if (!foto_usuario) {
      return res.status(400).send('Foto do usuário é necessária.');
    }

    if (!idUsuario) {
      return res.status(400).send('idUsuario é necessário.');
    }

    // Verificar se o idUsuario existe no banco de dados
    const verificarUsuarioQuery = 'SELECT * FROM usuario WHERE idUsuario = ?';
    const [usuario] = await db.query(verificarUsuarioQuery, [idUsuario]);

    // Se o usuário não existir
    if (usuario.length === 0) {
      return res.status(404).send('Usuário não encontrado.');
    }

    // Atualizar a foto do usuário
    const updateQuery = 'UPDATE usuario SET foto_usuario = ? WHERE idUsuario = ?';
    await db.query(updateQuery, [foto_usuario, idUsuario]);

    res.status(200).send('Foto do usuário cadastrada com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = router;
