# Star Wars Spaceship Rental

Aplicação full-stack de aluguel de naves Star Wars.
**Backend:** Spring Boot 4 · PostgreSQL | **Frontend:** React 19 + Vite + TypeScript

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Docker + Docker Compose | 24.x / 2.x |
| Node.js _(apenas para testes E2E)_ | 20 LTS |
| Java 21 + Maven _(apenas para testes backend)_ | 21 / 3.9 |

---

## 1. Arrancar o projeto

```bash
docker compose up -d --build
```

Isso sobe três contêineres:

| Serviço | URL |
|---|---|
| Frontend (React/Nginx) | <http://localhost> |
| Backend (Spring Boot) | <http://localhost:8081> |
| PostgreSQL | `localhost:5433` |

> **Nota sobre a base de dados:** o ficheiro `plano-software/set.sql` é montado
> automaticamente em `docker-entrypoint-initdb.d/` e executado pelo PostgreSQL
> na **primeira inicialização** do contêiner. Ele cria todas as tabelas, os
> status iniciais (`disponivel`, `alugada`, `manutencao`, `desativada`, etc.) e
> o utilizador administrador padrão — não é necessário nenhum passo manual.
>
> Caso precise recomeçar do zero (volume já existente):
> ```bash
> docker compose down -v && docker compose up -d --build
> ```

---

## 2. Credenciais de Acesso Padrão

O utilizador administrador é criado automaticamente pelo `set.sql`:

| Campo | Valor |
|---|---|
| **E-mail** | `admin@star-rental.com` |
| **Senha** | `Admin@123` |

Aceda a <http://localhost>, clique em **"Criar Conta / Entrar"** e faça login
com as credenciais acima. O painel de gestão de frota e planetas fica em
<http://localhost/painel/gestao>.

---

## 3. Popular com dados da SWAPI

Após o login como admin, use o painel de gestão para sincronizar os dados da
Star Wars API:

- **Naves:** Painel de Gestão → aba **Frota** → botão **"Sincronizar SWAPI"**
- **Planetas:** Painel de Gestão → aba **Planetas** → botão **"Sincronizar SWAPI"**

Ou via cURL (o backend deve estar a correr):

```bash
# Importar naves da SWAPI
curl -X POST http://localhost:8081/spaceships/import

# Importar planetas da SWAPI
curl -X POST http://localhost:8081/planets/import
```

---

## 4. Correr os testes

### Testes E2E — Playwright (frontend)

Os testes E2E ligam-se ao backend real em `http://localhost:8081`.
O docker deve estar a correr antes de executar os testes.

```bash
cd frontend/starship-rental-web
npm install
npx playwright test
```

Para ver o relatório após a execução:

```bash
npx playwright show-report
```

### Testes de integração — Maven (backend)

Os testes do backend usam uma base de dados H2 em memória com perfil `test`
e não precisam do Docker.

```bash
cd backend/starship-rental
./mvnw clean test
```

---

## Estrutura do Repositório

```
.
├── backend/starship-rental/   # Spring Boot 4 + PostgreSQL
├── frontend/starship-rental-web/  # React 19 + Vite + TypeScript
├── plano-software/set.sql     # Schema DDL + seed data inicial
└── docker-compose.yml
```
