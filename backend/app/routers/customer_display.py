from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database

router = APIRouter()

@router.get("/orders/{order_id}")
def get_order_for_display(
    order_id: int,
    db: Session = Depends(database.get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "order_number": order.order_number,
        "items": order.items,
        "subtotal": order.subtotal,
        "tax": order.tax,
        "total": order.total,
        "status": order.status,
        "created_at": order.created_at
    }

@router.get("/orders/number/{order_number}")
def get_order_by_number(
    order_number: str,
    db: Session = Depends(database.get_db)
):
    order = db.query(models.Order).filter(
        models.Order.order_number == order_number
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "order_number": order.order_number,
        "items": order.items,
        "subtotal": order.subtotal,
        "tax": order.tax,
        "total": order.total,
        "status": order.status,
        "created_at": order.created_at
    }