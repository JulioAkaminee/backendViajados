const express = require("express");
const bcrypt = require('bcryptjs');
const db = require("../db/conn.js");

const router = express.Router();

router.post("/", async (req, res) => {
    const { email, senha, nome, cpf, data_nascimento, nacionalidade, sexo, ativo } = req.body;

    if (!email || !senha || !nome || !cpf || !data_nascimento || !sexo) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    if (cpf.replace(/[^\d]+/g, '').length !== 11) {
        return res.status(400).json({ error: "CPF inválido." });
    }

    if (!['M', 'F'].includes(sexo)) {
        return res.status(400).json({ error: "Sexo deve ser M ou F." });
    }

    try {
        const [rows] = await db.query("SELECT idUsuario FROM usuario WHERE email = ? OR cpf = ?", [email, cpf]);
        if (rows.length > 0) {
            return res.status(409).json({ error: "Email ou CPF já cadastrado." });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.query(
            "INSERT INTO usuario (email, senha, nome, ativo, cpf, data_nascimento, nacionalidade, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [email, hashedPassword, nome, ativo !== undefined ? ativo : 1, cpf, data_nascimento, nacionalidade || null, sexo]
        );

        return res.status(201).json({ message: "Usuário cadastrado com sucesso!", idUsuario: result.insertId });
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        return res.status(500).json({ error: "Erro interno ao registrar usuário." });
    }
});

module.exports = router;