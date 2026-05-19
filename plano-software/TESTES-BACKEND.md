# Testes - Starship Rental Backend

## Visão Geral

Este documento descreve os testes unitários e de integração implementados para a aplicação Starship Rental.

## Estrutura de Testes

```
src/test/java/com/starwars/starshiprental/
├── unit/
│   ├── service/
│   │   ├── SpaceshipServiceTest.java
│   │   ├── RentalServiceTest.java
│   │   ├── PaymentServiceTest.java
│   │   ├── UserServiceTest.java
│   │   ├── PlanetServiceTest.java
│   │   ├── SpaceshipImportServiceTest.java
│   │   └── UserImportServiceTest.java
│   └── client/
│       └── SwapiClientTest.java
├── integration/
│   └── controller/
│       ├── SpaceshipControllerTest.java
│       ├── RentalControllerTest.java
│       ├── PaymentControllerTest.java
│       ├── UserControllerTest.java
│       └── PlanetControllerTest.java
└── config/
    └── TestContainersConfig.java
```

## Testes Unitários

### 1. SpaceshipServiceTest
- **calculateDailyPrice**: Valores de fronteira (null, negativo, zero, valores extremos), floor de 100.00, ceiling de 50000.00
- **create**: Criação com status padrão, erro quando status não encontrado
- **findAll**: Com e sem filtro de ativo
- **findById**: Busca por ID, erro quando não encontrado
- **update**: Atualização completa, erro quando nave não existe
- **toggleActive**: Alternar status ativo/inativo

### 2. RentalServiceTest
- **create**: Cálculo de preço, validações de nave disponível, planetas, datas
- **findAll**: Listagem de todos os aluguéis
- **findById**: Busca por ID
- **conclude**: Concluir aluguel ativo, erros de validação
- **cancel**: Cancelar aluguel ativo, erros de validação

### 3. PaymentServiceTest
- **createPending**: Criar pagamento pendente automaticamente
- **findAll**: Listagem de pagamentos
- **findById**: Busca por ID
- **findByRentalId**: Busca por ID do aluguel
- **pay**: Processar pagamento, validações de status
- **cancel**: Cancelar pagamento pendente

### 4. UserServiceTest
- **create**: Criação com role, validações
- **findAll**: Com e sem filtro de ativo
- **findById**: Busca por ID
- **update**: Atualização completa
- **toggleActive**: Alternar status ativo/inativo

### 5. PlanetServiceTest
- **create**: Criação de planeta
- **findAll**: Listagem com e sem filtro
- **findById**: Busca por ID
- **update**: Atualização completa
- **toggleActive**: Alternar status

### 6. SpaceshipImportServiceTest
- **importSpaceships**: Importação da SWAPI, parsing de dados, cálculo de preço
- **saveOrUpdate**: Atualização de naves existentes
- Tratamento de valores nulos, formatados com vírgulas, "n/a"

### 7. UserImportServiceTest
- **importUsers**: Importação de personagens da SWAPI
- **saveOrUpdate**: Atualização de usuários existentes
- Geração de email no formato correto

### 8. SwapiClientTest
- **fetchAllStarships**: Busca de naves da API externa
- **fetchAllPlanets**: Busca de planetas
- **fetchAllPeople**: Busca de personagens
- Tratamento de erros HTTP, respostas vazias

## Testes de Integração (Controllers)

### 1. SpaceshipControllerTest
- **POST /spaceships**: Criação válida e inválida, validações
- **GET /spaceships**: Listagem com/sem filtro
- **GET /spaceships/{id}**: Busca por ID, 404
- **PUT /spaceships/{id}**: Atualização, 404
- **PATCH /spaceships/{id}/active**: Toggle ativo

### 2. RentalControllerTest
- **POST /rentals**: Criação com cálculo de preço, validações de nave/datas
- **GET /rentals**: Listagem
- **GET /rentals/{id}**: Busca por ID
- **PATCH /rentals/{id}/conclude**: Concluir aluguel
- **PATCH /rentals/{id}/cancel**: Cancelar aluguel

### 3. PaymentControllerTest
- **GET /payments**: Listagem
- **GET /payments/{id}**: Busca por ID
- **GET /payments/rental/{rentalId}**: Busca por aluguel
- **PATCH /payments/{id}/pay**: Processar pagamento
- **PATCH /payments/{id}/cancel**: Cancelar pagamento

### 4. UserControllerTest
- **POST /users**: Criação, validações
- **GET /users**: Listagem com/sem filtro
- **GET /users/{id}**: Busca por ID
- **PUT /users/{id}**: Atualização
- **PATCH /users/{id}/active**: Toggle ativo

### 5. PlanetControllerTest
- **POST /planets**: Criação
- **GET /planets**: Listagem
- **GET /planets/{id}**: Busca por ID
- **PUT /planets/{id}**: Atualização
- **PATCH /planets/{id}/active**: Toggle ativo

## Tecnologias Utilizadas

### Backend
- **JUnit 5**: Framework de testes
- **Mockito**: Mocking de dependências
- **AssertJ**: Asserções fluentes
- **Testcontainers**: PostgreSQL para testes de integração
- **Spring Boot Test**: Testes de integração com Spring

### Configuração de Testes
- `TestContainersConfig.java`: Configuração de container PostgreSQL
- `application-test.properties`: Configurações de teste
- `GlobalExceptionHandler.java`: Handler de exceções para respostas consistentes

## Como Executar

### Todos os testes
```bash
./mvnw test
```

### Testes unitários específicos
```bash
./mvnw test -Dtest=SpaceshipServiceTest
```

### Testes de integração
```bash
./mvnw test -Dtest=SpaceshipControllerTest
```

### Com coverage
```bash
./mvnw test jacoco:report
```

## Cobertura

- **Meta**: 80% linhas, 70% branches (backend)
- Testes cobrem:
  - Caminho feliz (happy path)
  - Casos de erro e exceções
  - Valores de fronteira
  - Validações de entrada
