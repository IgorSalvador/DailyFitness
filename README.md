# Daily Fitness

Projeto de prática profissional voltado ao segmento fitness, com o objetivo de centralizar em uma única plataforma serviços relacionados à saúde, bem-estar, planos de treino, dieta, desafios e apoio profissional.

## Objetivo do projeto

O Daily Fitness tem como proposta oferecer uma plataforma web para:

- cadastro e autenticação de usuários
- acesso a planos de treino e dieta
- acompanhamento de desafios diários, semanais, mensais e anuais
- consulta de profissionais da área fitness
- evolução futura para gestão por profissionais e administração completa da plataforma

## Perfis previstos

O sistema foi concebido para atender os seguintes perfis:

- **Usuário**
- **Profissional Fitness**
- **Administrador**

## Stack prevista

### Frontend
- React **ou** Angular

### Backend
- .NET 10 Web API

### Banco de Dados
- MySQL

## Direcionamento arquitetural

A arquitetura prevista para o projeto segue um modelo modular e escalável, permitindo evolução futura com menor impacto estrutural.

### Backend
Estrutura sugerida:
- `DailyFitness.API`
- `DailyFitness.Application`
- `DailyFitness.Domain`
- `DailyFitness.Infrastructure`

### Frontend
Estrutura sugerida:
- módulo público
- módulo autenticado
- componentes compartilhados
- serviços de integração com API
- gerenciamento de sessão/autenticação

### Banco de Dados
Estrutura relacional com versionamento por migrations, contemplando entidades principais do domínio e crescimento progressivo do produto.

## Escopo funcional resumido

O projeto contempla, em sua visão completa:

- cadastro e login de usuários
- recuperação de senha
- consulta de planos de treino
- consulta de plano alimentar
- participação em desafios
- consulta de profissionais fitness
- funcionalidades para profissionais criarem planos e desafios
- funcionalidades administrativas para gestão de usuários, profissionais, anúncios e relatórios

## Estratégia de entrega

Considerando o prazo da primeira versão, o projeto será dividido em duas grandes frentes:

### 1. MVP
Entrega mínima funcional para disponibilizar uma primeira versão navegável e demonstrável.

### 2. Evoluções pós-MVP
Expansão das funcionalidades de profissional, administração, anúncios, relatórios e contratação de planos.

---

# MVP previsto

## Objetivo do MVP

Disponibilizar uma versão mínima funcional com as principais jornadas do usuário final.

## Escopo do MVP

- cadastro de usuário
- login de usuário
- recuperação de senha
- área autenticada
- home do usuário
- visualização de plano alimentar
- visualização de planos de treino
- listagem de profissionais
- visualização de desafios
- marcação simples de progresso

## Fora do MVP

Os itens abaixo ficam previstos para fases posteriores:

- login e portal completo do profissional
- criação de planos por profissional
- criação de desafios por profissional
- vínculo profissional-cliente
- gestão administrativa
- anúncios
- relatórios
- contratação de plano premium/mensal
- regras avançadas de personalização

---

# Ordem de execução prevista

## Fase 1 - Fundação técnica

Objetivo: estruturar a base do projeto para permitir evolução segura.

### Itens
- criação do repositório e organização inicial
- criação da solução backend em .NET 10
- criação do frontend base
- definição da arquitetura por camadas
- configuração do MySQL
- configuração de migrations
- configuração de Swagger
- configuração de CORS
- configuração de tratamento global de erros
- definição de convenções de código e versionamento

### Resultado esperado
Ambiente inicial funcional com frontend e backend subindo localmente e base pronta para desenvolvimento das features.

---

## Fase 2 - Autenticação e acesso

Objetivo: permitir entrada segura na plataforma.

### Itens
- modelagem da entidade de usuário
- definição de papéis/perfis de acesso
- cadastro de usuário
- login com JWT
- hash de senha
- validação de e-mail único
- funcionalidade lembrar de mim
- recuperação de senha
- proteção de rotas autenticadas
- logout

### Resultado esperado
Usuário capaz de se cadastrar, autenticar e acessar a área logada da aplicação.

---

## Fase 3 - Estrutura da área autenticada

Objetivo: construir a navegação principal da jornada do usuário.

