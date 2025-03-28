const express = require("express");
const db = require("../db/conn.js");
const multer = require("multer");
const fs = require("fs");
const { Storage } = require("megajs");
require("dotenv").config();

const router = express.Router();

// Configuração do multer para armazenar temporariamente a imagem
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Rota para upload de imagem
router.post("/", upload.single("foto_usuario"), async (req, res) => {
  const { idUsuario } = req.body;
  
  if (!idUsuario || !req.file) {
    return res.status(400).json({ error: "Usuário ou imagem ausente" });
  }

  const filePath = req.file.path;
  
  try {
    // Conectar ao MEGA
    const storage = new Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
    });
    
    await new Promise((resolve) => storage.login(resolve));

    // Criar upload para o MEGA
    const file = storage.upload({
      name: req.file.filename,
      size: fs.statSync(filePath).size,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(file);

    file.on("complete", async () => {
      console.log("Upload para MEGA concluído!");

      // Obter a URL do arquivo no MEGA
      const fileLink = await file.link();
      console.log("URL da imagem no MEGA:", fileLink);

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
    console.error("Erro no upload para MEGA:", error);
    res.status(500).json({ error: "Erro no upload para MEGA" });
  }
});

module.exports = router;
