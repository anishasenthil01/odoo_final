from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, database, auth

router = APIRouter()

@router.get("/orders")
def get_kds_orders(
    status: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    else:
        query = query.filter(
            models.Order.status.in_(["pending", "preparing"])
        )
    
    orders = query.order_by(models.Order.created_at.asc()).all()
    return orders

@router.put("/orders/{order_id}/status")
def update_kds_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    if status == "preparing":
        order.started_at = datetime.utcnow()
    elif status == "ready":
        order.completed_at = datetime.utcnow()
    
    db.commit()
    return {"message": f"Order status updated to {status}"}