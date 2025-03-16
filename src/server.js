require('dotenv').config();
const express = require('express');
const app = express();
const porta = process.env.PORT
const { testarConexao } = require('../src/db/conn');

const index = require("./routes/index")

testarConexao()

app.use(express.json());
app.use("/", index)

app.listen(porta, () => {
  console.log(`Servidor rodando na porta http://localhost:${porta}`);
});