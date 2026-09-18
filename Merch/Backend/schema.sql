-- Run this in your Neon PostgreSQL database

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    size VARCHAR(10),
    quantity INT NOT NULL,
    address TEXT NOT NULL,
    roll_no VARCHAR(20),
    phone VARCHAR(20),
    printed_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
