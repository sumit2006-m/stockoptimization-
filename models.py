import os
import sqlite3
from typing import Optional

try:
    import mysql.connector
except ImportError:  # pragma: no cover
    mysql.connector = None


def get_db_connection():
    db_type = os.getenv("DB_TYPE", "sqlite").lower()

    if db_type == "mysql":
        if mysql.connector is None:
            raise RuntimeError("mysql-connector-python is not installed")
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "stock_optimizer"),
            autocommit=True,
        )

    conn = sqlite3.connect("stock_optimizer.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    try:
        if conn.__class__.__module__.startswith("sqlite3"):
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_name TEXT NOT NULL,
                    purchase_cost REAL NOT NULL,
                    selling_price REAL NOT NULL,
                    profit REAL NOT NULL,
                    storage INTEGER NOT NULL,
                    quantity INTEGER NOT NULL
                )
                """
            )
            conn.commit()
        else:
            conn.cursor().execute(
                """
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    product_name VARCHAR(100) NOT NULL,
                    purchase_cost DECIMAL(10,2) NOT NULL,
                    selling_price DECIMAL(10,2) NOT NULL,
                    profit DECIMAL(10,2) NOT NULL,
                    storage INT NOT NULL,
                    quantity INT NOT NULL
                )
                """
            )
    finally:
        conn.close()


def seed_products():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if conn.__class__.__module__.startswith("sqlite3"):
            cursor.execute("SELECT COUNT(*) FROM products")
        else:
            cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        if count > 0:
            return

        sample_products = [
            ("Steel Rods", 120.0, 165.0, 45.0, 6, 10),
            ("Packaging Boxes", 50.0, 75.0, 25.0, 4, 20),
            ("Warehouse Labels", 20.0, 35.0, 15.0, 2, 30),
            ("Industrial Gloves", 80.0, 110.0, 30.0, 5, 15),
            ("Safety Helmets", 150.0, 205.0, 55.0, 7, 8),
        ]
        if conn.__class__.__module__.startswith("sqlite3"):
            cursor.executemany(
                """
                INSERT INTO products (product_name, purchase_cost, selling_price, profit, storage, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                sample_products,
            )
        else:
            cursor.executemany(
                """
                INSERT INTO products (product_name, purchase_cost, selling_price, profit, storage, quantity)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                sample_products,
            )
        conn.commit()
    finally:
        conn.close()


def get_products(search_query: Optional[str] = None):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if search_query:
            if conn.__class__.__module__.startswith("sqlite3"):
                cursor.execute(
                    "SELECT * FROM products WHERE product_name LIKE ? ORDER BY id",
                    (f"%{search_query}%",),
                )
            else:
                cursor.execute(
                    "SELECT * FROM products WHERE product_name LIKE %s ORDER BY id",
                    (f"%{search_query}%",),
                )
        else:
            cursor.execute("SELECT * FROM products ORDER BY id")

        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def create_product(payload):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        profit = float(payload["selling_price"]) - float(payload["purchase_cost"])
        if conn.__class__.__module__.startswith("sqlite3"):
            cursor.execute(
                """
                INSERT INTO products (product_name, purchase_cost, selling_price, profit, storage, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    payload["product_name"],
                    float(payload["purchase_cost"]),
                    float(payload["selling_price"]),
                    profit,
                    int(payload["storage"]),
                    int(payload["quantity"]),
                ),
            )
        else:
            cursor.execute(
                """
                INSERT INTO products (product_name, purchase_cost, selling_price, profit, storage, quantity)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    payload["product_name"],
                    float(payload["purchase_cost"]),
                    float(payload["selling_price"]),
                    profit,
                    int(payload["storage"]),
                    int(payload["quantity"]),
                ),
            )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def update_product(product_id, payload):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        profit = float(payload["selling_price"]) - float(payload["purchase_cost"])
        if conn.__class__.__module__.startswith("sqlite3"):
            cursor.execute(
                """
                UPDATE products
                SET product_name = ?, purchase_cost = ?, selling_price = ?, profit = ?, storage = ?, quantity = ?
                WHERE id = ?
                """,
                (
                    payload["product_name"],
                    float(payload["purchase_cost"]),
                    float(payload["selling_price"]),
                    profit,
                    int(payload["storage"]),
                    int(payload["quantity"]),
                    product_id,
                ),
            )
        else:
            cursor.execute(
                """
                UPDATE products
                SET product_name = %s, purchase_cost = %s, selling_price = %s, profit = %s, storage = %s, quantity = %s
                WHERE id = %s
                """,
                (
                    payload["product_name"],
                    float(payload["purchase_cost"]),
                    float(payload["selling_price"]),
                    profit,
                    int(payload["storage"]),
                    int(payload["quantity"]),
                    product_id,
                ),
            )
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()


def delete_product(product_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if conn.__class__.__module__.startswith("sqlite3"):
            cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        else:
            cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()
