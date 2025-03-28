const express = require("express");
const db = require("../db/conn");
const { Storage } = require("megajs");
require("dotenv").config();

const router = express.Router();

// Criação da instância de conexão com o MEGA
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

  // Validação dos dados enviados na requisição
  if (!idUsuario || !imagemBase64 || !nomeArquivo) {
    return res.status(400).json({ error: "Usuário, nome do arquivo ou imagem ausente" });
  }

  // Verifica se a imagem está no formato base64
  if (!/^data:image\/[a-zA-Z]*;base64,/.test(imagemBase64)) {
    return res.status(400).json({ error: "Imagem não está no formato base64" });
  }

  try {
    // Conectar ao MEGA
    await conectarMega();

    // Remove o prefixo "data:image/...;base64," da imagem
    const base64Data = imagemBase64.split(',')[1];

    if (!base64Data) {
      return res.status(400).json({ error: "Imagem Base64 inválida" });
    }

    // Cria o buffer a partir da string base64
    const buffer = Buffer.from(base64Data, 'base64');

    // Cria o arquivo no MEGA e envia o buffer
    const file = storage.root.upload({
      name: nomeArquivo,
      size: buffer.length,
    });

    file.write(buffer);
    file.end();

    // Após o upload, buscar o arquivo no MEGA
    file.on("complete", async () => {
      console.log("✅ Upload concluído!");

      try {
        // Listar arquivos no MEGA
        const arquivos = await storage.root.list();

        // Encontrar o arquivo enviado pelo nome
        const arquivoSalvo = arquivos.find((f) => f.name === nomeArquivo);

        if (!arquivoSalvo) {
          return res.status(500).json({ error: "Erro ao recuperar o arquivo do MEGA" });
        }

        // Obter o link do arquivo
        const fileLink = await arquivoSalvo.link();
        console.log("🔗 Link do arquivo:", fileLink);

        // Salvar o link no banco de dados
        const sql = "UPDATE usuarios SET foto_usuario = ? WHERE idUsuario = ?";
        db.query(sql, [fileLink, idUsuario], (err) => {
          if (err) {
            console.error("Erro ao salvar no banco:", err);
            return res.status(500).json({ error: "Erro no banco de dados" });
          }

          // Resposta de sucesso
          res.json({ message: "Imagem salva com sucesso!", foto_usuario: fileLink });
        });
      } catch (err) {
        console.error("Erro ao listar ou buscar arquivos no MEGA:", err);
        res.status(500).json({ error: "Erro ao listar ou recuperar arquivos no MEGA" });
      }
    });

    // Erro no arquivo durante o upload
    file.on("error", (err) => {
      console.error("Erro no upload:", err);
      res.status(500).json({ error: "Erro no upload para MEGA" });
    });

  } catch (error) {
    console.error("❌ Erro no upload:", error);
    res.status(500).json({ error: "Erro no upload para MEGA" });
  }
});

module.exports = router;
