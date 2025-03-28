const express = require("express");
const db = require("../db/conn");
const axios = require("axios"); // Para fazer requisição HTTP
const util = require("util");
require("dotenv").config();

const router = express.Router();

const query = util.promisify(db.query).bind(db);

// O Client-ID do Imgur
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID; // Adicione seu Client-ID no .env

// Verificar se o Client-ID do Imgur está configurado corretamente
if (!IMGUR_CLIENT_ID) {
  console.error("Erro: Client-ID do Imgur não configurado no .env");
  process.exit(1);
}

// Função para fazer upload para o Imgur
const uploadToImgur = async (buffer, nomeArquivo) => {
  try {
    // Fazendo o upload da imagem para o Imgur
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      buffer,
      {
        headers: {
          "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`,
          "Content-Type": "multipart/form-data"
        },
        params: {
          type: "base64",
          name: nomeArquivo
        }
      }
    );

    // Retorna a URL da imagem no Imgur
    return response.data.data.link;
  } catch (error) {
    console.error("Erro ao fazer upload para o Imgur:", error);
    throw new Error("Falha ao fazer upload para o Imgur");
  }
};

router.post("/", async (req, res) => {
  const { idUsuario, imagemBase64, nomeArquivo } = req.body;

  console.log("Requisição recebida:", { idUsuario, imagemBase64, nomeArquivo });

  if (!idUsuario || !imagemBase64 || !nomeArquivo) {
    return res.status(400).json({ error: "Usuário, nome do arquivo ou imagem ausente" });
  }

  // Verificar se o formato da imagem é base64
  if (!/^data:image\/[a-zA-Z]+;base64,/.test(imagemBase64)) {
    return res.status(400).json({ error: "Imagem não está no formato base64 válido" });
  }

  const base64Parts = imagemBase64.split(",");
  if (base64Parts.length < 2) {
    return res.status(400).json({ error: "Formato base64 inválido: faltando dados após a vírgula" });
  }

  const base64Data = base64Parts[1];
  if (!base64Data || base64Data.trim() === "") {
    return res.status(400).json({ error: "Dados base64 vazios ou inválidos" });
  }

  try {
    // Converte a string base64 para buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Faz o upload da imagem para o Imgur
    const fileLink = await uploadToImgur(buffer, nomeArquivo);

    // Atualiza a tabela 'usuarios' com a URL da foto no Imgur
    await query("UPDATE usuarios SET foto_usuario = ? WHERE idUsuario = ?", [fileLink, idUsuario]);

    // Responde com sucesso
    res.json({ message: "Imagem salva com sucesso!", foto_usuario: fileLink });
  } catch (error) {
    console.error("Erro no processo de upload:", error);
    res.status(500).json({ error: "Erro no upload para o Imgur ou no banco de dados" });
  }
});

module.exports = router;
