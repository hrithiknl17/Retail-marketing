import os
import random
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

random.seed(42)


EXTRA_VENDORS = [
    {"name": "Harvest Valley Produce", "contact_person": "Maya Thompson", "email": "maya@harvestvalley.com", "phone": "555-0111", "rating": 4.7},
    {"name": "Ocean Catch Seafood", "contact_person": "Noah Bennett", "email": "noah@oceancatch.com", "phone": "555-0112", "rating": 4.6},
    {"name": "Sunrise Bakery Group", "contact_person": "Emma Clark", "email": "emma@sunrisebakery.com", "phone": "555-0113", "rating": 4.4},
    {"name": "Pure Pantry Foods", "contact_person": "Liam Carter", "email": "liam@purepantry.com", "phone": "555-0114", "rating": 4.5},
]

EXTRA_PRODUCTS = [
    {"name": "Baby Spinach", "category": "produce", "price": 2.79, "cost": 1.45, "stock": 58, "min_stock": 18, "vendor_name": "Harvest Valley Produce", "sku": "PRD-003", "aisle": "A2"},
    {"name": "Strawberries 1lb", "category": "produce", "price": 4.29, "cost": 2.4, "stock": 42, "min_stock": 16, "vendor_name": "Harvest Valley Produce", "sku": "PRD-004", "aisle": "A2"},
    {"name": "Roma Tomatoes", "category": "produce", "price": 1.99, "cost": 1.05, "stock": 76, "min_stock": 24, "vendor_name": "Fresh Farms Co.", "sku": "PRD-005", "aisle": "A3"},
    {"name": "Greek Yogurt 500g", "category": "dairy", "price": 5.49, "cost": 3.1, "stock": 39, "min_stock": 14, "vendor_name": "Dairy Best", "sku": "DAI-002", "aisle": "D2"},
    {"name": "Cheddar Cheese Block", "category": "dairy", "price": 6.99, "cost": 4.2, "stock": 33, "min_stock": 12, "vendor_name": "Dairy Best", "sku": "DAI-003", "aisle": "D3"},
    {"name": "Brown Eggs 12ct", "category": "dairy", "price": 3.89, "cost": 2.25, "stock": 64, "min_stock": 20, "vendor_name": "Dairy Best", "sku": "DAI-004", "aisle": "D1"},
    {"name": "Multigrain Bread", "category": "bakery", "price": 3.99, "cost": 2.1, "stock": 28, "min_stock": 10, "vendor_name": "Sunrise Bakery Group", "sku": "BAK-002", "aisle": "B1"},
    {"name": "Blueberry Muffins 4pk", "category": "bakery", "price": 5.49, "cost": 2.9, "stock": 19, "min_stock": 8, "vendor_name": "Sunrise Bakery Group", "sku": "BAK-003", "aisle": "B1"},
    {"name": "Chicken Breast Boneless", "category": "meat", "price": 7.99, "cost": 5.3, "stock": 34, "min_stock": 14, "vendor_name": "Prime Meats", "sku": "MEA-002", "aisle": "M2"},
    {"name": "Salmon Fillet Fresh", "category": "seafood", "price": 12.99, "cost": 8.25, "stock": 17, "min_stock": 8, "vendor_name": "Ocean Catch Seafood", "sku": "SEA-001", "aisle": "S1"},
    {"name": "Shrimp Medium 500g", "category": "seafood", "price": 10.49, "cost": 6.8, "stock": 21, "min_stock": 10, "vendor_name": "Ocean Catch Seafood", "sku": "SEA-002", "aisle": "S1"},
    {"name": "Olive Oil 1L", "category": "pantry", "price": 9.99, "cost": 6.15, "stock": 41, "min_stock": 15, "vendor_name": "Pure Pantry Foods", "sku": "PAN-002", "aisle": "P1"},
    {"name": "Basmati Rice 5kg", "category": "pantry", "price": 11.99, "cost": 7.4, "stock": 37, "min_stock": 12, "vendor_name": "Pure Pantry Foods", "sku": "PAN-003", "aisle": "P2"},
    {"name": "Peanut Butter 500g", "category": "pantry", "price": 4.99, "cost": 2.95, "stock": 52, "min_stock": 18, "vendor_name": "Pure Pantry Foods", "sku": "PAN-004", "aisle": "P4"},
    {"name": "Sparkling Water Lime", "category": "beverages", "price": 1.79, "cost": 0.95, "stock": 88, "min_stock": 30, "vendor_name": "Global Pantry Supplies", "sku": "BEV-002", "aisle": "D6"},
    {"name": "Cold Brew Coffee", "category": "beverages", "price": 3.49, "cost": 2.0, "stock": 46, "min_stock": 16, "vendor_name": "Global Pantry Supplies", "sku": "BEV-003", "aisle": "D6"},
    {"name": "Vanilla Ice Cream Tub", "category": "frozen", "price": 5.99, "cost": 3.55, "stock": 27, "min_stock": 12, "vendor_name": "Global Pantry Supplies", "sku": "FRO-002", "aisle": "F1"},
    {"name": "Frozen Mixed Vegetables", "category": "frozen", "price": 3.29, "cost": 1.8, "stock": 49, "min_stock": 18, "vendor_name": "Global Pantry Supplies", "sku": "FRO-003", "aisle": "F3"},
    {"name": "Potato Chips Sea Salt", "category": "snacks", "price": 2.99, "cost": 1.5, "stock": 61, "min_stock": 22, "vendor_name": "Pure Pantry Foods", "sku": "SNK-001", "aisle": "N1"},
    {"name": "Dark Chocolate Bar", "category": "snacks", "price": 2.49, "cost": 1.2, "stock": 57, "min_stock": 20, "vendor_name": "Pure Pantry Foods", "sku": "SNK-002", "aisle": "N2"},
]

