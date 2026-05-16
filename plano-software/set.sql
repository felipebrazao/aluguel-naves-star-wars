CREATE TABLE spaceship_status (
    id SERIAL PRIMARY KEY,

    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE rental_status (
    id SERIAL PRIMARY KEY,

    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE payment_status (
    id SERIAL PRIMARY KEY,

    name VARCHAR(30) NOT NULL UNIQUE
);
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    swapi_id INT NOT NULL UNIQUE,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(120) NOT NULL UNIQUE,

    cpf VARCHAR(11) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    role_id INT NOT NULL REFERENCES roles(id),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE spaceships (
    id SERIAL PRIMARY KEY,

    swapi_id INT UNIQUE,

    name VARCHAR(100) NOT NULL,

    model VARCHAR(100) NOT NULL,

    manufacturer VARCHAR(100),

    cost_in_credits BIGINT,

    capacity INT NOT NULL,

    daily_price NUMERIC(10,2) NOT NULL,

    status_id INT NOT NULL REFERENCES spaceship_status(id),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id),

    spaceship_id INT NOT NULL REFERENCES spaceships(id),

    status_id INT NOT NULL REFERENCES rental_status(id),

    start_date TIMESTAMP NOT NULL,

    end_date TIMESTAMP NOT NULL,

    actual_pickup_date TIMESTAMP,

    total_price NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    rental_id INT NOT NULL REFERENCES rentals(id),

    status_id INT NOT NULL REFERENCES payment_status(id),

    amount NUMERIC(10,2) NOT NULL,

    payment_method_id INT NOT NULL REFERENCES payment_methods(id),

    paid_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== Seed Data =====
INSERT INTO spaceship_status (name) VALUES ('disponivel'), ('alugada'), ('manutencao');
INSERT INTO rental_status (name) VALUES ('ativa'), ('concluida'), ('cancelada');
INSERT INTO roles (name) VALUES ('admin'), ('cliente');
INSERT INTO payment_status (name) VALUES ('pendente'), ('pago'), ('cancelado');
INSERT INTO payment_methods (name) VALUES ('credito'), ('debito'), ('pix');
