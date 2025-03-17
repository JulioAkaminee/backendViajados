require('dotenv').config();
const express = require('express');
const app = express();
const porta = process.env.PORT

const cadastro = require("./routes/cadastro")
const login = require("./routes/login")


app.use(express.json());
app.use("/api/cadastro", cadastro)
app.use("/api/login", login)

app.listen(porta, () => {
  console.log(`Servidor rodando na porta http://localhost:${porta}`);
});