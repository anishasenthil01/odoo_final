from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.post("/", response_model=schemas.PaymentResponse)
def create_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Verify order exists
    order = db.query(models.Order).filter(models.Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify payment method exists
    payment_method = db.query(models.PaymentMethod).filter(
        models.PaymentMethod.id == payment.payment_method_id
    ).first()
    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    db_payment = models.Payment(
        order_id=payment.order_id,
        payment_method_id=payment.payment_method_id,
        amount=payment.amount,
        reference_number=payment.reference_number,
        status="completed"  # Payment is completed
    )
    
    db.add(db_payment)
    
    # Keep order as pending (don't change to delivered)
    # Kitchen needs to mark it as preparing -> ready -> delivered
    # order.status = "pending"  # Leave it pending for KDS
    
    # DON'T free up table yet - kitchen needs to complete the order
    # if order.table_id:
    #     table = db.query(models.Table).filter(models.Table.id == order.table_id).first()
    #     if table:
    #         table.status = "available"
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/methods")
def get_payment_methods(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    methods = db.query(models.PaymentMethod).filter(
        models.PaymentMethod.is_active == True
    ).all()
    return methods