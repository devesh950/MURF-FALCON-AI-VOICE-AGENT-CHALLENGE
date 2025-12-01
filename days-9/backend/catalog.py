# Product catalog and order management for Day 9 ACP-inspired agent
import json
from datetime import datetime
from typing import List, Dict, Optional
import os

CATALOG_FILE = os.path.join(os.path.dirname(__file__), 'products.json')
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')

# Example static product list (can be loaded from JSON)
PRODUCTS = [
    {"id": "mug-001", "name": "Stoneware Coffee Mug", "description": "A sturdy white mug.", "price": 800, "currency": "INR", "category": "mug", "color": "white"},
    {"id": "hoodie-001", "name": "Classic Hoodie", "description": "Comfy cotton hoodie.", "price": 1500, "currency": "INR", "category": "hoodie", "color": "black", "size": ["S", "M", "L"]},
    {"id": "tshirt-001", "name": "Graphic T-Shirt", "description": "Soft tee with print.", "price": 600, "currency": "INR", "category": "tshirt", "color": "blue", "size": ["M", "L"]},
]

# Save products to file (if not exists)
if not os.path.exists(CATALOG_FILE):
    with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(PRODUCTS, f, indent=2)

# In-memory orders (for session)
ORDERS: List[Dict] = []

def load_products() -> List[Dict]:
    with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def list_products(filters: Optional[Dict] = None) -> List[Dict]:
    products = load_products()
    if not filters:
        return products
    def match(prod):
        for k, v in filters.items():
            if k == "max_price":
                if prod.get("price", 0) > v:
                    return False
            elif k == "color":
                if prod.get("color", "").lower() != v.lower():
                    return False
            elif k == "category":
                if prod.get("category", "").lower() != v.lower():
                    return False
            else:
                if k in prod and prod[k] != v:
                    return False
        return True
    return [p for p in products if match(p)]

def save_order(order: Dict):
    ORDERS.append(order)
    # Also append to file
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
            all_orders = json.load(f)
    else:
        all_orders = []
    all_orders.append(order)
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_orders, f, indent=2)

def create_order(line_items: List[Dict]) -> Dict:
    products = load_products()
    line_items_out = []
    total = 0
    for li in line_items:
        prod = next((p for p in products if p['id'] == li['product_id']), None)
        if not prod:
            continue
        qty = li.get('quantity', 1)
        line_items_out.append({
            "product_id": prod['id'],
            "name": prod['name'],
            "quantity": qty,
            "unit_amount": prod['price'],
            "currency": prod['currency'],
            **({"size": li["size"]} if "size" in li else {})
        })
        total += prod['price'] * qty
    order = {
        "id": f"order-{len(ORDERS)+1}",
        "line_items": line_items_out,
        "total": total,
        "currency": line_items_out[0]['currency'] if line_items_out else 'INR',
        "created_at": datetime.now().isoformat(),
        "status": "CONFIRMED",
        "buyer": {"name": "Demo User"}
    }
    save_order(order)
    return order

def get_last_order() -> Optional[Dict]:
    if ORDERS:
        return ORDERS[-1]
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
            all_orders = json.load(f)
            if all_orders:
                return all_orders[-1]
    return None
