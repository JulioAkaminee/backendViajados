const express = require("express");
const db = require("../db/conn");
const { Storage } = require("megajs");
const util = require("util");
require("dotenv").config();

const router = express.Router();

if (!process.env.MEGA_EMAIL || !process.env.MEGA_PASSWORD) {
  console.error("Erro: Credenciais do MEGA não configuradas no .env");
  process.exit(1);
}

const storage = new Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
});

let isMegaConnected = false;

async function initializeMega() {
  if (!isMegaConnected) {
    await storage.ready;
    isMegaConnected = true;
    console.log("✅ Conectado ao MEGA!");
  }
}

const uploadToMega = async (buffer, nomeArquivo) => {
  try {
    const file = storage.root.upload({
      name: nomeArquivo,
      size: buffer.length,
    });
    file.write(buffer);
    file.end();
    const uploadedFile = await file.complete;
    return uploadedFile;
  } catch (error) {
    console.error("Erro no upload para o Mega:", error);
    throw new Error("Falha ao fazer upload para o Mega");
  }
};

const query = util.promisify(db.query).bind(db);

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
    await initializeMega(); // Conecta-se ao Mega se ainda não estiver conectado
    const buffer = Buffer.from(base64Data, "base64");
    const uploadedFile = await uploadToMega(buffer, nomeArquivo);
    const fileLink = await uploadedFile.link(); // Obtém o link da imagem no Mega

    // Atualiza a tabela 'usuarios' com a URL do arquivo no Mega
    await query("UPDATE usuarios SET foto_usuario = ? WHERE idUsuario = ?", [fileLink, idUsuario]);

    // Responde com sucesso
    res.json({ message: "Imagem salva com sucesso!", foto_usuario: fileLink });
  } catch (error) {
    console.error("Erro no processo de upload:", error);
    res.status(500).json({ error: "Erro no upload para MEGA ou no banco de dados" });
  }
});

module.exports = router;
