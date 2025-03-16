require('dotenv').config();
const express = require('express');
const app = express();
const porta = process.env.PORT
const { testarConexao } = require('../src/db/conn');
const cadastro = require("./routes/cadastro")


app.use(express.json());
app.use("/api/cadastro", cadastro)

app.listen(porta, () => {
  console.log(`Servidor rodando na porta http://localhost:${porta}`);
});