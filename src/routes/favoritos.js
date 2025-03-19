const express = require("express");

const db = require("../db/conn.js");

const router = express.Router();

router.get("/voos", async (req, res) => {
    const queryFavoritos = `
        SELECT v.*
        FROM voos v
        INNER JOIN favoritos_voos fv ON v.idVoos = fv.idVoos
    `;

    try {
        const [result] = await db.query(queryFavoritos);
        
        if (result.length === 0) {
            return res.status(404).send({ message: "Nenhum voo favoritado encontrado" });
        }

  
        console.log("ID do primeiro voo favoritado:", result[0].idVoo);
        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar voos favoritos:', err);
        res.status(500).send({ message: "Erro interno ao buscar voos favoritos" });
    }
});



router.get("/hoteis", async (req, res) => {
   
    const queryFavoritos = `
    SELECT v.*
    FROM hoteis v
    INNER JOIN favoritos_hoteis fv ON v.idHoteis = fv.idHoteis
`;


try {
    const [result] = await db.query(queryFavoritos);
    if (result.length === 0) {
        return res.status(404).send({ message: "Nenhum hotel favoritado encontrado" });
    }
    res.json(result)
} catch (err) {
    console.error('Erro ao buscar voos favoritos:', err);
    res.status(500).send({message: "erro interno ao buscar hoteis favoritos"})
}
})

module.exports = router;