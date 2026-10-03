const express = require("express");

const router = express.Router();

// Cadastrar médico
router.post("/", (req, res) => {
    const { nome, especialidade, crm } = req.body;

    if (!nome || !especialidade || !crm) {
        return res.status(400).json({
            mensagem: "Nome, especialidade e CRM são obrigatórios."
        });
    }

    res.status(201).json({
        mensagem: "Médico cadastrado com sucesso!",
        medico: {
            nome,
            especialidade,
            crm
        }
    });
});

// Consultar médicos
router.get("/", (req, res) => {
    res.json({
        mensagem: "Consulta de médicos funcionando!"
    });
});

module.exports = router;