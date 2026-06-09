# Starship Rental Backend

Guia rápido para executar a API Spring Boot localmente.

## Pre-requisitos

- Java 21 instalado
- `JAVA_HOME` configurado apontando para o JDK 21
- Docker Desktop em execução (para subir o PostgreSQL)
- Maven Wrapper do projeto (`mvnw.cmd`) ou Maven global

## 1) Subir infraestrutura (PostgreSQL)

No diretório `backend`:

```powershell
docker compose up -d postgres
```

Banco esperado pela aplicação:

- Host: `localhost`
- Porta: `5433`
- Database: `star_rental`
- User: `dev123`
- Password: `dev123`

## 2) Executar a aplicação

No diretório `backend/starship-rental`:

### Opção A: Maven Wrapper (recomendado)

```powershell
.\mvnw.cmd spring-boot:run
```

### Opção B: Maven global

```powershell
mvn spring-boot:run
```

API padrão:

- `http://localhost:8081`

Para sobrescrever a porta na sessão atual:

```powershell
$env:SERVER_PORT = "8082"
```

## 3) Rodar testes

No diretório `backend/starship-rental`:

### Maven Wrapper

```powershell
.\mvnw.cmd test
```

### Maven global

```powershell
mvn test
```

## 4) Parar infraestrutura

No diretório `backend`:

```powershell
docker compose stop postgres
```

## Troubleshooting

### `JAVA_HOME` não configurado

Se aparecer erro de `JAVA_HOME`, configure no PowerShell atual:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:Path = "$env:JAVA_HOME\\bin;$env:Path"
```

Depois valide:

```powershell
java -version
mvn -v
```

### Wrapper retornando erro de shell

Se o `mvnw.cmd` falhar por shell no Windows, use Maven global (`mvn`) após corrigir o `JAVA_HOME`.

### Docker API indisponivel no Windows

Se aparecer erro como:

`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

o Docker Desktop nao esta com o daemon Linux ativo. Faça:

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Aguarde o Docker ficar como running e valide:

```powershell
docker version
docker context ls
```

Depois tente novamente no diretorio `backend`:

```powershell
docker compose up -d postgres
```
