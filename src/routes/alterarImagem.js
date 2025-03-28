const express = require("express");
const db = require("../db/conn");
const multer = require("multer");
const fs = require("fs");
const { Storage } = require("megajs");
require("dotenv").config();

const router = express.Router();

// Configuração do multer para armazenar temporariamente a imagem
const upload = multer({ dest: "uploads/" });

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

// Rota para upload de imagem
router.post("/", upload.single("foto_usuario"), async (req, res) => {
  const { idUsuario } = req.body;

  if (!idUsuario || !req.file) {
    return res.status(400).json({ error: "Usuário ou imagem ausente" });
  }

  const filePath = req.file.path;

  try {
    // Conectar ao MEGA antes de tentar o upload
    await conectarMega();

    // Criar upload para o MEGA
    const file = storage.upload({
      name: req.file.filename,
      size: fs.statSync(filePath).size,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(file);

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

      // Remover o arquivo temporário localmente
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("❌ Erro no upload para MEGA:", error);
    res.status(500).json({ error: "Erro no upload para MEGA" });
  }
});

module.exports = router;
