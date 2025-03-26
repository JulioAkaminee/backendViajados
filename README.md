# Backend Viajados - Desenvolvido Totalmente Por Julio Akamine


## Funcionalidades
- Cadastro e autenticação de usuarios.
- Resetar Senha de usuario.
- Listar todos os hóteis.
- Listar todos os voos.
- Listar todos os hoteis favoritos do usuario.
- Listar todos os voos favoritos do usuario.
- Atualizar dados do usuario.

## Tecnologias Usadas
- Node.js e Express.js para a construção da API.
- MySQL para o banco de dados.
- Bcrypt para criptografia de senhas.
- Nodemailer para envio de e-mails.

# Endpoints Da API

## 1- Cadastro de usuario
- Método: POST
- Endpoint: /api/cadastro
- Descrição: Cadastra um novo usuario.
```json
{
    {
    "email": "emaildousuario@gmail.com",
    "senha": "senhadousuario",
    "nome": "NomeDoUsuario",
    "ativo": 1, (0 inativo, 1 ativo)
    "cpf": "12345678910", (11 Digitos)
    "data_nascimento": "1988-11-23",
    "nacionalidade": "Brasileiro",
    "sexo": "M" (M = Masculino, F = Feminino)
}
}
```


## 2- Login do usuario.
- Método: POST
- Endpoint: /api/login
- Descrição: Loga o usuario.
```json
{
    "email": "emaildousuario@gmail.com",
    "senha": "senhadousuario"
}
```

## 3- Alterar senha
- Método: POST
- Endpoint: /api/login
- Descrição: Envia o email de redefinição de senha para o usuario.
```json
{
    "email": "emaildousuario@gmail.com",
}
```

## 4- Listagem de hoteis 
- Método: GET
- Endpoint: /api/hoteis
- Descrição: Lista todos hoteis disponiveis.
  ```json
  (Necessario enviar baerer token que é retornado quando é feito o login);
  ```

  ## 5- Listagem de hoteis 
- Método: GET
- Endpoint: /api/voos
- Descrição: Lista todos voos disponiveis.
  ```json
  (Necessario enviar baerer token que é retornado quando é feito o login);
  ```

   ## 6- Listagem de hoteis favoritos
- Método: GET
- Endpoint: /api/favoritos/hoteis
- Descrição: Lista todos hoteis favoritos do usuario disponiveis.
  ```json
  (Necessario enviar baerer token que é retornado quando é feito o login);
  ```

  ## 7- Listagem de voos favoritos
- Método: GET
- Endpoint: /api/favoritos/voos
- Descrição: Lista todos voos favoritos do usuario disponiveis.
- Necessario enviar idUsuario na url para obter os favoritos do usuario exemplo: https://backend-viajados.vercel.app/api/favoritos/hoteis?idUsuario=3
  ```json
  (Necessario enviar baerer token que é retornado quando é feito o login);
  ```




