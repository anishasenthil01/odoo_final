from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=schemas.CategoryResponse)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    category: schemas.CategoryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category