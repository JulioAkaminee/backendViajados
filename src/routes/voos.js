const express = require("express");

const db = require("../db/conn.js");

const router = express.Router();

router.get("/", async (req, res) => {

const queryVoos = "SELECT * fROM voos";

try {
    const [result] = await db.query(queryVoos);
    if (result.length === 0) {
        return res.status(404).send({ message: "Nenhum hotel encontrado" });
    }
    res.json(result)
} catch (err) {
    console.error('Erro ao buscar voos:', err);
    res.status(500).send({message: "erro interno ao buscar voos"})
}
})

module.exports = router;