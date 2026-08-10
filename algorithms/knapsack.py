def optimize_products(products, budget, capacity):
    max_budget = int(float(budget))
    max_capacity = int(float(capacity))

    dp = [[0 for _ in range(max_capacity + 1)] for _ in range(max_budget + 1)]
    choices = [[None for _ in range(max_capacity + 1)] for _ in range(max_budget + 1)]

    for product in products:
        cost = int(float(product["purchase_cost"]))
        storage = int(product["storage"])
        profit = int(float(product["profit"]))
        product_id = product["id"]

        for b in range(max_budget, cost - 1, -1):
            for s in range(max_capacity, storage - 1, -1):
                new_profit = dp[b - cost][s - storage] + profit
                if new_profit > dp[b][s]:
                    dp[b][s] = new_profit
                    choices[b][s] = [] if choices[b - cost][s - storage] is None else list(choices[b - cost][s - storage])
                    choices[b][s].append(product_id)

    selected_ids = choices[max_budget][max_capacity] or []
    selected_products = [product for product in products if product["id"] in selected_ids]
    rejected_products = [product for product in products if product["id"] not in selected_ids]

    total_cost = sum(int(float(product["purchase_cost"])) for product in selected_products)
    total_profit = sum(int(float(product["profit"])) for product in selected_products)
    storage_used = sum(int(product["storage"]) for product in selected_products)
    remaining_budget = max_budget - total_cost

    total_possible_profit = sum(int(float(product["profit"])) for product in products)
    optimization_percentage = round((total_profit / total_possible_profit) * 100, 2) if total_possible_profit else 0.0

    # prepare a small preview (bottom-right corner) of the DP table for display
    preview_h = min(6, max_budget + 1)
    preview_w = min(6, max_capacity + 1)
    start_b = max(0, max_budget - preview_h + 1)
    start_s = max(0, max_capacity - preview_w + 1)
    dp_preview = [row[start_s : start_s + preview_w] for row in dp[start_b : start_b + preview_h]]
    dp_preview_budgets = list(range(start_b, start_b + preview_h))
    dp_preview_storages = list(range(start_s, start_s + preview_w))

    return {
        "selected_products": selected_products,
        "rejected_products": rejected_products,
        "total_cost": total_cost,
        "total_profit": total_profit,
        "remaining_budget": remaining_budget,
        "storage_used": storage_used,
        "dp_matrix": dp,
        "dp_preview": dp_preview,
        "dp_preview_start": (start_b, start_s),
        "dp_preview_budgets": dp_preview_budgets,
        "dp_preview_storages": dp_preview_storages,
        "selected_ids": selected_ids,
        "time_complexity": "O(n × B × C)",
        "space_complexity": "O(B × C)",
        "optimization_percentage": optimization_percentage,
    }