EXTRA_CUSTOMERS = [
    {"name": "Michael Torres", "email": "michael.torres@example.com", "phone": "555-0211"},
    {"name": "Olivia Patel", "email": "olivia.patel@example.com", "phone": "555-0212"},
    {"name": "Ethan Brooks", "email": "ethan.brooks@example.com", "phone": "555-0213"},
    {"name": "Sophia Reed", "email": "sophia.reed@example.com", "phone": "555-0214"},
    {"name": "Daniel Kim", "email": "daniel.kim@example.com", "phone": "555-0215"},
    {"name": "Grace Walker", "email": "grace.walker@example.com", "phone": "555-0216"},
    {"name": "Benjamin Lewis", "email": "ben.lewis@example.com", "phone": "555-0217"},
    {"name": "Chloe Morris", "email": "chloe.morris@example.com", "phone": "555-0218"},
    {"name": "Lucas Evans", "email": "lucas.evans@example.com", "phone": "555-0219"},
    {"name": "Ava Turner", "email": "ava.turner@example.com", "phone": "555-0220"},
]

EXTRA_DISCOUNTS = [
    {"code": "FRESH15", "type": "percentage", "value": 15, "active": True},
    {"code": "WEEKEND7", "type": "fixed", "value": 7, "active": True},
    {"code": "SEAFOOD12", "type": "percentage", "value": 12, "active": True},
]


def fetch_map(table_name: str, key_field: str):
    rows = supabase.table(table_name).select(f"id, {key_field}").execute().data
    return {row[key_field]: row["id"] for row in rows}


def ensure_vendors():
    vendor_map = fetch_map("vendors", "name")
    missing = [vendor for vendor in EXTRA_VENDORS if vendor["name"] not in vendor_map]
    if missing:
        inserted = supabase.table("vendors").insert(missing).execute().data
        for vendor in inserted:
            vendor_map[vendor["name"]] = vendor["id"]
    return vendor_map, len(missing)


def ensure_products(vendor_map):
    existing_rows = supabase.table("products").select("id, sku").execute().data
    existing_skus = {row["sku"] for row in existing_rows}
    missing = []
    for product in EXTRA_PRODUCTS:
        if product["sku"] in existing_skus:
            continue
        payload = product.copy()
        payload["vendor_id"] = vendor_map[payload.pop("vendor_name")]
        missing.append(payload)
    if missing:
        supabase.table("products").insert(missing).execute()
    return len(missing)


def ensure_customers():
    existing_rows = supabase.table("customers").select("id, email").execute().data
    existing_emails = {row["email"] for row in existing_rows if row.get("email")}
    missing = [customer for customer in EXTRA_CUSTOMERS if customer["email"] not in existing_emails]
    if missing:
        supabase.table("customers").insert(missing).execute()
    return len(missing)


def ensure_discounts():
    existing_rows = supabase.table("discounts").select("id, code").execute().data
    existing_codes = {row["code"] for row in existing_rows}
    missing = [discount for discount in EXTRA_DISCOUNTS if discount["code"] not in existing_codes]
    if missing:
        supabase.table("discounts").insert(missing).execute()
    return len(missing)


