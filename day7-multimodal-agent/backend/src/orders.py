"""Order management and persistence."""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# Orders file path
ORDERS_FILE = Path(__file__).parent.parent / "orders.json"


def initialize_orders_file():
    """Create initial orders file."""
    orders_data = {
        "orders": []
    }
    
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders_data, f, indent=2)
    
    print(f"Orders file initialized at {ORDERS_FILE}")


def load_orders():
    """Load all orders from file."""
    if not ORDERS_FILE.exists():
        initialize_orders_file()
    
    with open(ORDERS_FILE, 'r') as f:
        return json.load(f)


def save_orders(orders_data):
    """Save orders to file."""
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders_data, f, indent=2)


def generate_order_id():
    """Generate a unique order ID."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"ORD-{timestamp}"


def save_order(cart_items: List[Dict], customer_name: str = "Customer", delivery_address: str = ""):
    """Save a new order to the orders file."""
    orders_data = load_orders()
    
    # Calculate total
    total = sum(item['price'] * item['quantity'] for item in cart_items)
    
    # Create order object
    order = {
        "order_id": generate_order_id(),
        "customer_name": customer_name,
        "delivery_address": delivery_address,
        "items": cart_items,
        "total": round(total, 2),
        "timestamp": datetime.now().isoformat(),
        "status": "received",
        "status_history": [
            {
                "status": "received",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }
    
    orders_data['orders'].append(order)
    save_orders(orders_data)
    
    return order


def get_latest_order() -> Optional[Dict]:
    """Get the most recent order."""
    orders_data = load_orders()
    
    if orders_data['orders']:
        return orders_data['orders'][-1]
    
    return None


def get_order_by_id(order_id: str) -> Optional[Dict]:
    """Get a specific order by ID."""
    orders_data = load_orders()
    
    for order in orders_data['orders']:
        if order['order_id'] == order_id:
            return order
    
    return None


def update_order_status(order_id: str, new_status: str):
    """Update the status of an order."""
    orders_data = load_orders()
    
    for order in orders_data['orders']:
        if order['order_id'] == order_id:
            order['status'] = new_status
            order['status_history'].append({
                "status": new_status,
                "timestamp": datetime.now().isoformat()
            })
            save_orders(orders_data)
            return order
    
    return None


def get_order_history(limit: int = 10) -> List[Dict]:
    """Get order history."""
    orders_data = load_orders()
    
    # Return most recent orders first
    return list(reversed(orders_data['orders']))[:limit]


def search_orders_by_item(item_name: str) -> List[Dict]:
    """Search for orders containing a specific item."""
    orders_data = load_orders()
    matching_orders = []
    
    item_name_lower = item_name.lower()
    
    for order in orders_data['orders']:
        for item in order['items']:
            if item_name_lower in item['name'].lower():
                matching_orders.append(order)
                break
    
    return matching_orders
