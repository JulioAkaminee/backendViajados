const express = require("express");
const conn = require("../db/conn");

const router = express.Router();

// Rota para listar reservas de voos de um usuário
router.get("/voos/:idUsuario", async (req, res) => {
    try {
        const idUsuario = req.params.idUsuario;

        const [rows] = await conn.execute(
            `SELECT r.idReserva, r.idVoos, r.data_reserva, r.status,
                    v.origem, v.destino, v.preco, v.data AS data_voo
             FROM reserva_voo r
             JOIN voos v ON r.idVoos = v.idVoos
             WHERE r.idUsuario = ?`,
            [idUsuario]
        );

        res.json({
            status: "Sucesso ao listar voos agendados",
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar reservas de voos"
        });
    }
});

// Rota para listar hospedagens de um usuário
router.get("/hospedagens/:idUsuario", async (req, res) => {
    try {
        const idUsuario = req.params.idUsuario;

        const [rows] = await conn.execute(
            `SELECT h.idHospedagem, h.idHoteis, h.data_entrada, h.data_saida, h.status,
                    ht.nome, ht.preco_diaria, ht.descricao, ht.avaliacao
             FROM hospedagem h
             JOIN hoteis ht ON h.idHoteis = ht.idHoteis
             WHERE h.idUsuario = ?`,
            [idUsuario]
        );

        res.json({
            status: "Sucesso ao listar hoteis reservados",
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar hospedagens"
        });
    }
});

// Rota para cadastrar uma reserva de voo
router.post("/voos", async (req, res) => {
    try {
        const { idVoos, idUsuario, data_reserva } = req.body;

        if (!idVoos || !idUsuario || !data_reserva) {
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios: idVoos, idUsuario e data_reserva"
            });
        }

        // Verificar se a reserva já existe para esse voo e usuário
        const [existingVoo] = await conn.execute(
            `SELECT idReserva FROM reserva_voo 
             WHERE idVoos = ? AND idUsuario = ?`,
            [idVoos, idUsuario]
        );

        if (existingVoo.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Este voo já foi reservado por este usuário"
            });
        }

        // Adicionar status 'agendado' na reserva
        const [result] = await conn.execute(
            `INSERT INTO reserva_voo (idVoos, idUsuario, data_reserva, status)
             VALUES (?, ?, ?, 'agendado')`,
            [idVoos, idUsuario, data_reserva]
        );

        res.status(201).json({
            success: true,
            message: "Reserva de voo cadastrada com sucesso",
            idReserva: result.insertId
        });
    } catch (error) {
        console.error(error);
        if (error.code === "ER_DUP_ENTRY") {
            res.status(409).json({
                success: false,
                message: "Este voo já foi reservado por este usuário"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Erro ao cadastrar reserva de voo"
            });
        }
    }
});

// Rota para cadastrar uma reserva de hospedagem
router.post("/hospedagens", async (req, res) => {
    try {
        const { idHoteis, idUsuario, data_entrada, data_saida } = req.body;

        // Validação básica
        if (!idHoteis || !idUsuario || !data_entrada || !data_saida) {
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios: idHoteis, idUsuario, data_entrada e data_saida"
            });
        }

        // Verificar se a hospedagem já existe para esse hotel e usuário
        const [existingHotel] = await conn.execute(
            `SELECT idHospedagem FROM hospedagem 
             WHERE idHoteis = ? AND idUsuario = ?`,
            [idHoteis, idUsuario]
        );

        if (existingHotel.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Este hotel já foi reservado por este usuário"
            });
        }

        // Adicionar status 'agendado' na reserva
        const [result] = await conn.execute(
            `INSERT INTO hospedagem (idHoteis, idUsuario, data_entrada, data_saida, status)
             VALUES (?, ?, ?, ?, 'agendado')`,
            [idHoteis, idUsuario, data_entrada, data_saida]
        );

        res.status(201).json({
            success: true,
            message: "Reserva de hospedagem cadastrada com sucesso",
            idHospedagem: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Erro ao cadastrar reserva de hospedagem"
        });
    }
});

module.exports = router;
