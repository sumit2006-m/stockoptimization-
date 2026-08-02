# Stock Purchase & Storage Cost Optimization System

A full-stack Flask application that demonstrates the 0/1 Knapsack Algorithm for optimizing stock purchases under budget and storage constraints.

## Features
- Product management (create, edit, delete, search)
- Budget and storage-based optimization using dynamic programming
- Result analysis with DP table, complexity, and report export
- Elegant, warm glassmorphism UI

## Setup
1. Create and activate a Python virtual environment.
2. Install dependencies:
   pip install -r requirements.txt
3. Create a MySQL database and import database.sql.
4. Set environment variables:
   - DB_TYPE=mysql
   - DB_HOST=localhost
   - DB_PORT=3306
   - DB_USER=root
   - DB_PASSWORD=your_password
   - DB_NAME=stock_optimizer
5. Run the app:
   python app.py

If MySQL is not available, the app will fall back to a local SQLite database automatically for testing.
