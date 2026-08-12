import csv
import io
from functools import wraps
from flask import Blueprint, jsonify, make_response, render_template, request, redirect, url_for, flash, session
from models import create_product, delete_product, get_products, update_product
from algorithms.knapsack import optimize_products

routes = Blueprint("main", __name__)


def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if not session.get("user"):
            return redirect(url_for("main.login_page"))
        return view_func(*args, **kwargs)
    return wrapper


@routes.route("/")
@login_required
def index():
    return render_template("index.html")


@routes.route("/products")
@login_required
def products():
    search_query = request.args.get("search", "")
    items = get_products(search_query)
    return render_template("products.html", products=items, search_query=search_query)


@routes.route("/products", methods=["POST"])
@login_required
def add_product():
    payload = {
        "product_name": request.form.get("product_name"),
        "purchase_cost": request.form.get("purchase_cost"),
        "selling_price": request.form.get("selling_price"),
        "storage": request.form.get("storage"),
        "quantity": request.form.get("quantity"),
    }
    create_product(payload)
    return redirect(url_for("main.products"))


@routes.route("/products/<int:product_id>", methods=["PUT"])
def edit_product(product_id):
    payload = request.get_json()
    update_product(product_id, payload)
    return jsonify({"status": "updated"})


@routes.route("/products/<int:product_id>", methods=["DELETE"])
def remove_product(product_id):
    delete_product(product_id)
    return jsonify({"status": "deleted"})


@routes.route("/optimize")
@login_required
def optimize_page():
    items = get_products()
    return render_template("optimize.html", products=items)


@routes.route("/optimize", methods=["POST"])
@login_required
def optimize():
    budget = request.form.get("budget", 0)
    capacity = request.form.get("capacity", 0)
    items = get_products()
    result = optimize_products(items, budget, capacity)
    # pass products to the template for client-side visualization
    return render_template("results.html", result=result, budget=budget, capacity=capacity, products=items)


@routes.route("/reports")
@login_required
def reports():
    return render_template("reports.html")


@routes.route("/reports/csv")
@login_required
def export_csv():
    items = get_products()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Product Name", "Purchase Cost", "Selling Price", "Profit", "Storage", "Quantity"])
    for item in items:
        writer.writerow([
            item["product_name"],
            item["purchase_cost"],
            item["selling_price"],
            item["profit"],
            item["storage"],
            item["quantity"],
        ])
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=stock_report.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


@routes.route("/about")
def about():
    return render_template("about.html")


@routes.route("/login")
def login_page():
    # if user already has a session, send them to the app
    if session.get("user"):
        flash("You are already logged in.", "info")
        return redirect(url_for("main.index"))
    return render_template("login.html", otp_sent=False, phone_number="")


@routes.route("/login/email", methods=["POST"])
def login_email():
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "").strip()

    if not email or not password:
        flash("Please provide both email and password.", "error")
        return redirect(url_for("main.login_page"))

    # For demo: create a simple session on email login.
    session["user"] = email
    flash("Login successful.", "success")
    return redirect(url_for("main.index"))


@routes.route("/login/phone", methods=["POST"])
def login_phone():
    phone_number = request.form.get("phone_number", "").strip()
    if not phone_number:
        flash("Please enter a valid phone number.", "error")
        return redirect(url_for("main.login_page"))

    flash("OTP sent. This is a placeholder flow; use the demo OTP to continue.", "info")
    return render_template("login.html", otp_sent=True, phone_number=phone_number)


@routes.route("/verify-otp", methods=["POST"])
def verify_otp():
    otp = request.form.get("otp", "").strip()
    if otp == "123456":
        flash("OTP verified. Login successful.", "success")
        session["user"] = "demo_user"
        return redirect(url_for("main.index"))

    flash("Invalid OTP. Use 123456 for the demo.", "error")
    return render_template("login.html", otp_sent=True, phone_number=request.form.get("phone_number", ""))


@routes.route("/logout")
def logout():
    session.pop("user", None)
    flash("You have been logged out.", "info")
    return redirect(url_for("main.login_page"))


@routes.route("/register")
def register_page():
    if session.get("user"):
        flash("You are already logged in.", "info")
        return redirect(url_for("main.index"))
    return render_template("register.html")


@routes.route("/register/email", methods=["POST"])
def register_email():
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "").strip()

    if not email or not password:
        flash("Please provide email and password.", "error")
        return redirect(url_for("main.register_page"))

    flash("Registration received. Client-side auth (Firebase) is recommended for account creation in this demo.", "info")
    return redirect(url_for("main.login_page"))


@routes.route("/forgot")
def forgot_page():
    if session.get("user"):
        flash("You are already logged in.", "info")
        return redirect(url_for("main.index"))
    return render_template("forgot.html")


@routes.route("/forgot/email", methods=["POST"])
def forgot_email():
    email = request.form.get("email", "").strip()
    if not email:
        flash("Please provide an email address.", "error")
        return redirect(url_for("main.forgot_page"))

    flash("Password reset requested. Client-side Firebase will handle sending reset emails in this demo.", "info")
    return redirect(url_for("main.login_page"))


@routes.route('/session_login', methods=['POST'])
def session_login():
    data = request.get_json(silent=True) or request.form
    email = data.get('email')
    if not email:
        return jsonify({'error': 'missing email'}), 400

    session['user'] = email
    return jsonify({'status': 'ok'})
