from flask import Flask
from routes import routes
from models import init_db, seed_products

app = Flask(__name__)
app.secret_key = "change-me-to-a-secure-secret"
app.register_blueprint(routes)


if __name__ == "__main__":
    init_db()
    seed_products()
    app.run(debug=True, host="0.0.0.0", port=5000)
