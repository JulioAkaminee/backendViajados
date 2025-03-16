## Como commitar para o projeto

- Tem duas branchs, main(Produção) e develop(Desenvolvimento);
- Primeiro você deve clonar o repositorio da branch de produção main https://github.com/JulioAkaminee/backendViajados
- Depois mudar para a branch de desenvolvimento com
  ```sh
  git checkout develop
  ```
- Depois disso crie uma branch temporaria para a sua feature por exemplo: irei criar uma pagina de cadastro.
  ```sh
  git checkout -b Nome-Da-Branch
  ````
- Esse comando cria e já muda para a branch criada.
- Depois disso pode fazer seu commit normalmente.
- Após fazer seu commit você precisa fazer um PR(Pull Request) para o ambiente de desenvolvimento(develop).
- Para fazer o Pull Request Você precisa entrar no repositório e clicar em branches.
  
![image](https://github.com/user-attachments/assets/acd07d02-fded-49c5-9233-04f08dab904e)

- Após isso clique na branch que você criou para a nova feature, logo em seguida irá parecer assim para vôcê fazer um Pull Request.
- Clique em Compare e Pull
  
![imagem](https://github.com/user-attachments/assets/3d32312a-a8cc-437a-a6d6-15521fce6491)

  - A Branch base tem que ser a branch que você criou para fazer a nova feature, e a branch compare tem que ser o ambiente de desenvolvimento (develop)

![imagem](https://github.com/user-attachments/assets/a0ca84f2-a1c2-4df8-80d2-82b7d41654f9)

- E dessa forma só escrever o titulo e a descrição das alterações.
- Depois disso volte para a branch de desenvolvimento e se for fazer outra feature repita o passo a passo acima.
  
  ```sh
  git checkout -b develop
  ````

    

## Regras
- Todo Commit feito no projeto será analisado pelo Tech Lead (Julio Akamine);
- Não será aceito commit's fora da padronização do código
