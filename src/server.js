require('dotenv').config();
const express = require('express');
const app = express();
<<<<<<< HEAD
const porta = process.env.PORT || 3000;
=======
>>>>>>> 5737cbf5c0455eba04a1ad9b42a231c769cfc7b5

const cadastro = require("./routes/cadastro");
const login = require("./routes/login");
const alterarSenha = require("./routes/alterarSenha");
const hoteis = require("./routes/hoteis");
const voos = require("./routes/voos");
const favoritos = require("./routes/favoritos");
const alterarDados = require("./routes/alterarDados");
const verificarToken = require("./middlewares/verificarToken");

// Middleware para parsing de JSON
app.use(express.json());

// Rotas públicas
app.use("/api/cadastro", cadastro);
app.use("/api/login", login);
app.use("/api/alterarsenha", alterarSenha);

<<<<<<< HEAD
// Middleware de autenticação
=======
// Middleware de verificação de token
>>>>>>> 5737cbf5c0455eba04a1ad9b42a231c769cfc7b5
app.use(verificarToken);

// Rotas protegidas (exigem token)
app.use("/api/hoteis", hoteis);
app.use("/api/voos", voos);
app.use("/api/favoritos", favoritos);
app.use("/api/alterardados", alterarDados);

<<<<<<< HEAD
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
=======
// Exporta o app para a Vercel
module.exports = app;
>>>>>>> 5737cbf5c0455eba04a1ad9b42a231c769cfc7b5
