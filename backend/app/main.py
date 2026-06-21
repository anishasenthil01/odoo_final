from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

app = FastAPI(title="Cafe POS System", version="1.0.0")

# CORS - Add this BEFORE everything else
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Cafe POS System API"}

# Import and include routers
from .routers import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

from .routers import products
app.include_router(products.router, prefix="/api/products", tags=["Products"])

from .routers import categories
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])

from .routers import tables
app.include_router(tables.router, prefix="/api/tables", tags=["Tables"])

from .routers import payment_methods
app.include_router(payment_methods.router, prefix="/api/payment-methods", tags=["Payment Methods"])

from .routers import coupons
app.include_router(coupons.router, prefix="/api/coupons", tags=["Coupons"])

from .routers import customers
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])

from .routers import employees
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])

from .routers import sessions
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])

from .routers import orders
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

from .routers import payments
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

from .routers import kds
app.include_router(kds.router, prefix="/api/kds", tags=["KDS"])

from .routers import customer_display
app.include_router(customer_display.router, prefix="/api/customer-display", tags=["Customer Display"])

from .routers import self_order
app.include_router(self_order.router, prefix="/api/self-order", tags=["Self Order"])

from .routers import reports
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

from .routers import reviews
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])

# Create tables
Base.metadata.create_all(bind=engine)