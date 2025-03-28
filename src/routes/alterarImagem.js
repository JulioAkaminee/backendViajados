const express = require("express");
const db = require("../db/conn");
const multer = require("multer");
const fs = require("fs");
const { Storage } = require("megajs");
require("dotenv").config();

const router = express.Router();

// Verificar se o diretório uploads existe, caso contrário, criar
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Configuração do multer para armazenar temporariamente a imagem
const multerStorage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: multerStorage });

// Função para fazer upload no MEGA
const uploadFileToMega = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const file = megaStorage.upload({
      name: fileName,
      size: fs.statSync(filePath).size,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(file);

    file.on('complete', () => {
      file.link()
        .then((fileLink) => resolve(fileLink))
        .catch((error) => reject(error));
    });

    file.on('error', reject);
  });
};

// Rota para upload de imagem
router.post("/", upload.single("foto_usuario"), async (req, res) => {
  const { idUsuario } = req.body;

  if (!idUsuario || !req.file) {
    return res.status(400).json({ error: "Usuário ou imagem ausente" });
  }

  const filePath = req.file.path;

  try {
    // Conectar ao MEGA
    const megaStorage = new Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
    });

    await new Promise((resolve) => megaStorage.login(resolve));

    // Fazer upload da imagem para o MEGA
    const fileLink = await uploadFileToMega(filePath, req.file.filename);

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
  } catch (error) {
    console.error("Erro no upload para MEGA:", error);
    res.status(500).json({ error: "Erro no upload para MEGA" });
  }
});

module.exports = router;
