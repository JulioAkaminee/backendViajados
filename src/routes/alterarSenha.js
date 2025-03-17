const express = require("express");
const db = require("../db/conn.js");

const router = express.Router();

router.post('/', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send({ error: 'O campo e-mail é obrigatório.' });
    }
  
    try {
      // Verificar se o usuário existe
      const [user] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  
      if (user.length === 0) {
        return res.status(404).send({ error: 'Usuário não encontrado.' });
      }
  
      // Envia um e-mail com instruções de recuperação de senha
      const resetLink = ``;
      await sendEmail(email, 'Recuperação de Senha', `Clique no link para redefinir sua senha: ${resetLink}`);
  
      return res.status(200).send({ message: 'E-mail enviado com sucesso.' });
    } catch (err) {
      console.error('Erro ao processar recuperação de senha:', err);
      return res.status(500).send({ error: 'Erro ao processar a solicitação.' });
    }
  });