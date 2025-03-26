const express = require("express");
const db = require("../db/conn.js");

const router = express.Router();

// Busca voos favoritados
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
    console.error("Erro ao buscar voos favoritos:", err);
    res.status(500).send({ message: "Erro interno ao buscar voos favoritos" });
  }
});

// Busca hotéis favoritados
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
    console.error("Erro ao buscar hotéis favoritos:", err);
    res.status(500).send({ message: "Erro interno ao buscar hotéis favoritos" });
  }
});

// Adiciona um voo aos favoritos
router.post("/voos", async (req, res) => {
  const { idUsuario, idVoos } = req.body;

  if (!idUsuario || !idVoos) {
    return res.status(400).send({ message: "idUsuario e idVoos são obrigatórios" });
  }

  const queryInserir = `
        INSERT INTO favoritos_voos (idUsuario, idVoos)
        VALUES (?, ?)
    `;

  try {
    // Verifica se o voo já está favoritado
    const queryVerificar = `
            SELECT * FROM favoritos_voos WHERE idUsuario = ? AND idVoos = ?
        `;
    const [existe] = await db.query(queryVerificar, [idUsuario, idVoos]);

    if (existe.length > 0) {
      return res.status(409).send({ message: "Voo já está nos favoritos" });
    }

    await db.query(queryInserir, [idUsuario, idVoos]);
    res.status(201).send({ message: "Voo adicionado aos favoritos com sucesso" });
  } catch (err) {
    console.error("Erro ao adicionar voo aos favoritos:", err);
    res.status(500).send({ message: "Erro interno ao adicionar voo aos favoritos" });
  }
});

// Remove um voo dos favoritos
router.delete("/voos", async (req, res) => {
  const { idUsuario, idVoos } = req.body;

  if (!idUsuario || !idVoos) {
    return res.status(400).send({ message: "idUsuario e idVoos são obrigatórios" });
  }

  const queryRemover = `
        DELETE FROM favoritos_voos
        WHERE idUsuario = ? AND idVoos = ?
    `;

  try {
    const [result] = await db.query(queryRemover, [idUsuario, idVoos]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Voo não encontrado nos favoritos" });
    }

    res.status(200).send({ message: "Voo removido dos favoritos com sucesso" });
  } catch (err) {
    console.error("Erro ao remover voo dos favoritos:", err);
    res.status(500).send({ message: "Erro interno ao remover voo dos favoritos" });
  }
});

// Adiciona um hotel aos favoritos
router.post("/hoteis", async (req, res) => {
  const { idUsuario, idHoteis } = req.body;

  if (!idUsuario || !idHoteis) {
    return res.status(400).send({ message: "idUsuario e idHoteis são obrigatórios" });
  }

  const queryInserir = `
        INSERT INTO favoritos_hoteis (idUsuario, idHoteis)
        VALUES (?, ?)
    `;

  try {
    // Verifica se o hotel já está favoritado
    const queryVerificar = `
            SELECT * FROM favoritos_hoteis WHERE idUsuario = ? AND idHoteis = ?
        `;
    const [existe] = await db.query(queryVerificar, [idUsuario, idHoteis]);

    if (existe.length > 0) {
      return res.status(409).send({ message: "Hotel já está nos favoritos" });
    }

    await db.query(queryInserir, [idUsuario, idHoteis]);
    res.status(201).send({ message: "Hotel adicionado aos favoritos com sucesso" });
  } catch (err) {
    console.error("Erro ao adicionar hotel aos favoritos:", err);
    res.status(500).send({ message: "Erro interno ao adicionar hotel aos favoritos" });
  }
});

// Remove um hotel dos favoritos
router.delete("/hoteis", async (req, res) => {
  const { idUsuario, idHoteis } = req.body;

  if (!idUsuario || !idHoteis) {
    return res.status(400).send({ message: "idUsuario e idHoteis são obrigatórios" });
  }

  const queryRemover = `
        DELETE FROM favoritos_hoteis
        WHERE idUsuario = ? AND idHoteis = ?
    `;

  try {
    const [result] = await db.query(queryRemover, [idUsuario, idHoteis]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Hotel não encontrado nos favoritos" });
    }

    res.status(200).send({ message: "Hotel removido dos favoritos com sucesso" });
  } catch (err) {
    console.error("Erro ao remover hotel dos favoritos:", err);
    res.status(500).send({ message: "Erro interno ao remover hotel dos favoritos" });
  }
});

module.exports = router;