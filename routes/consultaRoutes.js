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

// Consultar uma consulta
router.get("/:id", (req, res) => {
    const { id } = req.params;

    res.json({
        mensagem: "Consulta encontrada!",
        consulta: {
            id,
            status: "agendada"
        }
    });
});

// Cancelar consulta
router.put("/:id/cancelar", (req, res) => {
    const { id } = req.params;

    res.json({
        mensagem: "Consulta cancelada com sucesso!",
        consulta: {
            id,
            status: "cancelada"
        }
    });
});

// Confirmar consulta
router.put("/:id/confirmar", (req, res) => {
    const { id } = req.params;

    res.json({
        mensagem: "Consulta confirmada com sucesso!",
        consulta: {
            id,
            status: "confirmada"
        }
    });
});

module.exports = router;