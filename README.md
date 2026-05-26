# Daily Fitness

Projeto de prática profissional voltado ao segmento fitness, com o objetivo de centralizar em uma única plataforma serviços relacionados à saúde, bem-estar, desafios, planos de treino, planos alimentares, solicitações de acesso como profissional fitness e autenticação segura.

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Configuração do MySQL](#3-configuração-do-mysql)
4. [Configuração dos Secrets do Backend](#4-configuração-dos-secrets-do-backend)
5. [Configuração do SMTP com Gmail](#5-configuração-do-smtp-com-gmail)
6. [Restore e Build do Backend](#6-restore-e-build-do-backend)
7. [Instalação do dotnet-ef](#7-instalação-do-dotnet-ef)
8. [Aplicação das Migrations](#8-aplicação-das-migrations)
9. [Execução do Backend](#9-execução-do-backend)
10. [Configuração do Frontend React](#10-configuração-do-frontend-react)
11. [Instalação dos node_modules](#11-instalação-dos-node_modules)
12. [Execução do Frontend](#12-execução-do-frontend)
13. [Fluxo Básico para Testar a Aplicação](#13-fluxo-básico-para-testar-a-aplicação)
14. [Perfis de Usuário](#14-perfis-de-usuário)
15. [Troubleshooting](#15-troubleshooting)
16. [Segurança e Boas Práticas](#16-segurança-e-boas-práticas)

---

## 1. Visão Geral do Projeto

**Daily Fitness** é uma plataforma web que reúne funcionalidades relacionadas à saúde e bem-estar, permitindo que usuários acompanhem desafios, sigam planos de treino e planos alimentares, consultem profissionais fitness e gerenciem seu perfil de forma centralizada.

**Backend** — API REST construída em .NET 10 com ASP.NET Core, seguindo Clean Architecture. Responsável por autenticação, regras de negócio, persistência e envio de e-mails transacionais.

**Frontend** — Aplicação React com Vite e TypeScript. Responsável pela interface do usuário e comunicação com a API.

**Banco de dados** — MySQL. O schema é gerenciado por migrations do Entity Framework Core.

### Tecnologias principais

| Camada | Tecnologia |
|---|---|
| Backend | .NET 10, ASP.NET Core, Entity Framework Core 10 |
| ORM / Banco | MySql.EntityFrameworkCore, MySQL |
| Autenticação | JWT Bearer |
| Validação | FluentValidation 12 |
| Senha | BCrypt.Net-Next |
| Documentação da API | Scalar + OpenAPI |
| E-mail | SmtpClient nativo (Gmail SMTP) |
| Frontend | React 18, Vite, TypeScript, TailwindCSS |
| Gerenciador de pacotes | npm |
| Integração adicional | Supabase |

### Estrutura do repositório

```
DailyFitness/
├── src/
│   ├── backend/
│   │   ├── DailyFitness.Api/            ← Projeto de entrada (API, Controllers, Middleware)
│   │   ├── DailyFitness.Application/    ← Interfaces, Services, DTOs, Validators
│   │   ├── DailyFitness.Domain/         ← Entidades, Value Objects
│   │   ├── DailyFitness.Infrastructure/ ← EF Core, Repositories, JWT, Email, Migrations
│   │   └── DailyFitness.slnx            ← Solution file (formato .slnx)
│   └── frontend/                        ← Aplicação React + Vite
└── README.md
```

> **Nota:** O projeto usa o formato `.slnx` (novo formato de solution do .NET). O comportamento dos comandos `dotnet` é idêntico ao `.sln` convencional.

---

## 2. Pré-requisitos

Instale as ferramentas abaixo antes de iniciar a configuração.

| Ferramenta | Uso |
|---|---|
| Git | Clonar e versionar o repositório |
| .NET 10 SDK | Compilar e executar o backend |
| MySQL Server | Banco de dados relacional |
| MySQL Workbench (opcional) | Interface gráfica para o MySQL |
| Node.js + npm | Executar o frontend |
| IDE backend | Visual Studio 2022+, JetBrains Rider ou VS Code |
| IDE frontend | VS Code |

### Validando as instalações

Execute os comandos abaixo no CMD para confirmar que as ferramentas estão instaladas:

```cmd
git --version
dotnet --version
node --version
npm --version
mysql --version
```

Todas devem retornar sem erro. O projeto exige **.NET 10** e é compatível com **Node.js 18+**.

---

## 3. Configuração do MySQL

### Garantindo que o serviço está ativo

```cmd
net start MySQL80
```

> O nome do serviço pode variar (ex: `MySQL`, `MySQL84`). Consulte os serviços do Windows se necessário.

Via **MySQL Workbench**: abra o Workbench e confirme que a conexão local está com status verde.

### Criando o banco de dados

Conecte-se ao MySQL e execute:

```sql
CREATE DATABASE DailyFitness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Formato da connection string

A connection string será configurada via User Secrets (seção 4). O formato esperado é:

```
Server=localhost;Port=3306;Database=DailyFitness;Uid=root;Pwd=sua_senha;
```

Ajuste `Uid`, `Pwd` e `Server` conforme o seu ambiente local.

---

## 4. Configuração dos Secrets do Backend

O backend usa **.NET User Secrets** para gerenciar configurações sensíveis em desenvolvimento local. Nenhum secret deve ser salvo no `appsettings.json` versionado.

O projeto de API está em `src\backend\DailyFitness.Api`. Todos os comandos abaixo devem ser executados a partir da **raiz do repositório**.

### Inicializando os User Secrets

```cmd
dotnet user-secrets init --project src\backend\DailyFitness.Api
```

> Se o projeto já tiver um `UserSecretsId` no `.csproj`, este comando indicará que já foi inicializado. Isso é normal — prossiga normalmente.

### Configurando a Connection String

```cmd
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Port=3306;Database=DailyFitness;Uid=root;Pwd=sua_senha;" --project src\backend\DailyFitness.Api
```

Substitua `root` e `sua_senha` pelas credenciais do seu MySQL local.

### Configurando o JWT

```cmd
dotnet user-secrets set "Jwt:Issuer" "DailyFitness" --project src\backend\DailyFitness.Api
dotnet user-secrets set "Jwt:Audience" "DailyFitnessClient" --project src\backend\DailyFitness.Api
dotnet user-secrets set "Jwt:Secret" "chave-secreta-forte-para-desenvolvimento-com-no-minimo-32-caracteres" --project src\backend\DailyFitness.Api
```

Use uma chave forte e única para o ambiente local. O secret JWT deve ter no mínimo 32 caracteres para atender os requisitos do algoritmo HS256.

### Configurando o SMTP

```cmd
dotnet user-secrets set "Smtp:Host" "smtp.gmail.com" --project src\backend\DailyFitness.Api
dotnet user-secrets set "Smtp:Port" "587" --project src\backend\DailyFitness.Api
dotnet user-secrets set "Smtp:UserName" "seu-email@gmail.com" --project src\backend\DailyFitness.Api
dotnet user-secrets set "Smtp:Password" "sua-app-password-google" --project src\backend\DailyFitness.Api
dotnet user-secrets set "Smtp:Sender" "seu-email@gmail.com" --project src\backend\DailyFitness.Api
```

Consulte a seção 5 para instruções sobre como gerar a app password do Google.

### Verificando os secrets configurados

```cmd
dotnet user-secrets list --project src\backend\DailyFitness.Api
```

### Removendo um secret (se necessário)

```cmd
dotnet user-secrets remove "NomeDaChave:SubChave" --project src\backend\DailyFitness.Api
```

### Configuração completa esperada

```
ConnectionStrings:DefaultConnection = Server=localhost;Port=3306;Database=DailyFitness;Uid=root;Pwd=...
Jwt:Issuer                          = DailyFitness
Jwt:Audience                        = DailyFitnessClient
Jwt:Secret                          = chave-secreta-forte-...
Smtp:Host                           = smtp.gmail.com
Smtp:Port                           = 587
Smtp:UserName                       = seu-email@gmail.com
Smtp:Password                       = sua-app-password-google
Smtp:Sender                         = seu-email@gmail.com
```

> **Importante:** User Secrets funcionam apenas em ambiente `Development`. Em homologação e produção, use variáveis de ambiente (prefixo `DAILYFITNESS__`), AWS Secrets Manager, Azure Key Vault ou outra solução de gerenciamento de segredos.

---

## 5. Configuração do SMTP com Gmail

O backend envia e-mails transacionais (boas-vindas, recuperação de senha, notificações de solicitações de profissional, desafios descontinuados) via SMTP do Gmail, na porta 587 com STARTTLS.

**Importante:** o Gmail exige uma **senha de app**, nunca a senha normal da conta.

### Passo a passo para gerar a senha de app

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (obrigatória)
4. Pesquise por **Senhas de app** na barra de pesquisa da conta
5. Crie uma nova senha de app com nome sugerido: `DailyFitness`
6. Copie a senha gerada (16 caracteres, sem espaços)
7. Use essa senha no secret `Smtp:Password`

### Referência das configurações SMTP

| Chave | Valor |
|---|---|
| `Smtp:Host` | `smtp.gmail.com` |
| `Smtp:Port` | `587` |
| `Smtp:UserName` | Endereço Gmail completo |
| `Smtp:Password` | Senha de app (16 caracteres) |
| `Smtp:Sender` | Endereço Gmail completo |

Se o envio falhar, verifique se a verificação em duas etapas está ativa e se a senha de app foi gerada corretamente (sem espaços).

---

## 6. Restore e Build do Backend

Execute a partir da **raiz do repositório**:

```cmd
dotnet restore src\backend\DailyFitness.slnx
dotnet build src\backend\DailyFitness.slnx
```

O build deve concluir sem erros. Avisos de documentação XML podem aparecer — são esperados e não impedem a execução.

### Erros comuns no build

- **SDK não encontrado:** confirme `dotnet --version` e que o .NET 10 SDK está instalado
- **NuGet não restaurado:** execute `dotnet restore` antes do `dotnet build`
- **Secrets não configurados:** o build compila sem secrets; erros de secrets ocorrem em runtime

---

## 7. Instalação do dotnet-ef

O Entity Framework CLI é necessário para aplicar as migrations ao banco de dados.

### Verificando se está instalado

```cmd
dotnet ef --version
```

### Instalando (caso não esteja)

```cmd
dotnet tool install --global dotnet-ef
```

### Atualizando (caso a versão seja incompatível)

```cmd
dotnet tool update --global dotnet-ef
```

O projeto usa `Microsoft.EntityFrameworkCore.Design` versão 10.0.5. Recomenda-se o `dotnet-ef` na versão 10.x correspondente.

Após instalar, reinicie o CMD para que o comando seja reconhecido no PATH.

---

## 8. Aplicação das Migrations

As migrations já existem no projeto. **Não crie novas migrations.** O objetivo é apenas aplicar as migrations existentes no banco local.

### Pré-requisitos antes de executar

- MySQL Server em execução
- Banco `DailyFitness` criado
- Connection string configurada nos User Secrets (seção 4)
- `dotnet-ef` instalado

### Migrations existentes

| # | Migration |
|---|---|
| 1 | `20260322185241_InitialDb` |
| 2 | `20260326003744_AddingEmailLogs` |
| 3 | `20260330004752_AddingPasswordResetRequests` |
| 4 | `20260330223556_AddingProfessionalRequests` |
| 5 | `20260427025049_AddingChallenges` |
| 6 | `20260504003441_AddingCreatedByToChallenges` |
| 7 | `20260524000000_AddingTrainingPlans` |
| 8 | `20260524155001_AddingTrainingPlans2` |
| 9 | `20260524185133_AddingDietPlans` |

### Comando para aplicar as migrations

Execute a partir da **raiz do repositório**:

```cmd
dotnet ef database update --project src\backend\DailyFitness.Infrastructure --startup-project src\backend\DailyFitness.Api
```

- `--project` aponta para onde as migrations estão (`DailyFitness.Infrastructure`)
- `--startup-project` aponta para onde a configuração e os User Secrets estão (`DailyFitness.Api`)

### Verificando se as migrations foram aplicadas

```sql
USE DailyFitness;
SHOW TABLES;
SELECT MigrationId FROM __EFMigrationsHistory ORDER BY MigrationId;
```

Você deve ver 9 entradas na tabela `__EFMigrationsHistory`.

---

## 9. Execução do Backend

Execute a partir da **raiz do repositório**:

```cmd
dotnet run --project src\backend\DailyFitness.Api
```

### URLs locais

| Protocolo | URL |
|---|---|
| HTTP | `http://localhost:5284` |
| HTTPS | `https://localhost:7266` |

As portas estão definidas em `src\backend\DailyFitness.Api\Properties\launchSettings.json`.

### Documentação interativa da API (Scalar)

```
http://localhost:5284/DailyFitness/scalar/v1
```

O Scalar está disponível apenas com `ASPNETCORE_ENVIRONMENT=Development`. A autenticação Bearer está pré-configurada na interface para facilitar os testes.

### Certificado HTTPS local (opcional)

Se desejar usar HTTPS localmente:

```cmd
dotnet dev-certs https --trust
```

### Validando que a API subiu

O console exibe:
```
info: Now listening on: http://localhost:5284
info: Now listening on: https://localhost:7266
```

---

## 10. Configuração do Frontend React

O frontend está em `src\frontend`. Ele usa **React 18 + Vite + TypeScript** e se comunica com a API via `VITE_API_URL`.

### Criando o arquivo .env.local

Crie o arquivo `src\frontend\.env.local` com o seguinte conteúdo:

```env
VITE_API_URL=http://localhost:5284
```

> **Por que `.env.local`?** O Vite carrega este arquivo automaticamente e ele está no `.gitignore` do projeto, garantindo que URLs locais nunca sejam commitadas.

### Variáveis do Supabase

O projeto integra Supabase para funcionalidades complementares. As variáveis já estão presentes no `.env` do frontend. Para testes básicos da API .NET local, a configuração do Supabase não é obrigatória.

Se precisar de um projeto Supabase próprio, adicione ao `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anonima
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

---

## 11. Instalação dos node_modules

Navegue até a pasta do frontend e instale as dependências:

```cmd
cd src\frontend
npm install
```

Use `npm install` no desenvolvimento cotidiano. Use `npm ci` para uma instalação limpa e reprodutível baseada exatamente no `package-lock.json` (recomendado em pipelines de CI/CD).

---

## 12. Execução do Frontend

Com as dependências instaladas e o `.env.local` criado, execute:

```cmd
cd src\frontend
npm run dev
```

### URL local do frontend

```
http://localhost:8080
```

### Validando o funcionamento

1. Acesse `http://localhost:8080`
2. A tela de login deve carregar
3. No DevTools (F12 → Network), faça login e confirme que as chamadas vão para `http://localhost:5284/DailyFitness/...`
4. Respostas `200 OK` ou `400 Bad Request` com JSON indicam que a comunicação com a API está funcionando

> **Atenção:** qualquer alteração no `.env.local` exige reinicialização do `npm run dev`.

---

## 13. Fluxo Básico para Testar a Aplicação

**1. Iniciar o MySQL**
```cmd
net start MySQL80
```

**2. Verificar os User Secrets**
```cmd
dotnet user-secrets list --project src\backend\DailyFitness.Api
```

**3. Aplicar as migrations**
```cmd
dotnet ef database update --project src\backend\DailyFitness.Infrastructure --startup-project src\backend\DailyFitness.Api
```

**4. Rodar o backend**
```cmd
dotnet run --project src\backend\DailyFitness.Api
```
Aguarde `Now listening on: http://localhost:5284`.

**5. Criar o `.env.local` do frontend** (apenas na primeira vez)

Arquivo `src\frontend\.env.local`:
```env
VITE_API_URL=http://localhost:5284
```

**6. Instalar dependências do frontend** (apenas na primeira vez)
```cmd
cd src\frontend
npm install
```

**7. Rodar o frontend**
```cmd
npm run dev
```

**8. Criar um usuário pela aplicação**

Acesse `http://localhost:8080`, cadastre um usuário e faça login.

**9. Validar chamadas à API**

No DevTools → Network, confirme respostas JSON com `"success": true`.

---

## 14. Perfis de Usuário

A plataforma possui três perfis com níveis de acesso distintos:

| Valor | Perfil | Descrição |
|---|---|---|
| `0` | `Administrator` | Acesso total à gestão da plataforma |
| `1` | `General` | Perfil padrão ao cadastrar |
| `2` | `Professional` | Acesso a funcionalidades de profissionais fitness |

Por padrão, todos os usuários são cadastrados com o perfil `General`. Para testar funcionalidades restritas a outros perfis, eleve o perfil diretamente no banco após criar o usuário pela aplicação:

```sql
USE DailyFitness;

UPDATE Users
SET Profile = 0
WHERE Email = 'admin@teste.com';
```

Substitua o valor `0` pelo perfil desejado e `admin@teste.com` pelo e-mail do usuário. Após alterar o perfil no banco, faça logout e login novamente para que o novo token JWT reflita o perfil atualizado.

> A promoção para `Professional` também pode ser feita pelo fluxo de solicitação disponível na própria plataforma, sujeita à aprovação de um `Administrator`.

---

## 15. Troubleshooting

### MySQL não conecta

- Confirme que o serviço está em execução: `net start MySQL80`
- Verifique host (`localhost`), porta (`3306`), usuário e senha na connection string
- Tente conectar via MySQL Workbench para isolar o problema
- Confirme que o banco `DailyFitness` existe: `SHOW DATABASES;`

### Banco não encontrado

- Crie manualmente: `CREATE DATABASE DailyFitness;`
- Confirme que o nome na connection string corresponde exatamente

### Migration não aplica

- Confirme que o MySQL está rodando
- Execute `dotnet user-secrets list --project src\backend\DailyFitness.Api` e verifique se a `DefaultConnection` está configurada
- Certifique-se de usar `--project` (Infrastructure) e `--startup-project` (Api) juntos no comando
- Confirme que `dotnet-ef` está instalado: `dotnet ef --version`

### dotnet ef não encontrado

```cmd
dotnet tool install --global dotnet-ef
```
Reinicie o CMD após instalar.

### Secrets não carregados

- Confirme que `ASPNETCORE_ENVIRONMENT=Development` está ativo (verificar `launchSettings.json`)
- Execute `dotnet user-secrets list --project src\backend\DailyFitness.Api`
- Certifique-se de ter usado o path correto do projeto de API nos comandos

### JWT inválido / 401 Unauthorized

- Verifique `Jwt:Issuer` (deve ser `DailyFitness`) e `Jwt:Audience` (deve ser `DailyFitnessClient`)
- Confirme que o `Jwt:Secret` tem pelo menos 32 caracteres
- Se alterou os secrets, reinicie o backend e faça login novamente

### SMTP Gmail falhando

- Confirme que a verificação em duas etapas está ativa na conta Google
- Use a senha de app (16 caracteres), nunca a senha normal da conta
- Verifique: `Smtp:Host = smtp.gmail.com`, `Smtp:Port = 587`

### Frontend chamando URL errada

- Confirme que `src\frontend\.env.local` existe com `VITE_API_URL=http://localhost:5284`
- Reinicie o `npm run dev` após criar ou alterar o `.env.local`
- No DevTools → Network, inspecione para qual URL as chamadas estão sendo feitas

### Erro de CORS

- O backend está configurado com `AllowAnyOrigin` em desenvolvimento — CORS não deve ser problema localmente
- Confirme que o frontend está chamando `http://localhost:5284` (porta correta)
- Confirme que `ASPNETCORE_ENVIRONMENT=Development` está ativo

### Porta já em uso

```cmd
netstat -ano | findstr :5284
netstat -ano | findstr :8080
```
Identifique o PID e finalize o processo pelo Gerenciador de Tarefas, ou altere as portas nos arquivos de configuração.

### Scalar não carrega

- Confirme que `ASPNETCORE_ENVIRONMENT=Development` está ativo
- Acesse com o prefixo correto: `http://localhost:5284/DailyFitness/scalar/v1`
- O Scalar só está disponível em ambiente de desenvolvimento

---

## 16. Segurança e Boas Práticas

- Nunca commite a connection string real, senhas ou tokens em `appsettings.json` ou qualquer arquivo versionado
- Nunca commite o arquivo `.env.local` — ele está no `.gitignore`
- Nunca use a senha normal da conta Gmail — utilize exclusivamente a senha de app
- Use **User Secrets** apenas em desenvolvimento local
- Em homologação e produção, utilize variáveis de ambiente (prefixo `DAILYFITNESS__`), AWS Secrets Manager, Azure Key Vault ou solução equivalente
- Use um **JWT Secret forte e diferente** para cada ambiente (dev, hom, prod)
- O CORS está configurado como `AllowAnyOrigin` em desenvolvimento — restrinja as origens permitidas antes de qualquer deploy em produção

### Pontos que exigem configuração manual por desenvolvedor

- **Senha de app do Gmail** — deve ser gerada na própria conta Google do desenvolvedor
- **Credenciais MySQL** — cada desenvolvedor deve ajustar `Uid` e `Pwd` para seu ambiente local
- **Supabase** — para uso completo da plataforma, pode ser necessário um projeto Supabase próprio com as variáveis `VITE_SUPABASE_*` configuradas no `.env.local`
