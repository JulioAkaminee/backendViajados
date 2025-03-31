const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/conn.js");

const router = express.Router();

router.post("/", async (req, res) => {
    const { email, senha, nome, cpf, nacionalidade, sexo, ativo } = req.body;

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!email || !senha || !nome || !cpf || !sexo) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email inválido." });
    }

    // Validação de CPF (algoritmo oficial)
    const validarCpf = (cpf) => {
        cpf = cpf.replace(/\D/g, "");
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0, resto;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(cpf.charAt(10));
    };

    if (!validarCpf(cpf)) {
        return res.status(400).json({ error: "CPF inválido." });
    }

    // Validação do sexo
    if (!["M", "F"].includes(sexo)) {
        return res.status(400).json({ error: "Sexo deve ser M ou F." });
    }

    // Verifica se o email ou CPF já existe no banco de dados
    try {
        const [rows] = await db.query("SELECT idUsuario FROM usuario WHERE email = ? OR cpf = ?", [email, cpf]);
        if (rows.length > 0) {
            return res.status(409).json({ error: "Email ou CPF já cadastrado." });
        }

        // Criptografando a senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Inserindo usuário no banco de dados
        const [result] = await db.query(
            "INSERT INTO usuario (email, senha, nome, ativo, cpf, nacionalidade, sexo) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [email, hashedPassword, nome, ativo !== undefined ? ativo : 1, cpf, nacionalidade || null, sexo]
        );

        return res.status(201).json({ message: "Usuário cadastrado com sucesso!", idUsuario: result.insertId });
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        return res.status(500).json({ error: "Erro interno ao registrar usuário." });
    }
});

module.exports = router;
