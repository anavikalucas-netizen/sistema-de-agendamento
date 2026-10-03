const express = require("express");
const cors = require("cors");
const usuarioRoutes = require("./routes/usuarioRoutes");
const medicoRoutes = require("./routes/medicoRoutes");
const horarioRoutes = require("./routes/horarioRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/usuarios", usuarioRoutes);
app.use("/medicos", medicoRoutes);
app.use("/horarios", horarioRoutes);
app.get("/", (req, res) => {
    res.json({
        mensagem: "API Agenda Cidade funcionando!"
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});