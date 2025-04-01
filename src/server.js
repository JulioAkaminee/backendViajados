require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importando o CORS
const app = express();
const porta = process.env.PORT || 3000;

const cadastro = require("./routes/cadastro");
const login = require("./routes/login");
const alterarSenha = require("./routes/alterarSenha");
const hoteis = require("./routes/hoteis");
const voos = require("./routes/voos");
const favoritos = require("./routes/favoritos");
const alterarDados = require("./routes/alterarDados");
const verificarToken = require("./middlewares/verificarToken");
const salvarimagem = require("./routes/salvar-imagem")
const reservas = require("./routes/reservas")


app.use(cors());


app.use(express.json());

// Rotas públicas
app.use("/api/cadastro", cadastro);
app.use("/api/login", login);
app.use("/api/alterarsenha", alterarSenha);

// Middleware de autenticação
app.use(verificarToken);

// Rotas protegidas (exigem token)
app.use("/api/hoteis", hoteis);
app.use("/api/voos", voos);
app.use("/api/favoritos", favoritos);
app.use("/api/alterardados", alterarDados);
app.use("/api/salvar-imagem",salvarimagem);
app.use("/api/reservas",reservas);


app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
