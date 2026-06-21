from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.UserResponse])
def get_employees(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    return db.query(models.User).all()

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_employee(
    user_id: int,
    role: str = None,
    is_active: bool = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role:
        user.role = role
    if is_active is not None:
        user.is_active = is_active
    
    db.commit()
    db.refresh(user)
    return user