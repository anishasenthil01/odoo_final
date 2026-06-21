from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .. import models, database, auth

router = APIRouter()

class PaymentMethodCreate(BaseModel):
    name: str
    type: str

@router.get("/")
def get_payment_methods(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return db.query(models.PaymentMethod).filter(models.PaymentMethod.is_active == True).all()

@router.post("/")
def create_payment_method(
    method: PaymentMethodCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    # Check if already exists
    existing = db.query(models.PaymentMethod).filter(
        models.PaymentMethod.name == method.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Payment method already exists")
    
    db_method = models.PaymentMethod(name=method.name, type=method.type)
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method