const express = require("express");
const fuckEveline = require("./neverline.js");


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor Express rodando 🚀");
});

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

app.post("/fvckevel", async (req, res) => {
    const { code, login, password } = req.body;

    fuckEveline.fuckEveline(code, login, password)
        .then(() => {
            res.status(200).json({ message: "Acabamo patrão!" });
        })
        .catch((error) => {
            console.error("Erro ao processar a solicitação:", error);
            res.status(500).json({ error: "Ocorreu um erro ao processar a solicitação." });
        });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
