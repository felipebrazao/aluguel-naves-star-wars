# Testes - Starship Rental Frontend

## Visão Geral

Este documento descreve a configuração de testes para o frontend React da aplicação Starship Rental.

## Tecnologias Utilizadas

- **Vitest**: Framework de testes rápido e moderno, nativo para Vite
- **React Testing Library**: Testes focados em comportamento do usuário
- **jsdom**: Ambiente DOM para testes
- **@testing-library/jest-dom**: Matchers customizados para DOM

## Configuração

### Arquivos de Configuração

1. **vitest.config.ts**: Configuração do Vitest
   - Ambiente: jsdom
   - Setup file: src/test/setup.ts
   - Coverage com v8 provider

2. **src/test/setup.ts**: Inicialização dos testes
   - Importa matchers do jest-dom

3. **package.json scripts**:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest --coverage"
   ```

## Estrutura de Testes

```
src/
├── __tests__/
│   └── unit/
│       └── App.test.tsx
├── test/
│   └── setup.ts
└── App.tsx
```

## Testes Implementados

### App.test.tsx
Testes para o componente App (template Vite inicial):

#### Render
- Renderização do hero section com logos
- Renderização do heading principal
- Renderização do botão counter com valor inicial 0
- Renderização da seção de documentação
- Renderização da seção de conexão
- Links externos com hrefs corretos

#### Interaction
- Incremento do contador ao clicar no botão
- Múltiplos cliques incrementam corretamente

#### Accessibility
- Botão com type="button"
- Ícones com aria-hidden="true"

## Como Executar

### Instalar dependências
```bash
npm install
```

### Executar testes em modo watch
```bash
npm test
```

### Executar testes uma vez
```bash
npm test -- --run
```

### Executar com UI
```bash
npm run test:ui
```

### Gerar relatório de coverage
```bash
npm run test:coverage
```

## Convenções de Testes

### Nomenclatura
- Arquivos: `ComponentName.test.tsx`
- Describe: Nome do componente
- Testes: Should [ação esperada] quando [condição]

### Estrutura
```typescript
describe('ComponentName', () => {
  describe('Render', () => {
    it('should render correctly', () => {
      // teste
    });
  });

  describe('Interaction', () => {
    it('should handle user interaction', () => {
      // teste
    });
  });
});
```

### Padrões
- Usar `screen` para queries
- Usar `userEvent` para interações
- Preferir queries semânticas (getByRole, getByText)
- Isolar testes - cada teste deve ser independente

## Próximos Passos

Quando novos componentes forem implementados:

1. Criar arquivo de teste na pasta `src/__tests__/unit/`
2. Testar renderização inicial
3. Testar interações do usuário
4. Testar estados de loading/error quando aplicável
5. Testar acessibilidade

## Dependências de Teste

```json
{
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.4.2",
  "@testing-library/user-event": "^14.5.2",
  "@vitest/coverage-v8": "^1.4.0",
  "@vitest/ui": "^1.4.0",
  "jsdom": "^24.0.0",
  "vitest": "^1.4.0"
}
```
