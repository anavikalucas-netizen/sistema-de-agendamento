const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// Criar horário disponível
router.post("/", async (req, res) => {
    try {
        const { medicoId, data } = req.body;

        if (!medicoId || !data) {
            return res.status(400).json({
                mensagem: "Médico e data do horário são obrigatórios."
            });
        }

        const medico = await prisma.medico.findUnique({
            where: {
                id: medicoId
            }
        });

        if (!medico) {
            return res.status(404).json({
                mensagem: "Médico não encontrado."
            });
        }

        const horario = await prisma.horario.create({
            data: {
                medicoId,
                data: new Date(data),
                disponivel: true
            }
        });

        return res.status(201).json({
            mensagem: "Horário disponível criado com sucesso!",
            horario
        });

    } catch (erro) {
        console.error("Erro ao criar horário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao criar horário."
        });
    }
});

// Consultar horários disponíveis
router.get("/", async (req, res) => {
    try {
        const horarios = await prisma.horario.findMany({
            where: {
                disponivel: true
            },
            include: {
                medico: true
            },
            orderBy: {
                data: "asc"
            }
        });

        return res.json(horarios);

    } catch (erro) {
        console.error("Erro ao consultar horários:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar horários."
        });
    }
});

module.exports = router;