const express = require("express");
const db = require("../db/conn");
const { Storage, File } = require("megajs");
require("dotenv").config();

const router = express.Router();

const storage = new Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
});

async function conectarMega() {
  return new Promise((resolve, reject) => {
    storage.login((err) => {
      if (err) {
        console.error("Erro ao conectar ao MEGA:", err);
        return reject(err);
      }
      console.log("✅ Conectado ao MEGA!");
      resolve();
    });
  });
}

router.post("/", async (req, res) => {
  const { idUsuario, imagemBase64, nomeArquivo } = req.body;

  if (!idUsuario || !imagemBase64 || !nomeArquivo) {
    return res.status(400).json({ error: "Usuário, nome do arquivo ou imagem ausente" });
  }

  try {
    await conectarMega();

    const buffer = Buffer.from(imagemBase64, "base64");

    const file = storage.upload({
      name: nomeArquivo,
      size: buffer.length,
    });

    file.write(buffer);
    file.end();

    file.on("complete", async () => {
      console.log("✅ Upload concluído!");

      // Buscar o arquivo no MEGA
      const arquivos = await storage.mount(); // Lista os arquivos no MEGA
      const arquivoSalvo = arquivos.children.find((f) => f.name === nomeArquivo);

      if (!arquivoSalvo) {
        return res.status(500).json({ error: "Erro ao recuperar o arquivo do MEGA" });
      }

      const fileLink = await arquivoSalvo.link(); // Obtém o link do arquivo
      console.log("🔗 Link do arquivo:", fileLink);

      // Salvar no banco de dados
      const sql = "UPDATE usuarios SET foto_usuario = ? WHERE idUsuario = ?";
      db.query(sql, [fileLink, idUsuario], (err) => {
        if (err) {
          console.error("Erro ao salvar no banco:", err);
          return res.status(500).json({ error: "Erro no banco de dados" });
        }
        res.json({ message: "Imagem salva com sucesso!", foto_usuario: fileLink });
      });
    });
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    res.status(500).json({ error: "Erro no upload para MEGA" });
  }
});

module.exports = router;
