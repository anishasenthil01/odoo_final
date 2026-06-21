from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter()

@router.get("/stats")
def get_review_stats(db: Session = Depends(database.get_db)):
    from sqlalchemy import func
    
    total = db.query(models.Review).count()
    
    if total == 0:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "ratings": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        }
    
    avg_rating = db.query(func.avg(models.Review.rating)).scalar()
    
    ratings = {}
    for i in range(1, 6):
        count = db.query(models.Review).filter(models.Review.rating == i).count()
        ratings[str(i)] = count
    
    return {
        "total_reviews": total,
        "average_rating": round(float(avg_rating), 1) if avg_rating else 0,
        "ratings": ratings
    }

@router.get("/", response_model=List[schemas.ReviewResponse])
def get_all_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    reviews = db.query(models.Review).order_by(models.Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews

@router.post("/", response_model=schemas.ReviewResponse)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == review.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    existing = db.query(models.Review).filter(models.Review.order_id == review.order_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this order")
    
    db_review = models.Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review