CREATE DATABASE IF NOT EXISTS stock_optimizer;
USE stock_optimizer;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  purchase_cost DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  storage INT NOT NULL,
  quantity INT NOT NULL
);

INSERT INTO products (product_name, purchase_cost, selling_price, profit, storage, quantity) VALUES
('Steel Rods', 120.00, 165.00, 45.00, 6, 10),
('Packaging Boxes', 50.00, 75.00, 25.00, 4, 20),
('Warehouse Labels', 20.00, 35.00, 15.00, 2, 30),
('Industrial Gloves', 80.00, 110.00, 30.00, 5, 15),
('Safety Helmets', 150.00, 205.00, 55.00, 7, 8);
