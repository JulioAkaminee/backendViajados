const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
const db = require("../db/conn.js");
const verificarToken = require("../middlewares/verificarToken.js")

const router = express.Router();


const chaveSecreta =  process.env.SECRET_KEY;

router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  // Validação dos campos
  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  try {
    // Verifica se o usuário existe no banco de dados
    const [rows] = await db.query(
      "SELECT idUsuario, nome, senha FROM usuario WHERE email = ? AND ativo = 1",
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }


    const usuario = rows[0];

    // Verifica se a senha está correta
    const isPasswordCorrect = await bcrypt.compare(senha, usuario.senha);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Gerar o token JWT
    const token = jwt.sign(
      {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: email,
      },
      chaveSecreta,
      { expiresIn: "1h" } 
    );

    // Retorna o token e informações do usuário
    return res.status(200).json({
      message: "Login realizado com sucesso.",
      token: token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: email,
      },
    });
  } catch (err) {
    console.error("Erro ao realizar login:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});





module.exports = router;