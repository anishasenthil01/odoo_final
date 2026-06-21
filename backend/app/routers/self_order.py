from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter()

@router.get("/products")
def get_available_products(
    category_id: int = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Product).filter(models.Product.is_available == True)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    return query.all()

@router.get("/categories")
def get_categories(
    db: Session = Depends(database.get_db)
):
    return db.query(models.Category).filter(models.Category.is_active == True).all()

@router.post("/orders")
def create_self_order(
    order: schemas.OrderCreate,
    db: Session = Depends(database.get_db)
):
    # Similar to orders router but without auth
    from datetime import datetime
    order_number = f"SELF-{datetime.now().strftime('%Y%m%d')}-{datetime.now().strftime('%H%M%S')}"
    
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax = subtotal * 0.1
    total = subtotal + tax
    
    db_order = models.Order(
        order_number=order_number,
        table_id=order.table_id,
        order_type="dine_in",
        subtotal=subtotal,
        tax=tax,
        total=total,
        items=[item.dict() for item in order.items],
        notes=order.notes
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return {
        "order_number": db_order.order_number,
        "total": db_order.total,
        "message": "Order placed successfully"
    }