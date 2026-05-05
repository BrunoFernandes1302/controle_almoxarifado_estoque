# AXM — Almoxarimax

Sistema web de controle de estoque de materiais, desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso técnico em Desenvolvimento Web.

---

## Funcionalidades

- Cadastro de materiais com geração automática de **QR Code**
- Registro de **entradas** e **saídas** de estoque (individual ou em lote)
- **Leitura de QR Code** via câmera para agilizar saídas
- Visualização do estoque em tempo real com alertas de quantidade baixa
- Relatório consolidado de movimentações com opção de cancelamento
- Cadastro de fornecedores e unidades de medida
- Autenticação de usuários (almoxarifes)

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, React Router, MUI, CSS Modules |
| Backend | Node.js, Express 5 |
| Banco de dados | MySQL |
| QR Code | qrcode, qrcode.react, html5-qrcode |
| HTTP Client | Axios |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [MySQL](https://www.mysql.com/) rodando localmente
- Banco de dados `axm` criado

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/BrunoFernandes1302/controle_almoxarifado_estoque.git
cd controle_almoxarifado_estoque

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do banco de dados
```

---

## Configuração

Edite o arquivo `.env` com os dados do seu ambiente:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_PORT=3306
DB_NAME=axm

ADMIN_PASSWORD=sua_senha_admin

PORT=3001
```

> O arquivo `.env` nunca é enviado ao repositório. Use `.env.example` como referência.

---

## Rodando o projeto

```bash
# Inicia o backend (porta 3001) e o frontend (porta 3000) juntos
npm run dev
```

Ou separadamente:

```bash
# Apenas o backend
npm run server

# Apenas o frontend
npm start
```

Acesse em: **http://localhost:3000**

---

## Estrutura do projeto

```
controle_almoxarifado_estoque/
├── public/
│   └── qrcodes/          # QR Codes gerados automaticamente
├── src/
│   ├── components/
│   │   ├── principais/   # Páginas do sistema (Estoque, Entrada, Saída...)
│   │   └── ...           # Componentes de layout (NavBar, Footer...)
│   ├── contexts/
│   │   └── UserContext.js
│   └── form/             # Componentes de formulário reutilizáveis
├── server.js             # API backend (Express + MySQL)
├── .env.example          # Modelo de variáveis de ambiente
└── package.json
```

---

## Fluxo principal

```
Login → Menu Principal
  ├─ Entrada: seleciona material → informa quantidade → registra lote
  ├─ Saída: lê QR Code ou seleciona material → registra
  ├─ Estoque: visualiza quantidades com alertas de nível baixo
  ├─ Relatório: histórico de movimentações, com opção de cancelar
  └─ Cadastros: novos materiais, unidades de medida
```

---

## Licença

Projeto acadêmico — uso livre para fins educacionais.
