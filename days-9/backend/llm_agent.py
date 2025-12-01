
import re
from catalog import list_products, create_order, get_last_order

# Global variables to track last catalog results and cart (for demo, not thread-safe)
last_catalog_results = []
cart = []

def process_voice_command(text: str) -> str:
    text = text.lower()
    # Order history and status queries
    if "last 3 orders" in text or "last three orders" in text:
        from catalog import ORDERS
        orders = ORDERS[-3:] if len(ORDERS) >= 3 else ORDERS
        if not orders:
            return "No previous orders found."
        resp = []
        for o in orders:
            items = ", ".join(f"{item['name']} x{item['quantity']}" for item in o['items'])
            resp.append(f"Order {o['id']}: {items} for {o['total']} {o['currency']} on {o['created_at'][:10]}")
        return "Last orders: " + " | ".join(resp)
    if "order history" in text or "what have i bought" in text:
        from catalog import ORDERS
        if not ORDERS:
            return "No previous orders found."
        resp = []
        for o in ORDERS:
            items = ", ".join(f"{item['name']} x{item['quantity']}" for item in o['items'])
            resp.append(f"Order {o['id']}: {items} for {o['total']} {o['currency']} on {o['created_at'][:10]}")
        return "Order history: " + " | ".join(resp)
    if "total spent today" in text:
        from catalog import ORDERS
        from datetime import datetime
        today = datetime.now().date()
        total = 0
        for o in ORDERS:
            order_date = datetime.fromisoformat(o['created_at']).date()
            if order_date == today:
                total += o['total']
        return f"Total spent today: {total} INR."
    # Last order (check before product search)
    if "last order" in text or "what did i buy" in text:
        order = get_last_order()
        if not order:
            return "No previous orders found."
        # Support both 'line_items' (new) and 'items' (legacy)
        items_list = order.get('line_items') or order.get('items') or []
        items = ", ".join(f"{item['name']} x{item.get('quantity', 1)}" for item in items_list)
        return f"Your last order: {items} for {order['total']} {order['currency']}."
    # Product search
    global last_catalog_results
    if any(word in text for word in ["show", "find", "list", "catalog", "browse"]):
        filters = {}
        categories = ["mug", "hoodie", "t-shirt", "tshirt", "shirt", "jeans", "saree", "shoes", "watch", "bag", "laptop", "mobile", "tv"]
        # Match category in singular or plural, and allow for 'show hoodies', 'show all mugs', etc.
        for cat in categories:
            if re.search(rf"\\b{cat}s?\\b", text):
                filters["category"] = cat.replace("t-shirt", "tshirt")
        colors = ["white", "black", "blue", "aloe wash", "red", "grey", "navy blue", "silver"]
        for color in colors:
            if re.search(rf"\\b{color}\\b", text):
                filters["color"] = color
        price_match = re.search(r'(under|below) (\d+)', text)
        if price_match:
            filters["max_price"] = int(price_match.group(2))
        products = list_products(filters if filters else None)
        last_catalog_results = products
        if not products:
            return "No products found for your request."
        return "Here are some products: " + ", ".join(f"{p['name']} ({p['price']} {p['currency']})" for p in products)
    # Cart operations
    global cart
    # Add to cart (robust natural language, fuzzy match)
    if re.search(r"add (.+?) to (my )?cart", text) or ("add" in text and "cart" in text):
        # Try to add by reference or name
        ref_match = re.search(r'(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)', text)
        pos_map = {'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4, 'sixth': 5, 'seventh': 6, 'eighth': 7, 'ninth': 8, 'tenth': 9}
        if ref_match and last_catalog_results:
            idx = pos_map.get(ref_match.group(1), None)
            if idx is not None and idx < len(last_catalog_results):
                prod = last_catalog_results[idx]
                cart.append({"product_id": prod["id"], "name": prod["name"], "quantity": 1})
                return f"Added {prod['name']} to your cart."
        # Otherwise, match by name/category in the phrase 'add X to cart'
        add_match = re.search(r"add (.+?) to (my )?cart", text)
        if add_match:
            prod_phrase = add_match.group(1).strip()
            # Remove common articles
            prod_phrase = re.sub(r'^(the|a|an) ', '', prod_phrase)
            for prod in list_products():
                prod_name = prod["name"].lower()
                prod_cat = prod["category"].lower()
                # Fuzzy/partial match
                if prod_phrase in prod_name or prod_phrase in prod_cat or prod_name in prod_phrase or prod_cat in prod_phrase:
                    cart.append({"product_id": prod["id"], "name": prod["name"], "quantity": 1})
                    return f"Added {prod['name']} to your cart."
        # Fallback: match by name/category anywhere, ignore articles
        text_no_articles = re.sub(r'\b(the|a|an)\b', '', text)
        for prod in list_products():
            prod_name = prod["name"].lower()
            prod_cat = prod["category"].lower()
            if prod_name in text_no_articles or prod_cat in text_no_articles or any(word in text_no_articles for word in prod_name.split()):
                cart.append({"product_id": prod["id"], "name": prod["name"], "quantity": 1})
                return f"Added {prod['name']} to your cart."
        return "Sorry, I couldn't identify the product to add to your cart."
    # Remove from cart (robust natural language, fuzzy match)
    if re.search(r"remove (.+?) from (my )?cart", text) or ("remove" in text and "cart" in text):
        remove_match = re.search(r"remove (.+?) from (my )?cart", text)
        if remove_match:
            prod_phrase = remove_match.group(1).strip()
            prod_phrase = re.sub(r'^(the|a|an) ', '', prod_phrase)
            for i, item in enumerate(cart):
                if prod_phrase in item["name"].lower() or prod_phrase in item["product_id"] or item["name"].lower() in prod_phrase:
                    removed = cart.pop(i)
                    return f"Removed {removed['name']} from your cart."
        # Fallback: match by name/category anywhere, ignore articles
        text_no_articles = re.sub(r'\b(the|a|an)\b', '', text)
        for i, item in enumerate(cart):
            if item["name"].lower() in text_no_articles or item["product_id"] in text_no_articles:
                removed = cart.pop(i)
                return f"Removed {removed['name']} from your cart."
        return "Sorry, I couldn't find that item in your cart."
    # View cart (robust natural language)
    # View cart (robust natural language, only on clear cart-view phrases)
    if re.search(r"what('| i)s in (my )?cart", text) or re.search(r"show (my )?cart", text) or re.search(r"view (my )?cart", text):
        if not cart:
            return "Your cart is empty."
        return "Your cart contains: " + ", ".join(f"{item['name']} x{item['quantity']}" for item in cart)
    # Checkout
    if "checkout" in text or "place order" in text:
        if not cart:
            return "Your cart is empty. Add items before checking out."
        order = create_order(cart)
        cart.clear()
        return f"Order placed for: {', '.join(item['name'] for item in order['items'])} at {order['total']} {order['currency']}."
    # Place order (more flexible matching, supports reference to last shown products)
    order_phrases = ["buy", "order", "purchase", "put", "get", "want"]
    if any(word in text for word in order_phrases):
        ref_match = re.search(r'(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)', text)
        pos_map = {'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4, 'sixth': 5, 'seventh': 6, 'eighth': 7, 'ninth': 8, 'tenth': 9}
        if ref_match and last_catalog_results:
            idx = pos_map.get(ref_match.group(1), None)
            if idx is not None and idx < len(last_catalog_results):
                prod = last_catalog_results[idx]
                size_match = re.search(r'size ([a-zA-Z0-9]+)', text)
                size = size_match.group(1) if size_match else None
                order_item = {"product_id": prod["id"], "quantity": 1}
                if size:
                    order_item["size"] = size
                order = create_order([order_item])
                return f"Order placed for {prod['name']}{' (size ' + size + ')' if size else ''} at {order['total']} {order['currency']}."
            else:
                return "Sorry, I couldn't find that product in the last list."
        for prod in list_products():
            prod_name = prod["name"].lower()
            prod_cat = prod["category"].lower()
            if (prod_name in text or prod_cat in text or any(word in text for word in prod_name.split())):
                size_match = re.search(r'size ([a-zA-Z0-9]+)', text)
                size = size_match.group(1) if size_match else None
                order_item = {"product_id": prod["id"], "quantity": 1}
                if size:
                    order_item["size"] = size
                order = create_order([order_item])
                return f"Order placed for {prod['name']}{' (size ' + size + ')' if size else ''} at {order['total']} {order['currency']}."
        return "Sorry, I couldn't identify the product to order."
    return "Sorry, I didn't understand. You can say things like 'show hoodies', 'buy mug', or 'what was my last order?'"
