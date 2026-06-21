from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"
    CUSTOMER = "customer"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    full_name = Column(String(100))
    hashed_password = Column(String(200))
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=True)
    sku = Column(String(50), unique=True, nullable=True)
    barcode = Column(String(100), unique=True, nullable=True)
    image_url = Column(String(255), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    is_available = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category = relationship("Category", back_populates="products")

class Table(Base):
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    capacity = Column(Integer, default=2)
    floor = Column(Integer, default=1)
    status = Column(String(20), default="available")  # available, occupied, reserved
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True)
    type = Column(String(20))  # cash, card, digital_wallet
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    description = Column(Text, nullable=True)
    discount_type = Column(String(20))  # percentage, fixed
    discount_value = Column(Float)
    min_order_amount = Column(Float, default=0)
    max_discount = Column(Float, nullable=True)
    valid_from = Column(DateTime)
    valid_to = Column(DateTime)
    usage_limit = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    loyalty_points = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    visit_count = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    order_type = Column(String(20), default="dine_in")  # dine_in, takeaway, delivery
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    items = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    table = relationship("Table")
    customer = relationship("Customer")
    user = relationship("User")
    session = relationship("Session")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"))
    amount = Column(Float)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    reference_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order")
    payment_method = relationship("PaymentMethod")
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    customer_name = Column(String(100))
    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    starting_cash = Column(Float, default=0.0)
    ending_cash = Column(Float, nullable=True)
    expected_cash = Column(Float, nullable=True)
    cash_difference = Column(Float, nullable=True)
    total_sales = Column(Float, default=0.0)
    order_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    closed_by = Column(String(100), nullable=True)
    
    user = relationship("User")