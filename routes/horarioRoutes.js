const express = require("express");

const router = express.Router();

// Criar horário disponível
router.post("/", (req, res) => {
    const { medicoId, data } = req.body;

    if (!medicoId || !data) {
        return res.status(400).json({
            mensagem: "Médico e data do horário são obrigatórios."
        });
    }

    res.status(201).json({
        mensagem: "Horário disponível criado com sucesso!",
        horario: {
            medicoId,
            data,
            disponivel: true
        }
    });
});

// Consultar horários disponíveis
router.get("/", (req, res) => {
    res.json({
        mensagem: "Consulta de horários disponíveis funcionando!"
    });
});

module.exports = router;