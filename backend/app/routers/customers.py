from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/")
def get_customers(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            (models.Customer.name.ilike(f"%{search}%")) |
            (models.Customer.email.ilike(f"%{search}%")) |
            (models.Customer.phone.ilike(f"%{search}%"))
        )
    customers = query.order_by(models.Customer.created_at.desc()).offset(skip).limit(limit).all()
    return customers

@router.post("/")
def create_or_update_customer(
    customer_data: dict,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    email = customer_data.get('email')
    name = customer_data.get('name', '')
    phone = customer_data.get('phone', '')
    
    # Check if customer exists by email
    customer = db.query(models.Customer).filter(models.Customer.email == email).first()
    
    if customer:
        # Update existing customer
        if name: customer.name = name
        if phone: customer.phone = phone
        customer.visit_count += 1
    else:
        # Create new customer
        customer = models.Customer(
            name=name,
            email=email,
            phone=phone,
            visit_count=1
        )
        db.add(customer)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    customer_data: dict,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if 'name' in customer_data: customer.name = customer_data['name']
    if 'email' in customer_data: customer.email = customer_data['email']
    if 'phone' in customer_data: customer.phone = customer_data['phone']
    if 'loyalty_points' in customer_data: customer.loyalty_points = customer_data['loyalty_points']
    if 'notes' in customer_data: customer.notes = customer_data['notes']
    
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted"}