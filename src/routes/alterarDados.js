const express = require("express");
const bcrypt = require('bcryptjs');
const db = require("../db/conn.js");

const router = express.Router();

router.put("/", async (req, res) => {
    const idUsuario = req.query.idUsuario; 
    const { nome } = req.body; 
    

    if (!idUsuario) {
        return res.status(400).send({ message: "idUsuario é obrigatório" });
    }

    const queryAlterarDadosUsuario = "UPDATE usuario SET nome = ? WHERE idUsuario = ?";

    try {
        const [result] = await db.query(queryAlterarDadosUsuario, [nome, idUsuario]);
        
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }
        
        res.send({ message: "Dados do usuário atualizados com sucesso" });
    } catch (err) {
        console.error('Erro ao atualizar dados do usuário:', err);
        res.status(500).send({ message: "Erro interno ao atualizar dados do usuário" });
    }
});

module.exports = router;