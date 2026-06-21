from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.CouponResponse])
def get_coupons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    return db.query(models.Coupon).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.CouponResponse)
def create_coupon(
    coupon: schemas.CouponCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    db_coupon = models.Coupon(**coupon.dict())
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return db_coupon

@router.post("/validate/{code}")
def validate_coupon(
    code: str,
    order_amount: float = 0,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    coupon = db.query(models.Coupon).filter(
        models.Coupon.code == code,
        models.Coupon.is_active == True
    ).first()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    if coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    if order_amount < coupon.min_order_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order amount is ${coupon.min_order_amount}"
        )
    
    # Calculate discount
    discount = 0
    if coupon.discount_type == "percentage":
        discount = order_amount * (coupon.discount_value / 100)
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = coupon.discount_value
    
    return {
        "valid": True,
        "discount": discount,
        "coupon": coupon
    }