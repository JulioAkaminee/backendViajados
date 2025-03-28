const express = require("express");
const db = require("../db/conn");
const { Storage } = require("megajs");
const util = require("util");
require("dotenv").config();

const router = express.Router();

// Configuração do MEGA
const storage = new Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
});

let isMegaConnected = false;

async function initializeMega() {
  if (!isMegaConnected) {
    await Promise.race([
      new Promise((resolve, reject) => {
        storage.login((err) => {
          if (err) return reject(err);
          isMegaConnected = true;
          resolve();
        });
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout na conexão com o MEGA")), 10000)
      ),
    ]);
    console.log("✅ Conectado ao MEGA!");
  }
}

const uploadToMega = (buffer, nomeArquivo) => {
  return new Promise((resolve, reject) => {
    const file = storage.root.upload({
      name: nomeArquivo,
      size: buffer.length,
    });
    file.write(buffer);
    file.end();
    file.on("complete", () => resolve(file));
    file.on("error", (err) => reject(err));
  });
};

const query = util.promisify(db.query).bind(db);

router.post("/", async (req, res) => {
  const { idUsuario, imagemBase64, nomeArquivo } = req.body;

  if (!idUsuario || !imagemBase64 || !nomeArquivo) {
    return res.status(400).json({ error: "Usuário, nome do arquivo ou imagem ausente" });
  }

  if (!/^data:image\/[a-zA-Z]*;base64,/.test(imagemBase64)) {
    return res.status(400).json({ error: "Imagem não está no formato base64" });
  }

  try {
    await initializeMega();

    const base64Data = imagemBase64.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ error: "Imagem Base64 inválida" });
    }

    const buffer = Buffer.from(base64Data, "base64");
    const uploadedFile = await uploadToMega(buffer, nomeArquivo);
    const fileLink = await uploadedFile.link();

    await query("UPDATE usuarios SET foto_usuario = ? WHERE idUsuario = ?", [fileLink, idUsuario]);

    res.json({ message: "Imagem salva com sucesso!", foto_usuario: fileLink });
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    res.status(500).json({ error: "Erro no upload para MEGA ou banco de dados" });
  }
});

module.exports = router;