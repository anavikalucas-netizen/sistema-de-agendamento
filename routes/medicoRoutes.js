const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// Cadastrar médico
router.post("/", async (req, res) => {
    try {
        const { nome, especialidade, crm } = req.body;

        if (!nome || !especialidade || !crm) {
            return res.status(400).json({
                mensagem: "Nome, especialidade e CRM são obrigatórios."
            });
        }

        const medico = await prisma.medico.create({
            data: {
                nome: nome.trim(),
                especialidade: especialidade.trim(),
                crm: crm.trim()
            }
        });

        return res.status(201).json({
            mensagem: "Médico cadastrado com sucesso!",
            medico
        });

    } catch (erro) {
        if (erro.code === "P2002") {
            return res.status(409).json({
                mensagem: "Este CRM já está cadastrado."
            });
        }

        console.error("Erro ao cadastrar médico:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar médico."
        });
    }
});

// Consultar médicos
router.get("/", async (req, res) => {
    try {
        const medicos = await prisma.medico.findMany({
            orderBy: {
                nome: "asc"
            }
        });

        return res.json(medicos);

    } catch (erro) {
        console.error("Erro ao consultar médicos:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar médicos."
        });
    }
});

module.exports = router;