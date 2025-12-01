"""Grocery ordering voice agent."""

import logging
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
)
# Optional plugin imports: guard heavy plugin modules so dev mode works
try:
    from livekit.plugins import deepgram, murf, silero
except Exception as e:
    logging.warning(
        "Optional LiveKit plugins not available; running in DEV STUB mode: %s",
        e,
    )
    deepgram = murf = silero = None
# NOTE: Skip importing heavy Google plugin in dev/debug mode to avoid
# long installs and import-time errors on machines without all deps.
# from livekit.plugins.google import llm

from catalog import search_items, get_item_by_id, get_recipe_items, get_catalog
from orders import save_order, get_latest_order, get_order_history, search_orders_by_item, update_order_status

# Load environment variables
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

# Make logging verbose for debugging startup + shutdown
logging.basicConfig(level=logging.DEBUG)

logger = logging.getLogger(__name__)


class GroceryOrderAgent(Agent):
    """Grocery and food ordering voice agent."""
    
    def __init__(self):
        # Current cart
        self.cart = []
        self.customer_name = "Customer"
        self.delivery_address = ""
        
        instructions = """You are a friendly grocery and food ordering assistant for QuickMart Express.

SPEED OPTIMIZATION: Keep all responses short and fast. Use simple, direct language. Avoid long explanations. Focus on the action taken. Be friendly but concise.

Your role is to:
1. Greet customers warmly: "Hello! Welcome to QuickMart Express. I can help you order groceries, snacks, and prepared meals. What would you like today?"
2. Help customers find and add items to their cart
3. Handle intelligent requests like "ingredients for pasta" or "I need to make a peanut butter sandwich"
4. Manage cart operations: add, remove, update quantities, and list items
5. Place orders when customers are ready
6. Track order status and provide order history

CONVERSATION FLOW:
Step 1: Greet and ask what they'd like to order
Step 2: Use search_catalog to find items when customer mentions products
Step 3: Use add_to_cart to add items with quantities
Step 4: For recipe requests like "pasta ingredients", use get_recipe_ingredients
Step 5: Confirm each item added: "I've added [item] to your cart"
Step 6: When asked "what's in my cart?", use show_cart
Step 7: When customer says "that's all" or "place order", use place_order
Step 8: For tracking questions, use check_order_status or get_my_orders

IMPORTANT GUIDELINES:
- Always confirm what you're adding to the cart
- Suggest quantities if not specified (e.g., "How many would you like?")
- For recipe requests, list all items being added
- Calculate and mention the total when showing cart or placing order
- Be conversational and helpful
- Ask for customer name and delivery address before placing order
- Remember: search first, then add to cart with exact item details

CART MANAGEMENT:
- Keep track of all items with quantities
- Allow updates and removals
- Show running total
- Confirm before placing final order

Remember: Be friendly, efficient, and always confirm cart changes!"""

        super().__init__(
            instructions=instructions,
        )
        
        logger.info("GroceryOrderAgent initialized successfully")
    
    @function_tool()
    async def search_catalog(self, item_name: str):
        """Search for items in the catalog by name.
        
        Args:
            item_name: Name or partial name of the item to search for
        
        Returns:
            List of matching items with their details
        """
        results = search_items(item_name)
        
        if not results:
            return f"Sorry, I couldn't find any items matching '{item_name}'. Could you try describing it differently?"
        
        # Format results nicely
        response = f"I found {len(results)} item(s) matching '{item_name}':\n\n"
        for item in results:
            response += f"- {item['name']} ({item['brand']}) - ${item['price']} per {item['unit']}\n"
        
        return response
    
    @function_tool()
    async def get_recipe_ingredients(self, recipe_name: str):
        """Get all ingredients needed for a recipe or meal.
        
        Args:
            recipe_name: Name of the recipe/meal (e.g., "pasta", "peanut butter sandwich", "breakfast")
        
        Returns:
            List of items needed for the recipe
        """
        items = get_recipe_items(recipe_name)
        
        if not items:
            return f"I don't have a predefined recipe for '{recipe_name}', but I can help you search for individual items. What ingredients do you need?"
        
        # Add all items to cart automatically
        total_added = 0
        items_list = []
        
        for item in items:
            # Add to cart with quantity 1
            cart_item = {
                'id': item['id'],
                'name': item['name'],
                'price': item['price'],
                'unit': item['unit'],
                'brand': item['brand'],
                'quantity': 1
            }
            self.cart.append(cart_item)
            items_list.append(f"{item['name']} ({item['brand']})")
            total_added += item['price']
        
        response = f"Perfect! For {recipe_name}, I've added these items to your cart:\n"
        response += "\n".join(f"- {item}" for item in items_list)
        response += f"\n\nTotal for these items: ${round(total_added, 2)}"
        
        return response
    
    @function_tool()
    async def add_to_cart(self, item_name: str, quantity: int = 1):
        """Add an item to the shopping cart.
        
        Args:
            item_name: Name of the item to add
            quantity: Number of units to add (default: 1)
        
        Returns:
            Confirmation message with item details
        """
        # Search for the item first
        results = search_items(item_name)
        
        if not results:
            return f"Sorry, I couldn't find '{item_name}' in our catalog. Could you try a different name?"
        
        # Use first matching item
        item = results[0]
        
        # Check if item already in cart
        existing_item = None
        for cart_item in self.cart:
            if cart_item['id'] == item['id']:
                existing_item = cart_item
                break
        
        if existing_item:
            existing_item['quantity'] += quantity
            return f"Updated! You now have {existing_item['quantity']} {item['unit']}(s) of {item['name']} in your cart."
        else:
            cart_item = {
                'id': item['id'],
                'name': item['name'],
                'price': item['price'],
                'unit': item['unit'],
                'brand': item['brand'],
                'quantity': quantity
            }
            self.cart.append(cart_item)
            
            item_total = item['price'] * quantity
            return f"Added {quantity} {item['unit']}(s) of {item['name']} ({item['brand']}) to your cart. Item total: ${round(item_total, 2)}"
    
    @function_tool()
    async def remove_from_cart(self, item_name: str):
        """Remove an item from the shopping cart.
        
        Args:
            item_name: Name of the item to remove
        
        Returns:
            Confirmation message
        """
        item_name_lower = item_name.lower()
        
        for i, cart_item in enumerate(self.cart):
            if item_name_lower in cart_item['name'].lower():
                removed_item = self.cart.pop(i)
                return f"Removed {removed_item['name']} from your cart."
        
        return f"I couldn't find '{item_name}' in your cart."
    
    @function_tool()
    async def show_cart(self):
        """Show all items currently in the shopping cart.
        
        Returns:
            List of cart items with quantities and total price
        """
        if not self.cart:
            return "Your cart is empty. What would you like to add?"
        
        response = "Here's what's in your cart:\n\n"
        total = 0
        
        for item in self.cart:
            item_total = item['price'] * item['quantity']
            total += item_total
            response += f"- {item['quantity']}x {item['name']} ({item['brand']}) - ${round(item_total, 2)}\n"
        
        response += f"\n**Cart Total: ${round(total, 2)}**"
        
        return response
    
    @function_tool()
    async def update_quantity(self, item_name: str, new_quantity: int):
        """Update the quantity of an item in the cart.
        
        Args:
            item_name: Name of the item to update
            new_quantity: New quantity (use 0 to remove)
        
        Returns:
            Confirmation message
        """
        if new_quantity < 0:
            return "Quantity must be 0 or greater."
        
        item_name_lower = item_name.lower()
        
        for cart_item in self.cart:
            if item_name_lower in cart_item['name'].lower():
                if new_quantity == 0:
                    self.cart.remove(cart_item)
                    return f"Removed {cart_item['name']} from your cart."
                else:
                    cart_item['quantity'] = new_quantity
                    item_total = cart_item['price'] * new_quantity
                    return f"Updated {cart_item['name']} to {new_quantity} {cart_item['unit']}(s). Item total: ${round(item_total, 2)}"
        
        return f"I couldn't find '{item_name}' in your cart."
    
    @function_tool()
    async def place_order(self, customer_name: str = "", delivery_address: str = ""):
        """Place the order and save it.
        
        Args:
            customer_name: Customer's name (optional)
            delivery_address: Delivery address (optional)
        
        Returns:
            Order confirmation with order ID and details
        """
        if not self.cart:
            return "Your cart is empty. Please add some items before placing an order."
        
        # Use provided info or defaults
        if customer_name:
            self.customer_name = customer_name
        if delivery_address:
            self.delivery_address = delivery_address
        
        # Save the order
        order = save_order(self.cart, self.customer_name, self.delivery_address)
        
        # Generate confirmation message
        response = f"🎉 Order placed successfully!\n\n"
        response += f"Order ID: {order['order_id']}\n"
        response += f"Customer: {order['customer_name']}\n"
        
        if order['delivery_address']:
            response += f"Delivery Address: {order['delivery_address']}\n"
        
        response += f"\nItems ordered:\n"
        for item in order['items']:
            response += f"- {item['quantity']}x {item['name']}\n"
        
        response += f"\nTotal: ${order['total']}\n"
        response += f"Status: {order['status']}\n\n"
        response += "Your order will be delivered soon. Thank you for shopping with QuickMart Express!"
        
        # Clear cart after placing order
        self.cart = []
        
        return response
    
    @function_tool()
    async def check_order_status(self):
        """Check the status of the most recent order.
        
        Returns:
            Current order status and details
        """
        order = get_latest_order()
        
        if not order:
            return "You don't have any orders yet. Would you like to place one?"
        
        response = f"Your most recent order:\n\n"
        response += f"Order ID: {order['order_id']}\n"
        response += f"Status: {order['status'].upper()}\n"
        response += f"Total: ${order['total']}\n"
        response += f"Placed on: {order['timestamp'][:10]}\n"
        
        # Status explanation
        status_messages = {
            'received': "We've received your order and are processing it.",
            'confirmed': "Your order has been confirmed and is being prepared.",
            'being_prepared': "Your order is currently being prepared.",
            'out_for_delivery': "Your order is out for delivery!",
            'delivered': "Your order has been delivered. Enjoy!"
        }
        
        if order['status'] in status_messages:
            response += f"\n{status_messages[order['status']]}"
        
        return response
    
    @function_tool()
    async def get_my_orders(self, limit: int = 5):
        """Get order history.
        
        Args:
            limit: Number of recent orders to retrieve (default: 5)
        
        Returns:
            List of previous orders
        """
        orders = get_order_history(limit)
        
        if not orders:
            return "You don't have any previous orders."
        
        response = f"Here are your last {len(orders)} order(s):\n\n"
        
        for order in orders:
            response += f"Order {order['order_id']}:\n"
            response += f"  - Date: {order['timestamp'][:10]}\n"
            response += f"  - Total: ${order['total']}\n"
            response += f"  - Status: {order['status']}\n"
            response += f"  - Items: {len(order['items'])} item(s)\n\n"
        
        return response


async def entrypoint(ctx: JobContext):
    """Main entry point for the agent."""
    logger.info(f"Agent joining room: {ctx.room.name}")
    logger.debug("Entrypoint started; connecting to LiveKit and preparing session")
    
    # Connect the worker to LiveKit (subscribe to audio by default)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Start a full AgentSession so the agent behaves like Day 6 example.
    # This will initialize configured STT / TTS / LLM plugins when available.
    agent = GroceryOrderAgent()
    session = AgentSession()
    logger.info("Starting AgentSession for %s", agent.__class__.__name__)
    await session.start(agent, room=ctx.room)

    # Session.start returns when the session ends; log and return.
    logger.info("AgentSession finished for room: %s", ctx.room.name)
    return


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="QuickMart Grocery Agent",
        )
    )
