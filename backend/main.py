import datetime
import os
from typing import Any, Dict, List, Literal, Optional
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from supabase import Client, create_client
import google.generativeai as genai

load_dotenv()


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


app = FastAPI(title="FreshSync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = require_env("SUPABASE_URL")
SUPABASE_KEY = require_env("SUPABASE_KEY")
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_auth_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")
else:
    gemini_model = None

security = HTTPBearer(auto_error=False)
APP_TIMEZONE = ZoneInfo(os.getenv("APP_TIMEZONE", "Asia/Kolkata"))


UserRole = Literal["admin", "customer"]


class CurrentUser(BaseModel):
    id: str
    email: str
    role: UserRole
    name: Optional[str] = None


class AuthRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(AuthRequest):
    name: str


class AuthUserResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    name: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    user: AuthUserResponse


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""


class SaleItemCreate(BaseModel):
    productId: str
    quantity: int
    price: float


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
    total: float
    paymentMethod: str
    customerId: Optional[str] = None
    discountCode: Optional[str] = None
    discountAmount: float = 0


class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str


def get_user_role(user) -> UserRole:
    raw_role = (
        (getattr(user, "user_metadata", None) or {}).get("role")
        or (getattr(user, "app_metadata", None) or {}).get("role")
        or "customer"
    )
    return "admin" if raw_role == "admin" else "customer"


def serialize_user(user) -> AuthUserResponse:
    metadata = getattr(user, "user_metadata", None) or {}
    return AuthUserResponse(
        id=user.id,
        email=user.email or "",
        role=get_user_role(user),
        name=metadata.get("name"),
    )


def serialize_auth_response(auth_response) -> AuthResponse:
    if not auth_response.user or not auth_response.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
        )

    return AuthResponse(
        access_token=auth_response.session.access_token,
        refresh_token=auth_response.session.refresh_token,
        user=serialize_user(auth_response.user),
    )


def serialize_product(product: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": product["id"],
        "name": product["name"],
        "category": product["category"],
        "price": product["price"],
        "cost": product["cost"],
        "stock": product["stock"],
        "minStock": product["min_stock"],
        "vendorId": product["vendor_id"],
        "sku": product["sku"],
        "aisle": product.get("aisle") or "",
        "imageUrl": product.get("image_url"),
        "expiryDate": product.get("expiry_date"),
    }


def serialize_vendor(vendor: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": vendor["id"],
        "name": vendor["name"],
        "contactPerson": vendor.get("contact_person") or "",
        "email": vendor.get("email") or "",
        "phone": vendor.get("phone") or "",
        "rating": vendor.get("rating") or 0,
    }


def serialize_customer(customer: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": customer["id"],
        "name": customer["name"],
        "email": customer.get("email") or "",
        "phone": customer.get("phone") or "",
        "createdAt": customer.get("created_at"),
    }


def serialize_discount(discount: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": discount["id"],
        "code": discount["code"],
        "type": discount["type"],
        "value": discount["value"],
        "active": discount.get("active", False),
    }


def serialize_sale(sale: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": sale["id"],
        "date": sale["date"],
        "items": [
            {
                "productId": item["product_id"],
                "quantity": item["quantity"],
                "price": item["price"],
            }
            for item in sale.get("sale_items", [])
        ],
        "total": sale["total"],
        "paymentMethod": sale["payment_method"],
        "customerId": sale.get("customer_id"),
        "discountCode": sale.get("discount_code"),
        "discountAmount": sale.get("discount_amount") or 0,
    }


def serialize_delivery(delivery: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": delivery["id"],
        "vendorId": delivery["vendor_id"],
        "expectedDate": delivery.get("expected_date"),
        "status": delivery.get("status") or "pending",
        "items": [
            {
                "productId": item["product_id"],
                "quantity": item["quantity"],
            }
            for item in delivery.get("delivery_items", [])
        ],
    }


def parse_timestamp(value: str) -> datetime.datetime:
    return datetime.datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(APP_TIMEZONE)


