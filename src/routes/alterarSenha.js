const express = require("express");
const db = require("../db/conn.js");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const verificarToken = require("../middlewares/verificarToken.js")
const router = express.Router();

//Email e senha por variaveis de ambiente
const email = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

//Conexão com o gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Erro ao verificar o transporte:", error);
  } else {
    console.log("Transporte verificado com sucesso");
  }
});

// Função para enviar e-mail
const sendEmail = (to, subject, text) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
};

// Função para gerar token e tempo de expiração
const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  const now = new Date();
  // Ajuste para o horario de são paulo pois o servidor do mysql é 3 horas a frente
  const expires = new Date(now.getTime() + 15 * 60 * 1000 - (3 * 60 * 60 * 1000)); // Subtrai 3 horas
  return { token, expires: expires.toISOString().slice(0, 19).replace("T", " ") }; // Formato YYYY-MM-DD HH:MM:SS
};

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "O campo e-mail é obrigatório." });
  }

  try {
    // Verifica se o usuário existe
    const [user] = await db.query("SELECT * FROM usuario WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(404).send({ error: "Usuário não encontrado." });
    }

    // Gera token e tempo de expiração
    const { token, expires } = generateResetToken();

    // Log para teste (tirar depois)
    console.log("Horário atual Node.js:", new Date());
    console.log("Expires gerado:", expires);

    // Salvar o token e o tempo na tabela usuario
    await db.query(
      "UPDATE usuario SET token_reset = ?, reset_tempo = ? WHERE email = ?",
      [token, expires, email]
    );

    // Envia o email com o link de redefinição de senha
    const resetLink = `http://localhost:3000/api/alterarsenha?email=${email}&token=${token}`;
    await sendEmail(
      email,
      "Recuperação de Senha Viajados",
      `Clique no link para redefinir sua senha: ${resetLink}`
    );

    return res.status(200).send({ message: "E-mail enviado com sucesso." });
  } catch (err) {
    console.error("Erro ao processar recuperação de senha:", err);
    return res.status(500).send({ error: "Erro ao processar a solicitação." });
  }
});

router.get("/", async (req, res) => {
  const { email, token } = req.query;

  //Verifica se o email e token estão
  if (!email || !token) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Erro</h2>
          <p>E-mail ou token não fornecido. Solicite a recuperação de senha novamente.</p>
          <a href="/recuperarsenha" style="color: #D6005D;">Voltar</a>
        </body>
      </html>
    `);
  }

  try {
    // Usa o CONVERT_TZ para garantir o fuso horário correto
    const [user] = await db.query(
      "SELECT * FROM usuario WHERE email = ? AND token_reset = ? AND reset_tempo > CONVERT_TZ(NOW(), @@session.time_zone, 'America/Sao_Paulo')",
      [email, token]
    );

    // Log para depuração
    const [mysqlTime] = await db.query("SELECT CONVERT_TZ(NOW(), @@session.time_zone, 'America/Sao_Paulo') as now");
    console.log("Horário ajustado MySQL:", mysqlTime[0].now);
    console.log("Reset_tempo no banco:", user[0]?.reset_tempo);

    if (user.length === 0) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Link Inválido ou Expirado</h2>
            <p>O link de recuperação é inválido ou expirou. Solicite um novo.</p>
            <a href="/recuperarsenha" style="color: #D6005D;">Voltar</a>
          </body>
        </html>
      `);
    }

    // Se o token for válido, renderizar o formulário
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              background-color: #ffffff;
              padding: 20px;
              border-radius: America/Sao_Paulo;
              box-shadow: 0 4px America/Sao_Paulo rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 400px;
              text-align: center;
            }
            h2 {
              color: #333;
              margin-bottom: 20px;
            }
            label {
              font-size: 14px;
              color: #555;
              margin-bottom: America/Sao_Paulo;
              display: block;
            }
            input[type="password"] {
              width: 100%;
              padding: 10px;
              font-size: 16px;
              border: 1px solid #ddd;
              border-radius: 4px;
              margin-bottom: 20px;
            }
            button {
              background-color: #D6005D;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 16px;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
            }
            button:hover {
              background-color: rgb(174, 0, 75);
            }
            #message {
              margin-top: 20px;
            }
            #message p {
              font-size: 14px;
            }
            #message p.green {
              color: green;
            }
            #message p.red {
              color: red;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Redefinir Senha</h2>
            <form id="resetPasswordForm">
              <input type="hidden" name="email" value="${email}" />
              <input type="hidden" name="token" value="${token}" />
              <label for="newPassword">Nova Senha:</label>
              <input type="password" id="newPassword" name="newPassword" required />
              <button type="submit">Redefinir Senha</button>
            </form>
            <div id="message"></div>
          </div>
          <script>
            document.getElementById('resetPasswordForm').addEventListener('submit', async function(event) {
              event.preventDefault();
              const formData = new FormData(this);
              const data = {};
              formData.forEach((value, key) => {
                data[key] = value;
              });
              try {
                const response = await fetch('/api/alterarsenha/reset-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                });
                const result = await response.json();
                const messageDiv = document.getElementById('message');
                if (response.ok) {
                  messageDiv.innerHTML = '<p class="green">' + result.message + '</p>';
                } else {
                  messageDiv.innerHTML = '<p class="red">' + result.error + '</p>';
                }
              } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                const messageDiv = document.getElementById('message');
                messageDiv.innerHTML = '<p class="red">Erro ao enviar o formulário. Tente novamente.</p>';
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Erro ao validar e-mail e token na URL:", err);
    return res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Erro</h2>
          <p>Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.</p>
          <a href="/recuperarsenha" style="color: #D6005D;">Voltar</a>
        </body>
      </html>
    `);
  }
});

router.post("/reset-password",  async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).send({ error: "E-mail, token e nova senha são obrigatórios." });
  }

  try {
    // Usa o CONVERT_TZ para garantir o fuso horário correto
    const [user] = await db.query(
      "SELECT * FROM usuario WHERE email = ? AND token_reset = ? AND reset_tempo > CONVERT_TZ(NOW(), @@session.time_zone, 'America/Sao_Paulo')",
      [email, token]
    );

    if (user.length === 0) {
      return res.status(400).send({ error: "Token inválido ou expirado." });
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha e limpar o token
    await db.query(
      "UPDATE usuario SET senha = ?, token_reset = NULL, reset_tempo = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    return res.status(200).send({ message: "Senha atualizada com sucesso." });
  } catch (err) {
    console.error("Erro ao redefinir a senha:", err);
    return res.status(500).send({ error: "Erro ao redefinir a senha." });
  }
});

module.exports = router;