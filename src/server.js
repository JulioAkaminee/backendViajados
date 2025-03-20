require('dotenv').config();
const express = require('express');
const app = express();

const cadastro = require("./routes/cadastro");
const login = require("./routes/login");
const alterarSenha = require("./routes/alterarSenha");
const hoteis = require("./routes/hoteis");
const voos = require("./routes/voos");
const favoritos = require("./routes/favoritos");
const alterarDados = require("./routes/alterarDados");
const verificarToken = require("./middlewares/verificarToken");

app.use(express.json());

// Rotas públicas
app.use("/api/cadastro", cadastro);
app.use("/api/login", login);
app.use("/api/alterarsenha", alterarSenha);

// Middleware de verificação de token
app.use(verificarToken);

// Rotas protegidas (exigem token)
app.use("/api/hoteis", hoteis);
app.use("/api/voos", voos);
app.use("/api/favoritos", favoritos);
app.use("/api/alterardados", alterarDados);

// Exporta o app para a Vercel
module.exports = app;