def is_today_in_store_timezone(value: str) -> bool:
    return parse_timestamp(value).date() == datetime.datetime.now(APP_TIMEZONE).date()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> CurrentUser:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    try:
        user_response = supabase_admin.auth.get_user(credentials.credentials)
        user = user_response.user
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        ) from exc

    if not user or not user.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    payload = serialize_user(user)
    return CurrentUser(**payload.model_dump())


@app.post("/api/auth/sign-in", response_model=AuthResponse)
async def sign_in(req: AuthRequest):
    try:
        auth_response = create_auth_client().auth.sign_in_with_password(
            {"email": req.email, "password": req.password}
        )
        return serialize_auth_response(auth_response)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        ) from exc


@app.post("/api/auth/sign-up", response_model=AuthResponse)
async def sign_up(req: SignUpRequest):
    try:
        supabase_admin.auth.admin.create_user(
            {
                "email": req.email,
                "password": req.password,
                "email_confirm": True,
                "user_metadata": {"name": req.name, "role": "customer"},
            }
        )
        auth_response = create_auth_client().auth.sign_in_with_password(
            {"email": req.email, "password": req.password}
        )
        return serialize_auth_response(auth_response)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@app.get("/api/auth/session", response_model=AuthUserResponse)
async def read_session(current_user: CurrentUser = Depends(get_current_user)):
    return AuthUserResponse(**current_user.model_dump())


@app.get("/api/products")
async def get_products(current_user: CurrentUser = Depends(get_current_user)):
    try:
        response = supabase_admin.table("products").select("*").execute()
        return [serialize_product(product) for product in response.data]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/vendors")
async def get_vendors(current_user: CurrentUser = Depends(get_current_user)):
    try:
        response = supabase_admin.table("vendors").select("*").execute()
        return [serialize_vendor(vendor) for vendor in response.data]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/customers")
async def get_customers(current_user: CurrentUser = Depends(get_current_user)):
    try:
        response = supabase_admin.table("customers").select("*").order("created_at", desc=True).execute()
        return [serialize_customer(customer) for customer in response.data]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/customers")
async def create_customer(
    req: CustomerCreate, current_user: CurrentUser = Depends(get_current_user)
):
    try:
        response = (
            supabase_admin.table("customers")
            .insert({"name": req.name, "email": req.email, "phone": req.phone})
            .execute()
        )
        return serialize_customer(response.data[0])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/discounts")
async def get_discounts(current_user: CurrentUser = Depends(get_current_user)):
    try:
        response = supabase_admin.table("discounts").select("*").execute()
        return [serialize_discount(discount) for discount in response.data]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/sales")
async def get_sales(current_user: CurrentUser = Depends(get_current_user)):
    try:
        response = supabase_admin.table("sales").select("*, sale_items(*)").execute()
        return [serialize_sale(sale) for sale in response.data]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/sales")
