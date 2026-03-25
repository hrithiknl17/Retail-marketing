import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def table_has_rows(table_name: str) -> bool:
    response = supabase.table(table_name).select("id").limit(1).execute()
    return bool(response.data)


def seed():
    print("Starting seeding process...")

    demo_users = [
        {
            "email": "admin@freshsync.com",
            "password": "admin123",
            "email_confirm": True,
            "user_metadata": {"name": "FreshSync Admin", "role": "admin"},
        },
        {
            "email": "customer@freshsync.com",
            "password": "customer123",
            "email_confirm": True,
            "user_metadata": {"name": "FreshSync Customer", "role": "customer"},
        },
    ]

    existing_users = {
        user.email for user in supabase.auth.admin.list_users() if getattr(user, "email", None)
    }

    for user in demo_users:
        if user["email"] not in existing_users:
            supabase.auth.admin.create_user(user)
            print(f"Created demo auth user: {user['email']}")
        else:
            print(f"Demo auth user already exists: {user['email']}")

    if table_has_rows("vendors"):
        vendors_resp = supabase.table("vendors").select("id, name").execute()
        vendor_map = {vendor["name"]: vendor["id"] for vendor in vendors_resp.data}
        print("Vendors table already populated, skipping vendor insert.")
    else:
        vendors = [
            {"name": "Fresh Farms Co.", "contact_person": "Alice Smith", "email": "alice@freshfarms.com", "phone": "555-0101", "rating": 4.8},
            {"name": "Dairy Best", "contact_person": "Bob Jones", "email": "bob@dairybest.com", "phone": "555-0102", "rating": 4.5},
            {"name": "Global Pantry Supplies", "contact_person": "Charlie Brown", "email": "charlie@globalpantry.com", "phone": "555-0103", "rating": 4.2},
            {"name": "Prime Meats", "contact_person": "Diana Prince", "email": "diana@primemeats.com", "phone": "555-0104", "rating": 4.9},
        ]
        vendor_resp = supabase.table("vendors").insert(vendors).execute()
        vendor_map = {vendor["name"]: vendor["id"] for vendor in vendor_resp.data}
        print(f"Seeded {len(vendors)} vendors.")

    if not table_has_rows("products"):
        products = [
            {"name": "Organic Bananas", "category": "produce", "price": 0.99, "cost": 0.50, "stock": 150, "min_stock": 50, "vendor_id": vendor_map["Fresh Farms Co."], "sku": "PRD-001", "aisle": "A1"},
            {"name": "Whole Milk 1 Gal", "category": "dairy", "price": 3.49, "cost": 2.00, "stock": 45, "min_stock": 20, "vendor_id": vendor_map["Dairy Best"], "sku": "DAI-001", "aisle": "D4"},
            {"name": "Sourdough Bread", "category": "bakery", "price": 4.99, "cost": 2.50, "stock": 12, "min_stock": 15, "vendor_id": vendor_map["Global Pantry Supplies"], "sku": "BAK-001", "aisle": "B2"},
            {"name": "Ground Beef 80/20", "category": "meat", "price": 5.99, "cost": 3.50, "stock": 30, "min_stock": 20, "vendor_id": vendor_map["Prime Meats"], "sku": "MEA-001", "aisle": "M1"},
            {"name": "Canned Black Beans", "category": "pantry", "price": 1.29, "cost": 0.60, "stock": 200, "min_stock": 100, "vendor_id": vendor_map["Global Pantry Supplies"], "sku": "PAN-001", "aisle": "P3"},
            {"name": "Orange Juice 64oz", "category": "beverages", "price": 4.49, "cost": 2.80, "stock": 60, "min_stock": 30, "vendor_id": vendor_map["Dairy Best"], "sku": "BEV-001", "aisle": "D5"},
            {"name": "Frozen Pizza", "category": "frozen", "price": 6.99, "cost": 4.00, "stock": 25, "min_stock": 20, "vendor_id": vendor_map["Global Pantry Supplies"], "sku": "FRO-001", "aisle": "F2"},
            {"name": "Avocados", "category": "produce", "price": 1.50, "cost": 0.80, "stock": 80, "min_stock": 40, "vendor_id": vendor_map["Fresh Farms Co."], "sku": "PRD-002", "aisle": "A1"},
        ]
        supabase.table("products").insert(products).execute()
        print(f"Seeded {len(products)} products.")
    else:
        print("Products table already populated, skipping product insert.")

    if not table_has_rows("customers"):
        customers = [
            {"name": "John Doe", "email": "john@example.com", "phone": "555-0201"},
            {"name": "Jane Smith", "email": "jane@example.com", "phone": "555-0202"},
            {"name": "Alice Johnson", "email": "alice.j@example.com", "phone": "555-0203"},
        ]
        supabase.table("customers").insert(customers).execute()
        print(f"Seeded {len(customers)} customers.")
    else:
        print("Customers table already populated, skipping customer insert.")

    if not table_has_rows("discounts"):
        discounts = [
            {"code": "SUMMER10", "type": "percentage", "value": 10, "active": True},
            {"code": "WELCOME5", "type": "fixed", "value": 5, "active": True},
            {"code": "EXPIRED20", "type": "percentage", "value": 20, "active": False},
        ]
        supabase.table("discounts").insert(discounts).execute()
        print(f"Seeded {len(discounts)} discounts.")
    else:
        print("Discounts table already populated, skipping discount insert.")

    if not table_has_rows("deliveries"):
        products_resp = supabase.table("products").select("id, name").execute()
        product_map = {product["name"]: product["id"] for product in products_resp.data}

        deliveries = [
            {"vendor_id": vendor_map["Fresh Farms Co."], "expected_date": "2026-03-25T10:00:00Z", "status": "pending"},
            {"vendor_id": vendor_map["Global Pantry Supplies"], "expected_date": "2026-03-26T12:00:00Z", "status": "pending"},
            {"vendor_id": vendor_map["Dairy Best"], "expected_date": "2026-03-23T09:00:00Z", "status": "delivered"},
        ]
        deliveries_resp = supabase.table("deliveries").insert(deliveries).execute()
        delivery_items = [
            {"delivery_id": deliveries_resp.data[0]["id"], "product_id": product_map["Organic Bananas"], "quantity": 200},
            {"delivery_id": deliveries_resp.data[0]["id"], "product_id": product_map["Avocados"], "quantity": 100},
            {"delivery_id": deliveries_resp.data[1]["id"], "product_id": product_map["Sourdough Bread"], "quantity": 50},
            {"delivery_id": deliveries_resp.data[1]["id"], "product_id": product_map["Canned Black Beans"], "quantity": 300},
            {"delivery_id": deliveries_resp.data[2]["id"], "product_id": product_map["Whole Milk 1 Gal"], "quantity": 100},
        ]
        supabase.table("delivery_items").insert(delivery_items).execute()
        print(f"Seeded {len(deliveries)} deliveries.")
    else:
        print("Deliveries table already populated, skipping delivery insert.")

    print("Seeding complete.")


if __name__ == "__main__":
    seed()
