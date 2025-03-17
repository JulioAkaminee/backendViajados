const express = require("express");
const bcrypt = require('bcryptjs');
const db = require("../db/conn.js");

const router = express.Router();

router.post("/", async (req, res) => {
const {email, senha} = req.body;

if(!email || !senha){
    return (res.status(400).json({error: "Preencha todos os campos"}))
}

try{
    // Verifica se o usuário existe no banco de dados
    const [rows] = await db.query("SELECT idUsuario, nome, senha FROM usuario WHERE email = ?", [email]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado." });
    }

    //Atribuindo informações do banco de dados do usuario a uma variavel usuario
     const usuario = rows[0];
     
     // Verifica se a senha está correta
    const isPasswordCorrect = await bcrypt.compare(senha, usuario.senha);
     if (!isPasswordCorrect) {  return res.status(401).json({ error: "Senha incorreta." });}

     return res.status(200).json({
        message: "Login realizado com sucesso.",
        usuario: {
            idUsuario: usuario.id,
            nome: usuario.nome,
            email: email,
        },
    });
          
  
}catch(err){
    console.error("Erro ao realizar login:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
}
})

module.exports = router;