async def create_sale(req: SaleCreate, current_user: CurrentUser = Depends(get_current_user)):
    try:
        product_ids = [item.productId for item in req.items]
        products_resp = (
            supabase_admin.table("products")
            .select("id, name, stock")
            .in_("id", product_ids)
            .execute()
        )
        product_map = {product["id"]: product for product in products_resp.data}

        for item in req.items:
            product = product_map.get(item.productId)
            if not product:
                raise HTTPException(status_code=400, detail="Product not found.")
            if product["stock"] < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product['name']}.",
                )

        sale_response = (
            supabase_admin.table("sales")
            .insert(
                {
                    "total": req.total,
                    "payment_method": req.paymentMethod,
                    "customer_id": req.customerId,
                    "discount_code": req.discountCode,
                    "discount_amount": req.discountAmount,
                }
            )
            .execute()
        )
        sale = sale_response.data[0]

        line_items = [
            {
                "sale_id": sale["id"],
                "product_id": item.productId,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in req.items
        ]
        if line_items:
            supabase_admin.table("sale_items").insert(line_items).execute()

        for item in req.items:
            product = product_map[item.productId]
            updated_stock = product["stock"] - item.quantity
            (
                supabase_admin.table("products")
                .update({"stock": updated_stock})
                .eq("id", item.productId)
                .execute()
            )

            supabase_admin.table("stock_history").insert(
                {
                    "product_id": item.productId,
                    "change": -item.quantity,
                    "reason": "Sale",
                    "note": f"Sale {sale['id']}",
                }
            ).execute()

        full_sale = (
            supabase_admin.table("sales")
            .select("*, sale_items(*)")
            .eq("id", sale["id"])
            .single()
            .execute()
        )
        return serialize_sale(full_sale.data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/deliveries")
async def get_deliveries(current_user: CurrentUser = Depends(get_current_user)):
    try:
        response = (
            supabase_admin.table("deliveries")
            .select("*, delivery_items(*)")
            .order("expected_date")
            .execute()
        )
        return [serialize_delivery(delivery) for delivery in response.data]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/dashboard")
async def get_dashboard_stats(current_user: CurrentUser = Depends(get_current_user)):
    try:
        products = supabase_admin.table("products").select("id").execute()
        sales_all = supabase_admin.table("sales").select("total, date").execute()
        low_stock = supabase_admin.table("products").select("name, stock, min_stock").execute()

        low_stock_items = [p for p in low_stock.data if p["stock"] <= p["min_stock"]]
        today_revenue = sum(
            sale["total"] for sale in sales_all.data if sale.get("date") and is_today_in_store_timezone(sale["date"])
        )

        return {
            "totalProducts": len(products.data),
            "todayRevenue": today_revenue,
            "lowStockCount": len(low_stock_items),
            "lowStockItems": low_stock_items,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/ai/assistant")
async def ai_assistant(
    req: ChatRequest, current_user: CurrentUser = Depends(get_current_user)
):
    if not gemini_model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured.",
        )

    try:
        if req.context:
            context_block = req.context
        else:
            products_resp = (
                supabase_admin.table("products")
                .select("name, category, price, stock, aisle")
                .execute()
            )
            sales_resp = (
                supabase_admin.table("sales")
                .select("id, date, total, payment_method, discount_code, discount_amount")
                .order("date", desc=True)
                .limit(10)
                .execute()
            )
            deliveries_resp = (
                supabase_admin.table("deliveries")
                .select("id, expected_date, status")
                .order("expected_date")
                .limit(5)
                .execute()
            )

            inventory_block = "\n".join(
                [
                    f"- {p['name']} ({p['category']}, ${p['price']}, Aisle: {p['aisle']}, Stock: {p['stock']})"
                    for p in products_resp.data
                ]
            )
            low_stock_names = [
                p["name"] for p in products_resp.data if p["stock"] <= 50
            ]
            today_sales = [
                sale for sale in sales_resp.data if sale.get("date") and is_today_in_store_timezone(sale["date"])
            ]
            sales_block = "\n".join(
                [
                    f"- Sale {sale['id'][:8]} on {parse_timestamp(sale['date']).strftime('%Y-%m-%d %H:%M')} for ${sale['total']} via {sale['payment_method']}"
                    for sale in sales_resp.data
                ]
            ) or "- No sales recorded yet."
            deliveries_block = "\n".join(
                [
                    f"- Delivery {delivery['id'][:8]} scheduled for {delivery['expected_date']} with status {delivery['status']}"
                    for delivery in deliveries_resp.data
                ]
            ) or "- No deliveries scheduled."
            context_block = f"""
            Inventory:
            {inventory_block}

            Today revenue in store timezone ({APP_TIMEZONE.key}): ${sum(sale['total'] for sale in today_sales):.2f}
            Low stock items (50 or fewer units): {', '.join(low_stock_names) if low_stock_names else 'None'}

            Recent sales:
            {sales_block}

            Deliveries:
            {deliveries_block}
            """

        system_instruction = f"""
        You are a helpful assistant for FreshSync grocery store.
        User role: {current_user.role}
        You have access to current inventory, recent sales, and deliveries.
        Use the provided sales data when the user asks for revenue, sales reports, or trends.
        Current store context:
        {context_block}
        """

        response = gemini_model.generate_content(
            f"{system_instruction}\n\nUser Question: {req.message}"
        )
        return {"response": response.text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
