const express = require("express");

const db = require("../db/conn.js");

const router = express.Router();

router.get("/", async (req, res) => {
  
const queryHoteis = "SELECT * fROM hoteis";

try {
    const [result] = await db.query(queryHoteis);
    if (result.length === 0) {
        return res.status(404).send({ message: "Nenhum hotel encontrado" });
    }
    res.json(result)
} catch (err) {
    console.error('Erro ao buscar hoteis:', err);
    res.status(500).send({message: "erro interno ao buscar hoteis"})
}
})

module.exports = router;