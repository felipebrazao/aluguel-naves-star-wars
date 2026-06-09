# Starship Rental Frontend

Guia rápido para executar a aplicação React + Vite localmente.

## Pre-requisitos

- Node.js 20+
- npm 10+
- Backend disponível em `http://localhost:8081` (ou definir `VITE_API_URL`)

## 1) Instalar dependências

No diretório `frontend/starship-rental-web`:

```powershell
npm install
```

## 2) Executar em modo desenvolvimento

```powershell
npm run dev
```

Aplicação padrão:

- `http://localhost:5173`

## 3) Build de produção

```powershell
npm run build
```

## 4) Preview do build

```powershell
npm run preview
```

## 5) Testes

### Unitários (Vitest)

```powershell
npm run test
```

### Unitários com cobertura

```powershell
npm run test:ci
```

### E2E (Playwright)

```powershell
npm run test:e2e
```

## Configuração da URL da API

Por padrão, o frontend chama `http://localhost:8081`.

Para alterar, crie um arquivo `.env` no diretório `frontend/starship-rental-web` com:

```env
VITE_API_URL=http://localhost:8081
```

Exemplo para outro host/porta:

```env
VITE_API_URL=http://localhost:8082
```
