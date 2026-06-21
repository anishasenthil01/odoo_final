from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.is_active == True
    ).first()
    
    if not session:
        session = models.Session(user_id=current_user.id, starting_cash=0.0)
        db.add(session)
        db.flush()
    
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{datetime.now().strftime('%H%M%S')}"
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax = round(subtotal * 0.05, 2)
    discount = 0
    
    # Apply coupon if provided
    if order.coupon_code:
        coupon = db.query(models.Coupon).filter(
            models.Coupon.code == order.coupon_code.upper(),
            models.Coupon.is_active == True
        ).first()
        
        if coupon:
            now = datetime.now()
            
            # WEDNESDAY coupon only works on Wednesday
            if coupon.code == "WEDNESDAY" and now.weekday() != 2:
                raise HTTPException(status_code=400, detail="WEDNESDAY coupon is only valid on Wednesdays!")
            
            # Check valid dates
            if now < coupon.valid_from or now > coupon.valid_to:
                raise HTTPException(status_code=400, detail="Coupon has expired!")
            
            # Check minimum order
            if subtotal < coupon.min_order_amount:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Minimum order amount is ₹{coupon.min_order_amount} for {coupon.code}"
                )
            
            # Check usage limit
            if coupon.used_count >= coupon.usage_limit:
                raise HTTPException(status_code=400, detail="Coupon usage limit reached!")
            
            # Calculate discount
            if coupon.discount_type == "percentage":
                discount = round(subtotal * (coupon.discount_value / 100), 2)
                if coupon.max_discount:
                    discount = min(discount, coupon.max_discount)
            else:
                discount = coupon.discount_value
            
            coupon.used_count += 1
        else:
            raise HTTPException(status_code=400, detail="Invalid coupon code!")
    
    total = round(subtotal + tax - discount, 2)
    
    db_order = models.Order(
        order_number=order_number,
        table_id=order.table_id,
        customer_id=order.customer_id,
        user_id=current_user.id,
        session_id=session.id,
        order_type=order.order_type,
        subtotal=subtotal,
        tax=tax,
        discount=discount,
        total=total,
        notes=order.notes,
        items=[item.dict() for item in order.items],
        status="pending"
    )
    
    db.add(db_order)
    
    if order.table_id:
        table = db.query(models.Table).filter(models.Table.id == order.table_id).first()
        if table:
            table.status = "occupied"
    
    session.total_sales = (session.total_sales or 0) + total
    session.order_count = (session.order_count or 0) + 1
    
    db.commit()
    db.refresh(db_order)
    # Update customer stats - ADD THIS
    if order.customer_id:
        customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
        if customer:
            customer.total_spent = (customer.total_spent or 0) + total
            customer.visit_count = (customer.visit_count or 0) + 1
            customer.loyalty_points = (customer.loyalty_points or 0) + int(total / 10)
            db.commit()
    
    return db_order

@router.get("/active")
def get_active_orders(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    orders = db.query(models.Order).filter(
        models.Order.status.in_(["pending", "preparing", "ready"])
    ).order_by(models.Order.created_at.asc()).all()
    return orders

# ⚠️ /history MUST be BEFORE /{order_id} ⚠️
@router.get("/history")
def get_order_history(
    search: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    query = db.query(models.Order)
    
    if search:
        query = query.filter(
            (models.Order.order_number.ilike(f"%{search}%")) |
            (models.Order.notes.ilike(f"%{search}%"))
        )
    
    if status:
        query = query.filter(models.Order.status == status)
    
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": f"Order status updated to {status}", "status": status}

# ⚠️ /{order_id} MUST be AFTER /history and /active ⚠️
@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.query(models.Payment).filter(models.Payment.order_id == order_id).delete()
    db.query(models.Review).filter(models.Review.order_id == order_id).delete()
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}

@router.put("/{order_id}/customer")
def update_order_customer(
    order_id: int,
    customer_name: str = None,
    customer_email: str = None,
    customer_phone: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Build new notes string
    new_notes = f"Customer: {customer_name or 'Guest'} | Email: {customer_email or 'N/A'} | Phone: {customer_phone or 'N/A'}"
    order.notes = new_notes
    
    db.commit()
    return {"message": "Customer info updated", "notes": new_notes}

    