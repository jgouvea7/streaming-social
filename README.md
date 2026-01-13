# Rede Social de Streaming

Backend de uma plataforma de rede social de streaming moderna construída com NestJS, apresentando upload de vídeos, interações sociais e um algoritmo de recomendação personalizado.

## Funcionalidades

- **Autenticação**: Registro e login de usuários seguros com JWT.
- **Gerenciamento de Vídeo**:
  - Upload de vídeo com limites de tamanho (até 100MB).
  - Edição de metadados de vídeo.
  - Exclusão de vídeo (apenas pelo proprietário).
- **Interações Sociais**:
  - **Curtidas**: Curtir e descurtir vídeos.
  - **Comentários**: Deixar comentários em vídeos.
- **Descoberta Inteligente**:
  - **Algoritmo de Recomendação**: Um algoritmo baseado em Python integra-se ao backend para sugerir o melhor conteúdo para os usuários. (EM DESENVOLVIMENTO)
- **Armazenamento de Arquivos**: Gerenciamento de armazenamento local de vídeos.

## Tecnologias

### Backend
- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Manipulação de Arquivos**: Multer

## Estrutura do Projeto

```bash
streaming/
├── backend/            # Aplicação NestJS
│   ├── src/           # Código-fonte da API (Autenticação, Usuários, Vídeos, Comentários, Curtidas)
│   ├── algorithms/    # Scripts de Recomendação em Python
│   └── test/          # Testes E2E
├── uploads/           # Arquivos de Vídeo Carregados (ignorado pelo git)
└── script/            # Scripts de Utilidade (ex: tests.bat)
```

## Configuração e Instalação

### Pré-requisitos
- **Node.js** (v18+)
- **Instância do PostgreSQL**
- **Python** (para o algoritmo de recomendação)

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd streaming/backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configuração do Banco de Dados
Certifique-se de que o seu PostgreSQL está em execução e configure as variáveis de ambiente no arquivo `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=streaming_test
```

### 4. Executar a aplicação
```bash
# Modo de desenvolvimento
npm run start:dev

# Modo de produção
npm run build
npm run start:prod
```

## Testes

O projeto inclui testes unitários e E2E usando Jest.

```bash
# Executar testes unitários
npm run test

# Executar testes e2e
npm run test:e2e
```

