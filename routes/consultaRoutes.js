const express = require("express");

const router = express.Router();

// Criar agendamento de consulta
router.post("/", (req, res) => {
    const { usuarioId, medicoId, horarioId } = req.body;

    if (!usuarioId || !medicoId || !horarioId) {
        return res.status(400).json({
            mensagem: "Usuário, médico e horário são obrigatórios."
        });
    }

    res.status(201).json({
        mensagem: "Consulta agendada com sucesso!",
        consulta: {
            usuarioId,
            medicoId,
            horarioId,
            status: "agendada"
        }
    });
});

// Consultar agendamentos
router.get("/", (req, res) => {
    res.json({
        mensagem: "Consulta de agendamentos funcionando!"
    });
});

module.exports = router;