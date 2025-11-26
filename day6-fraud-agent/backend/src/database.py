import json
import os
from datetime import datetime
from pathlib import Path

# Database file path
DB_FILE = Path(__file__).parent.parent / "fraud_cases.json"


def initialize_database():
    """Initialize the fraud cases database with sample data."""
    fraud_cases = [
        {
            "userName": "John Smith",
            "securityIdentifier": "12345",
            "securityQuestion": "What is your favorite color?",
            "securityAnswer": "blue",
            "cardEnding": "4242",
            "status": "pending_review",
            "transactionAmount": "$1,299.99",
            "transactionName": "Luxury Electronics Store",
            "transactionTime": "2025-11-25 23:45:00",
            "transactionCategory": "e-commerce",
            "transactionSource": "luxuryelectronics.com",
            "transactionLocation": "Shanghai, China",
            "outcome": None
        },
        {
            "userName": "Sarah Johnson",
            "securityIdentifier": "67890",
            "securityQuestion": "What is your pet's name?",
            "securityAnswer": "max",
            "cardEnding": "8888",
            "status": "pending_review",
            "transactionAmount": "$549.00",
            "transactionName": "International Wire Transfer",
            "transactionTime": "2025-11-26 02:15:00",
            "transactionCategory": "wire transfer",
            "transactionSource": "Global Money Transfer Inc",
            "transactionLocation": "Lagos, Nigeria",
            "outcome": None
        },
        {
            "userName": "Michael Chen",
            "securityIdentifier": "54321",
            "securityQuestion": "What is your first pet's name?",
            "securityAnswer": "fluffy",
            "cardEnding": "1234",
            "status": "pending_review",
            "transactionAmount": "$2,450.50",
            "transactionName": "Premium Fashion Outlet",
            "transactionTime": "2025-11-25 18:30:00",
            "transactionCategory": "retail",
            "transactionSource": "fashionoutlet.eu",
            "transactionLocation": "Milan, Italy",
            "outcome": None
        }
    ]
    
    with open(DB_FILE, 'w') as f:
        json.dump(fraud_cases, f, indent=2)
    
    print(f"Database initialized with {len(fraud_cases)} fraud cases at {DB_FILE}")


def get_fraud_case(user_name: str):
    """Retrieve a fraud case by username."""
    if not DB_FILE.exists():
        initialize_database()
    
    with open(DB_FILE, 'r') as f:
        cases = json.load(f)
    
    # Case-insensitive search
    for case in cases:
        if case["userName"].lower() == user_name.lower():
            return case
    
    return None


def update_fraud_case(user_name: str, status: str, outcome: str):
    """Update a fraud case status and outcome."""
    if not DB_FILE.exists():
        return False
    
    with open(DB_FILE, 'r') as f:
        cases = json.load(f)
    
    # Find and update the case
    updated = False
    for case in cases:
        if case["userName"].lower() == user_name.lower():
            case["status"] = status
            case["outcome"] = outcome
            case["updatedAt"] = datetime.now().isoformat()
            updated = True
            break
    
    if updated:
        with open(DB_FILE, 'w') as f:
            json.dump(cases, f, indent=2)
    
    return updated


def get_all_cases():
    """Get all fraud cases."""
    if not DB_FILE.exists():
        initialize_database()
    
    with open(DB_FILE, 'r') as f:
        return json.load(f)


# Initialize database on module import
if not DB_FILE.exists():
    initialize_database()
