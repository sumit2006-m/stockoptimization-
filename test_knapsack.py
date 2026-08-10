from models import get_products
from algorithms.knapsack import optimize_products

products = get_products()
print('Loaded', len(products), 'products')
res = optimize_products(products, 1000, 10)
print('Total cost:', res['total_cost'])
print('Total profit:', res['total_profit'])
print('Selected ids:', res['selected_ids'])
print('DP slice (6x6):')
if res.get('dp_preview'):
    print('DP preview budgets:', res.get('dp_preview_budgets'))
    print('DP preview storages:', res.get('dp_preview_storages'))
    for row in res['dp_preview']:
        print(row)
else:
    print('DP slice (6x6):')
    for row in res['dp_matrix'][:6]:
        print(row[:6])
