import csv
import io
from flask import Blueprint, jsonify, make_response, render_template, request, redirect, url_for
from models import create_product, delete_product, get_products, update_product
from algorithms.knapsack import optimize_products

routes = Blueprint("main", __name__)


@routes.route("/")
def index():
    return render_template("index.html")


@routes.route("/products")
def products():
    search_query = request.args.get("search", "")
    items = get_products(search_query)
    return render_template("products.html", products=items, search_query=search_query)


@routes.route("/products", methods=["POST"])
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
def optimize_page():
    items = get_products()
    return render_template("optimize.html", products=items)


@routes.route("/optimize", methods=["POST"])
def optimize():
    budget = request.form.get("budget", 0)
    capacity = request.form.get("capacity", 0)
    items = get_products()
    result = optimize_products(items, budget, capacity)
    # pass products to the template for client-side visualization
    return render_template("results.html", result=result, budget=budget, capacity=capacity, products=items)


@routes.route("/reports")
def reports():
    return render_template("reports.html")


@routes.route("/reports/csv")
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
