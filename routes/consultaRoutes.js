const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// Criar agendamento de consulta
router.post("/", async (req, res) => {
    try {
        const { usuarioId, medicoId, horarioId } = req.body;

        if (!usuarioId || !medicoId || !horarioId) {
            return res.status(400).json({
                mensagem: "Usuário, médico e horário são obrigatórios."
            });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const medico = await prisma.medico.findUnique({
            where: { id: medicoId }
        });

        if (!medico) {
            return res.status(404).json({
                mensagem: "Médico não encontrado."
            });
        }

        const horario = await prisma.horario.findFirst({
            where: {
                id: horarioId,
                medicoId: medicoId,
                disponivel: true
            }
        });

        if (!horario) {
            return res.status(400).json({
                mensagem: "Horário não disponível para este médico."
            });
        }

        const consulta = await prisma.$transaction(async (transacao) => {
            const atualizacao = await transacao.horario.updateMany({
                where: {
                    id: horarioId,
                    medicoId: medicoId,
                    disponivel: true
                },
                data: {
                    disponivel: false
                }
            });

            if (atualizacao.count === 0) {
                throw new Error("HORARIO_INDISPONIVEL");
            }

            return await transacao.consulta.create({
                data: {
                    usuarioId,
                    medicoId,
                    horarioId,
                    status: "agendada"
                },
                include: {
                    medico: true,
                    horario: true
                }
            });
        });

        return res.status(201).json({
            mensagem: "Consulta agendada com sucesso!",
            consulta
        });

    } catch (erro) {
        if (erro.message === "HORARIO_INDISPONIVEL") {
            return res.status(409).json({
                mensagem: "Este horário já foi reservado."
            });
        }

        console.error("Erro ao agendar consulta:", erro);

        return res.status(500).json({
            mensagem: "Erro ao agendar consulta."
        });
    }
});

// Consultar agendamentos
router.get("/", async (req, res) => {
    try {
        const consultas = await prisma.consulta.findMany({
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true
                    }
                },
                medico: true,
                horario: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.json(consultas);

    } catch (erro) {
        console.error("Erro ao consultar agendamentos:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar agendamentos."
        });
    }
});

// Consultar uma consulta
router.get("/:id", async (req, res) => {
    try {
        const consulta = await prisma.consulta.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true
                    }
                },
                medico: true,
                horario: true
            }
        });

        if (!consulta) {
            return res.status(404).json({
                mensagem: "Consulta não encontrada."
            });
        }

        return res.json(consulta);

    } catch (erro) {
        console.error("Erro ao consultar consulta:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar consulta."
        });
    }
});

// Cancelar consulta
router.put("/:id/cancelar", async (req, res) => {
    try {
        const existente = await prisma.consulta.findUnique({
            where: { id: req.params.id }
        });

        if (!existente) {
            return res.status(404).json({
                mensagem: "Consulta não encontrada."
            });
        }

        if (existente.status === "cancelada") {
            return res.json({
                mensagem: "Esta consulta já está cancelada.",
                consulta: existente
            });
        }

        await prisma.horario.update({
            where: { id: existente.horarioId },
            data: { disponivel: true }
        });

        const consulta = await prisma.consulta.update({
            where: { id: req.params.id },
            data: { status: "cancelada" }
        });

        return res.json({
            mensagem: "Consulta cancelada com sucesso!",
            consulta
        });

    } catch (erro) {
        console.error("Erro ao cancelar consulta:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cancelar consulta."
        });
    }
});

// Confirmar consulta
router.put("/:id/confirmar", async (req, res) => {
    try {
        const consulta = await prisma.consulta.update({
            where: {
                id: req.params.id
            },
            data: {
                status: "confirmada"
            }
        });

        return res.json({
            mensagem: "Consulta confirmada com sucesso!",
            consulta
        });

    } catch (erro) {
        if (erro.code === "P2025") {
            return res.status(404).json({
                mensagem: "Consulta não encontrada."
            });
        }

        console.error("Erro ao confirmar consulta:", erro);

        return res.status(500).json({
            mensagem: "Erro ao confirmar consulta."
        });
    }
});

module.exports = router;