### Itens
- layout autenticado
- menu superior
- navegação entre módulos
- home do usuário
- saudação inicial
- painel de desafios diários
- atalhos para módulos principais
- tela básica de perfil

### Resultado esperado
Usuário autenticado acessando a home e navegando entre os módulos centrais do sistema.

---

## Fase 4 - Plano alimentar

Objetivo: entregar consulta do plano alimentar.

### Itens
- modelagem de plano alimentar
- modelagem de refeições e itens
- endpoint de consulta do plano
- tela de dieta
- exibição por refeição/período
- observações nutricionais
- marcação manual de refeição concluída
- persistência do progresso

### Resultado esperado
Usuário visualizando sua dieta e registrando o andamento manualmente.

---

## Fase 5 - Planos de treino

Objetivo: entregar consulta dos treinos.

### Itens
- modelagem de plano de treino
- modelagem de exercícios
- modelagem de progresso do treino
- endpoint de listagem
- tela de planos de treino
- exibição de exercícios, séries e repetições
- marcação de treino concluído
- atualização do indicador de progresso

### Resultado esperado
Usuário visualizando os treinos e registrando conclusão.

---

## Fase 6 - Profissionais

Objetivo: permitir consulta de profissionais disponíveis na plataforma.

### Itens
- modelagem de profissional
- especializações e descrição
- seed de profissionais
- endpoint de listagem
- tela de profissionais
- cards com dados resumidos
- tela de detalhe do profissional

### Resultado esperado
Usuário acessando a listagem de profissionais e consultando detalhes básicos.

---

## Fase 7 - Desafios

Objetivo: entregar acompanhamento de desafios.

### Itens
- modelagem de desafios
- categorias diária, semanal, mensal e anual
- progresso por usuário
- exibição de desafios diários na home
- tela de desafios
- exibição por categoria
- indicador de progresso
- ação de concluir categoria

### Resultado esperado
Usuário acompanhando seus desafios e registrando conclusão de forma simples.

---

## Fase 8 - Fechamento do MVP

Objetivo: estabilizar a versão inicial antes da publicação.

### Itens
- seed de dados para demonstração
- testes mínimos da API
- ajustes de UX
- feedbacks visuais
- responsividade básica
- configuração de ambiente de homologação
- publicação da primeira versão

### Resultado esperado
Primeira versão navegável, demonstrável e tecnicamente organizada para evolução.

---

# Ordem recomendada das issues

## Bloco 1 - Base técnica
- estrutura do repositório
- solução backend
- frontend base
- banco e migrations
- configuração da API

## Bloco 2 - Acesso
- modelagem de usuário
- cadastro
- login
- sessão
- recuperação de senha

## Bloco 3 - Navegação
- layout autenticado
- menu principal
- home
- perfil

## Bloco 4 - Funcionalidades do MVP
- dieta
- treino
- profissionais
- desafios

## Bloco 5 - Publicação
- seeds
- testes
- refinamentos
- deploy

---

# Funcionalidades previstas para evolução

## Módulo Profissional
- cadastro de profissional
- login do profissional
- criação de planos
- criação de desafios
- gestão de clientes
- atendimento entre profissional e cliente

## Módulo Administrativo
- login administrativo
- gestão de usuários
- gestão de profissionais
- aprovação de solicitações
- gestão de anúncios
- relatórios administrativos
- moderação de desafios

## Evoluções de produto
- contratação de plano premium/mensal
- personalização de dieta e treino por perfil
- regras de recomendação
- integrações futuras
- dashboards gerenciais

---

# Requisitos não funcionais esperados

- interface intuitiva e de fácil navegação
- autenticação segura
- proteção de dados
- bom tempo de resposta
- arquitetura modular
- escalabilidade para futuras evoluções
- manutenção facilitada

---

# Estrutura inicial sugerida do repositório

```text
daily-fitness/
├─ backend/
│  ├─ DailyFitness.API/
│  ├─ DailyFitness.Application/
│  ├─ DailyFitness.Domain/
│  ├─ DailyFitness.Infrastructure/
│  └─ DailyFitness.sln
├─ frontend/
│  └─ app/
├─ docs/
│  ├─ backlog/
│  ├─ arquitetura/
│  └─ prototipos/
└─ README.md
