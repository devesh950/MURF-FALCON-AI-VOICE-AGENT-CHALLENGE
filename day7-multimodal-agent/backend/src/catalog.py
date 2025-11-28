"""Product catalog for grocery and food ordering."""

import json
from pathlib import Path

# Catalog file path
CATALOG_FILE = Path(__file__).parent.parent / "grocery_catalog.json"


def get_catalog():
    """Load and return the product catalog."""
    if not CATALOG_FILE.exists():
        initialize_catalog()
    
    with open(CATALOG_FILE, 'r') as f:
        return json.load(f)


def initialize_catalog():
    """Create initial grocery catalog."""
    catalog = {
        "categories": {
            "groceries": {
                "name": "Groceries",
                "items": [
                    {
                        "id": "g001",
                        "name": "Whole Wheat Bread",
                        "price": 3.99,
                        "unit": "loaf",
                        "brand": "Nature's Own",
                        "tags": ["bakery", "wheat"]
                    },
                    {
                        "id": "g002",
                        "name": "White Bread",
                        "price": 2.99,
                        "unit": "loaf",
                        "brand": "Wonder",
                        "tags": ["bakery"]
                    },
                    {
                        "id": "g003",
                        "name": "Eggs",
                        "price": 4.99,
                        "unit": "dozen",
                        "brand": "Farm Fresh",
                        "tags": ["dairy", "protein"]
                    },
                    {
                        "id": "g004",
                        "name": "Milk",
                        "price": 3.49,
                        "unit": "gallon",
                        "brand": "Horizon Organic",
                        "tags": ["dairy", "organic"]
                    },
                    {
                        "id": "g005",
                        "name": "Butter",
                        "price": 5.99,
                        "unit": "lb",
                        "brand": "Land O'Lakes",
                        "tags": ["dairy"]
                    },
                    {
                        "id": "g006",
                        "name": "Peanut Butter",
                        "price": 6.99,
                        "unit": "jar",
                        "brand": "Jif",
                        "size": "large",
                        "tags": ["spread", "protein"]
                    },
                    {
                        "id": "g007",
                        "name": "Pasta",
                        "price": 2.49,
                        "unit": "box",
                        "brand": "Barilla",
                        "tags": ["italian", "grains"]
                    },
                    {
                        "id": "g008",
                        "name": "Pasta Sauce",
                        "price": 3.99,
                        "unit": "jar",
                        "brand": "Rao's",
                        "tags": ["italian", "sauce"]
                    },
                    {
                        "id": "g009",
                        "name": "Rice",
                        "price": 8.99,
                        "unit": "5lb bag",
                        "brand": "Uncle Ben's",
                        "tags": ["grains", "staple"]
                    },
                    {
                        "id": "g010",
                        "name": "Olive Oil",
                        "price": 12.99,
                        "unit": "bottle",
                        "brand": "Bertolli",
                        "tags": ["cooking", "oil"]
                    }
                ]
            },
            "snacks": {
                "name": "Snacks",
                "items": [
                    {
                        "id": "s001",
                        "name": "Potato Chips",
                        "price": 3.99,
                        "unit": "bag",
                        "brand": "Lay's",
                        "flavor": "Classic",
                        "tags": ["snack", "salty"]
                    },
                    {
                        "id": "s002",
                        "name": "Chocolate Cookies",
                        "price": 4.49,
                        "unit": "package",
                        "brand": "Oreo",
                        "tags": ["snack", "sweet"]
                    },
                    {
                        "id": "s003",
                        "name": "Granola Bars",
                        "price": 5.99,
                        "unit": "box of 12",
                        "brand": "Nature Valley",
                        "tags": ["snack", "healthy"]
                    },
                    {
                        "id": "s004",
                        "name": "Trail Mix",
                        "price": 6.99,
                        "unit": "bag",
                        "brand": "Planters",
                        "tags": ["snack", "nuts", "healthy"]
                    }
                ]
            },
            "prepared_food": {
                "name": "Prepared Food",
                "items": [
                    {
                        "id": "p001",
                        "name": "Frozen Pizza",
                        "price": 8.99,
                        "unit": "box",
                        "brand": "DiGiorno",
                        "flavor": "Pepperoni",
                        "tags": ["frozen", "italian"]
                    },
                    {
                        "id": "p002",
                        "name": "Veggie Pizza",
                        "price": 9.99,
                        "unit": "box",
                        "brand": "DiGiorno",
                        "flavor": "Vegetarian",
                        "tags": ["frozen", "italian", "vegetarian"]
                    },
                    {
                        "id": "p003",
                        "name": "Ready Sandwich",
                        "price": 6.99,
                        "unit": "each",
                        "brand": "Subway",
                        "flavor": "Turkey & Cheese",
                        "tags": ["ready-to-eat", "cold"]
                    }
                ]
            },
            "beverages": {
                "name": "Beverages",
                "items": [
                    {
                        "id": "b001",
                        "name": "Orange Juice",
                        "price": 4.99,
                        "unit": "carton",
                        "brand": "Tropicana",
                        "tags": ["juice", "fruit"]
                    },
                    {
                        "id": "b002",
                        "name": "Cola",
                        "price": 5.99,
                        "unit": "12-pack",
                        "brand": "Coca-Cola",
                        "tags": ["soda", "carbonated"]
                    },
                    {
                        "id": "b003",
                        "name": "Bottled Water",
                        "price": 6.99,
                        "unit": "24-pack",
                        "brand": "Aquafina",
                        "tags": ["water", "hydration"]
                    }
                ]
            }
        },
        "recipes": {
            "peanut butter sandwich": ["g002", "g006"],
            "pbj sandwich": ["g002", "g006"],
            "pasta": ["g007", "g008", "g010"],
            "pasta for two": ["g007", "g008", "g010"],
            "breakfast": ["g003", "g002", "g004", "g005"],
            "sandwich": ["g002"]
        }
    }
    
    with open(CATALOG_FILE, 'w') as f:
        json.dump(catalog, f, indent=2)
    
    print(f"Catalog initialized at {CATALOG_FILE}")
    return catalog


def search_items(query: str):
    """Search for items by name."""
    catalog = get_catalog()
    results = []
    query_lower = query.lower()
    
    for category_key, category_data in catalog['categories'].items():
        for item in category_data['items']:
            if query_lower in item['name'].lower():
                results.append({
                    **item,
                    'category': category_data['name']
                })
    
    return results


def get_item_by_id(item_id: str):
    """Get a specific item by ID."""
    catalog = get_catalog()
    
    for category_key, category_data in catalog['categories'].items():
        for item in category_data['items']:
            if item['id'] == item_id:
                return {
                    **item,
                    'category': category_data['name']
                }
    
    return None


def get_recipe_items(recipe_name: str):
    """Get items for a recipe."""
    catalog = get_catalog()
    recipe_name_lower = recipe_name.lower()
    
    if recipe_name_lower in catalog.get('recipes', {}):
        item_ids = catalog['recipes'][recipe_name_lower]
        items = []
        for item_id in item_ids:
            item = get_item_by_id(item_id)
            if item:
                items.append(item)
        return items
    
    return None
