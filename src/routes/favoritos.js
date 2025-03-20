const express = require("express");
const db = require("../db/conn.js");

const router = express.Router();

router.get("/voos", async (req, res) => {
    const idUsuario = req.query.idUsuario; 

    if (!idUsuario) {
        return res.status(400).send({ message: "idUsuario é obrigatório" });
    }

    const queryFavoritos = `
        SELECT v.*
        FROM voos v
        INNER JOIN favoritos_voos fv ON v.idVoos = fv.idVoos
        WHERE fv.idUsuario = ?
    `;

    try {
        const [result] = await db.query(queryFavoritos, [idUsuario]);
        
        if (result.length === 0) {
            return res.status(404).send({ message: "Nenhum voo favoritado encontrado para este usuário" });
        }
        
        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar voos favoritos:', err);
        res.status(500).send({ message: "Erro interno ao buscar voos favoritos" });
    }
});

router.get("/hoteis", async (req, res) => {
    const idUsuario = req.query.idUsuario; 

    if (!idUsuario) {
        return res.status(400).send({ message: "idUsuario é obrigatório" });
    }

    const queryFavoritos = `
        SELECT h.*
        FROM hoteis h
        INNER JOIN favoritos_hoteis fh ON h.idHoteis = fh.idHoteis
        WHERE fh.idUsuario = ?
    `;

    try {
        const [result] = await db.query(queryFavoritos, [idUsuario]);
        
        if (result.length === 0) {
            return res.status(404).send({ message: "Nenhum hotel favoritado encontrado para este usuário" });
        }
        
        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar hotéis favoritos:', err);
        res.status(500).send({ message: "Erro interno ao buscar hotéis favoritos" });
    }
});

module.exports = router;