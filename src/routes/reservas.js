const express = require("express");
const conn = require("../db/conn");

const router = express.Router();

// Função auxiliar para validar datas
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

// Rota para listar reservas de voos de um usuário
router.get("/voos/:idUsuario", async (req, res) => {
    try {
        const idUsuario = parseInt(req.params.idUsuario);
        if (isNaN(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                success: false,
                message: "ID de usuário inválido"
            });
        }

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
        const idUsuario = parseInt(req.params.idUsuario);
        if (isNaN(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                success: false,
                message: "ID de usuário inválido"
            });
        }

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

router.post("/voos", async (req, res) => {
    try {
        const { idVoos, idUsuario, data_reserva } = req.body;

        // Validações
        if (!idVoos || !idUsuario || !data_reserva) {
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios: idVoos, idUsuario e data_reserva"
            });
        }

        const idVoosNum = parseInt(idVoos);
        const idUsuarioNum = parseInt(idUsuario);
        
        if (isNaN(idVoosNum) || idVoosNum <= 0 || isNaN(idUsuarioNum) || idUsuarioNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "IDs devem ser números positivos"
            });
        }

        if (!isValidDate(data_reserva)) {
            return res.status(400).json({
                success: false,
                message: "Data de reserva inválida"
            });
        }

        const hoje = new Date();
        if (new Date(data_reserva) < hoje.setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                success: false,
                message: "Data de reserva não pode ser anterior ao dia atual"
            });
        }

        // Verificar se o voo existe
        const [voo] = await conn.execute(
            `SELECT idVoos, data AS data_voo FROM voos WHERE idVoos = ?`,
            [idVoosNum]
        );
        if (voo.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Voo não encontrado"
            });
        }

        // Verificar duplicidade com base em idUsuario e idVoos
        const [existingReservations] = await conn.execute(
            `SELECT idReserva, data_reserva
             FROM reserva_voo
             WHERE idVoos = ? 
             AND idUsuario = ?
             AND status NOT IN ('cancelado')`,
            [idVoosNum, idUsuarioNum]
        );

        if (existingReservations.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Você já possui uma reserva para este voo",
                conflictingReservations: existingReservations
            });
        }

        const [result] = await conn.execute(
            `INSERT INTO reserva_voo (idVoos, idUsuario, data_reserva, status)
             VALUES (?, ?, ?, 'agendado')`,
            [idVoosNum, idUsuarioNum, data_reserva]
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
                message: "Você já possui uma reserva para este voo",
                errorDetails: error.sqlMessage
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Erro ao cadastrar reserva de voo",
                errorDetails: error.message
            });
        }
    }
});

// Rota para cadastrar uma reserva de hospedagem
router.post("/hospedagens", async (req, res) => {
    try {
        const { idHoteis, idUsuario, data_entrada, data_saida } = req.body;

        // Validações
        if (!idHoteis || !idUsuario || !data_entrada || !data_saida) {
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios: idHoteis, idUsuario, data_entrada e data_saida"
            });
        }

        const idHoteisNum = parseInt(idHoteis);
        const idUsuarioNum = parseInt(idUsuario);

        if (isNaN(idHoteisNum) || idHoteisNum <= 0 || isNaN(idUsuarioNum) || idUsuarioNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "IDs devem ser números positivos"
            });
        }

        if (!isValidDate(data_entrada) || !isValidDate(data_saida)) {
            return res.status(400).json({
                success: false,
                message: "Datas inválidas"
            });
        }

        const entrada = new Date(data_entrada);
        const saida = new Date(data_saida);
        const hoje = new Date();

        if (entrada < hoje.setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                success: false,
                message: "Data de entrada não pode ser anterior ao dia atual"
            });
        }

        if (entrada >= saida) {
            return res.status(400).json({
                success: false,
                message: "Data de entrada deve ser anterior à data de saída"
            });
        }

        // Verificar se o hotel existe
        const [hotel] = await conn.execute(
            `SELECT idHoteis FROM hoteis WHERE idHoteis = ?`,
            [idHoteisNum]
        );
        if (hotel.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hotel não encontrado"
            });
        }

        // Verificar se há conflito de datas com reservas existentes
        const [existingBookings] = await conn.execute(
            `SELECT idHospedagem, data_entrada, data_saida 
             FROM hospedagem 
             WHERE idHoteis = ? 
             AND idUsuario = ? 
             AND status NOT IN ('cancelado') 
             AND (
                 (data_entrada <= ? AND data_saida >= ?) OR
                 (data_entrada <= ? AND data_saida >= ?) OR
                 (data_entrada >= ? AND data_saida <= ?)
             )`,
            [
                idHoteisNum,
                idUsuarioNum,
                data_saida,
                data_entrada,
                data_saida,
                data_entrada,
                data_entrada,
                data_saida
            ]
        );

        if (existingBookings.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Já existe uma reserva para este hotel neste período",
                conflictingBookings: existingBookings
            });
        }

        const [result] = await conn.execute(
            `INSERT INTO hospedagem (idHoteis, idUsuario, data_entrada, data_saida, status)
             VALUES (?, ?, ?, ?, 'agendado')`,
            [idHoteisNum, idUsuarioNum, data_entrada, data_saida]
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