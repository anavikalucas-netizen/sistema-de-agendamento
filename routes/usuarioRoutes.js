const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({
            mensagem: "Nome, email e senha são obrigatórios."
        });
    }

    res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        usuario: {
            nome,
            email,
            telefone
        }
    });
});

module.exports = router;