def ensure_deliveries(vendor_map, product_map):
    existing = supabase.table("deliveries").select("id").execute().data
    if len(existing) >= 8:
        return 0

    deliveries = [
        {"vendor_id": vendor_map["Harvest Valley Produce"], "expected_date": "2026-03-26T08:00:00Z", "status": "pending"},
        {"vendor_id": vendor_map["Ocean Catch Seafood"], "expected_date": "2026-03-27T06:30:00Z", "status": "pending"},
        {"vendor_id": vendor_map["Sunrise Bakery Group"], "expected_date": "2026-03-24T05:45:00Z", "status": "delivered"},
        {"vendor_id": vendor_map["Pure Pantry Foods"], "expected_date": "2026-03-28T09:15:00Z", "status": "pending"},
    ]
    inserted = supabase.table("deliveries").insert(deliveries).execute().data
    delivery_items = [
        {"delivery_id": inserted[0]["id"], "product_id": product_map["Baby Spinach"], "quantity": 90},
        {"delivery_id": inserted[0]["id"], "product_id": product_map["Strawberries 1lb"], "quantity": 70},
        {"delivery_id": inserted[1]["id"], "product_id": product_map["Salmon Fillet Fresh"], "quantity": 25},
        {"delivery_id": inserted[1]["id"], "product_id": product_map["Shrimp Medium 500g"], "quantity": 40},
        {"delivery_id": inserted[2]["id"], "product_id": product_map["Multigrain Bread"], "quantity": 55},
        {"delivery_id": inserted[2]["id"], "product_id": product_map["Blueberry Muffins 4pk"], "quantity": 36},
        {"delivery_id": inserted[3]["id"], "product_id": product_map["Olive Oil 1L"], "quantity": 48},
        {"delivery_id": inserted[3]["id"], "product_id": product_map["Basmati Rice 5kg"], "quantity": 32},
    ]
    supabase.table("delivery_items").insert(delivery_items).execute()
    return len(deliveries)


def ensure_historical_sales(product_map, customer_ids):
    current_sales = supabase.table("sales").select("id").execute().data
    target_total_sales = 48
    needed = max(0, target_total_sales - len(current_sales))
    if needed == 0:
        return 0

    product_list = list(product_map.items())
    product_prices = {
        row["id"]: row["price"]
        for row in supabase.table("products").select("id, price").execute().data
    }
    sale_payloads = []
    line_items_per_sale = []
    stock_history_payloads = []
    payment_methods = ["cash", "card", "upi"]
    now_utc = datetime.now(timezone.utc)

    for idx in range(needed):
        sale_time = now_utc - timedelta(days=random.randint(1, 21), hours=random.randint(1, 10), minutes=random.randint(0, 59))
        basket_size = random.randint(1, 4)
        chosen = random.sample(product_list, basket_size)
        total = 0
        line_items = []

        for product_name, product_id in chosen:
            price = product_prices[product_id]
            quantity = random.randint(1, 3)
            line_total = price * quantity
            total += line_total
            line_items.append({"product_id": product_id, "quantity": quantity, "price": price, "product_name": product_name})

        discount_code = "FRESH15" if idx % 9 == 0 else None
        discount_amount = round(total * 0.15, 2) if discount_code else 0
        final_total = round(total - discount_amount, 2)

        sale_payloads.append(
            {
                "date": sale_time.isoformat(),
                "total": final_total,
                "payment_method": random.choice(payment_methods),
                "customer_id": random.choice(customer_ids) if customer_ids and idx % 3 != 0 else None,
                "discount_code": discount_code,
                "discount_amount": discount_amount,
            }
        )
        line_items_per_sale.append(line_items)

    inserted_sales = supabase.table("sales").insert(sale_payloads).execute().data

    sale_items_payloads = []
    for sale, line_items in zip(inserted_sales, line_items_per_sale):
        for item in line_items:
            sale_items_payloads.append(
                {
                "sale_id": sale["id"],
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": item["price"],
                }
            )
            stock_history_payloads.append(
                {
                    "product_id": item["product_id"],
                    "date": sale["date"],
                    "change": -item["quantity"],
                    "reason": "Sale",
                    "note": f"Historical seed sale {sale['id'][:8]}",
                }
            )

    supabase.table("sale_items").insert(sale_items_payloads).execute()
    supabase.table("stock_history").insert(stock_history_payloads).execute()
    return needed


def main():
    print("Adding richer data to Supabase...")
    vendor_map, vendors_added = ensure_vendors()
    products_added = ensure_products(vendor_map)
    customers_added = ensure_customers()
    discounts_added = ensure_discounts()
    product_map = fetch_map("products", "name")
    deliveries_added = ensure_deliveries(vendor_map, product_map)
    customer_ids = list(fetch_map("customers", "email").values())
    sales_added = ensure_historical_sales(product_map, customer_ids)

    print(f"Vendors added: {vendors_added}")
    print(f"Products added: {products_added}")
    print(f"Customers added: {customers_added}")
    print(f"Discounts added: {discounts_added}")
    print(f"Deliveries added: {deliveries_added}")
    print(f"Historical sales added: {sales_added}")
    print("Done.")


if __name__ == "__main__":
    main()
