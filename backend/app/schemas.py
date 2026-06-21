from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str  # Changed from EmailStr
    full_name: str
    role: str = "staff"

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    role: Optional[str] = "customer"  # Default role

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    
    cost_price: Optional[float] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    is_available: bool = True
    is_featured: bool = False
    stock_quantity: int = 0

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Table Schemas
class TableBase(BaseModel):
    name: str
    capacity: int = 2
    floor: int = 1
    position_x: Optional[float] = None
    position_y: Optional[float] = None

class TableCreate(TableBase):
    pass

class TableResponse(TableBase):
    id: int
    status: str
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    table_id: Optional[int] = None
    customer_id: Optional[int] = None
    order_type: str = "dine_in"
    items: List[OrderItem]
    notes: Optional[str] = None
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    order_type: str
    subtotal: float
    tax: float
    discount: float
    total: float
    items: List[dict]
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentCreate(BaseModel):
    order_id: int
    payment_method_id: int
    amount: float
    reference_number: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Session Schemas
class SessionCreate(BaseModel):
    starting_cash: float = 0.0

class SessionResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    starting_cash: float
    ending_cash: Optional[float] = None
    total_sales: float
    order_count: int
    is_active: bool
    
    class Config:
        from_attributes = True

# Coupon Schemas
class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_order_amount: float = 0
    max_discount: Optional[float] = None
    valid_from: datetime
    valid_to: datetime
    usage_limit: int = 100

class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    is_active: bool
    used_count: int
    
    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ReviewCreate(BaseModel):
    order_id: int
    customer_name: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    order_id: int
    customer_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class SessionCreate(BaseModel):
    starting_cash: float = 0.0

class SessionResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    starting_cash: float
    ending_cash: Optional[float] = None
    total_sales: float
    order_count: int
    is_active: bool
    
    class Config:
        from_attributes = True