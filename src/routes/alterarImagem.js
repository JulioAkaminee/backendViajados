const express = require("express");
const db = require("../db/conn");
const { Storage } = require("megajs");
require("dotenv").config();

const router = express.Router();

// Criar uma instância do MEGA e garantir que o login seja realizado antes do upload
const storage = new Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
});

// Função para garantir que o login foi feito corretamente
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

// Rota para upload de imagem diretamente para o MEGA
router.post("/", async (req, res) => {
  const { idUsuario, imagemBase64, nomeArquivo } = req.body;

  console.log("📥 Dados Recebidos:", req.body);
  console.log("📸 Arquivos Recebidos:", req.files);

  if (!idUsuario || !imagemBase64 || !nomeArquivo) {
    return res.status(400).json({ error: "Usuário, nome do arquivo ou imagem ausente" });
  }

  try {
    // Conectar ao MEGA antes de tentar o upload
    await conectarMega();

    // Converter base64 para Buffer
    const buffer = Buffer.from(imagemBase64, "base64");

    // Criar upload para o MEGA
    const file = storage.upload({
      name: nomeArquivo,
      size: buffer.length,
    });

    file.write(buffer);
    file.end();

    file.on("complete", async () => {
      console.log("✅ Upload para MEGA concluído!");

      // Obter a URL do arquivo no MEGA
      const fileLink = await file.link();
      console.log("🔗 URL da imagem no MEGA:", fileLink);

      // Salvar a URL no banco de dados
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
    console.error("❌ Erro no upload para MEGA:", error);
    res.status(500).json({ error: "Erro no upload para MEGA" });
  }
});

module.exports = router;
