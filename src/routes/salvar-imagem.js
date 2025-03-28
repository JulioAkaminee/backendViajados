const express = require('express');
const multer = require('multer');
const db = require("../db/conn");

// Configurar o armazenamento do multer para armazenar a foto como Blob
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Rota para cadastrar a foto do usuário específico com idUsuario
router.post("/", upload.single('foto_usuario'), async (req, res) => {
  try {
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).send('Foto do usuário é necessária.');
    }

    const foto = req.file.buffer; // Foto em formato Blob
    const { idUsuario } = req.body; // Recebe o id do usuário

    // Verificar se o idUsuario está presente
    if (!idUsuario) {
      return res.status(400).send('idUsuario é necessário.');
    }

    // Verificar se o idUsuario existe no banco de dados
    const verificarUsuarioQuery = 'SELECT * FROM usuarios WHERE id = ?';
    db.query(verificarUsuarioQuery, [idUsuario], (err, result) => {
      if (err) {
        console.error('Erro ao verificar o usuário:', err);
        return res.status(500).send('Erro ao verificar o usuário.');
      }

      // Se o usuário não existir
      if (result.length === 0) {
        return res.status(404).send('Usuário não encontrado.');
      }

      // Atualizar a foto do usuário
      const updateQuery = 'UPDATE usuarios SET foto_usuario = ? WHERE id = ?';
      db.query(updateQuery, [foto, idUsuario], (err, result) => {
        if (err) {
          console.error('Erro ao atualizar a foto do usuário:', err);
          return res.status(500).send('Erro ao cadastrar a foto do usuário.');
        }

        res.status(200).send('Foto do usuário cadastrada com sucesso!');
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = router;
