from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.TableResponse])
def get_tables(
    floor: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Table)
    if floor:
        query = query.filter(models.Table.floor == floor)
    if status:
        query = query.filter(models.Table.status == status)
    return query.all()

@router.post("/", response_model=schemas.TableResponse)
def create_table(
    table: schemas.TableCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    # Check if table name exists
    existing = db.query(models.Table).filter(models.Table.name == table.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table name already exists")
    
    db_table = models.Table(**table.dict())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

@router.put("/{table_id}", response_model=schemas.TableResponse)
def update_table(
    table_id: int,
    table: schemas.TableCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    db_table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    for key, value in table.dict().items():
        setattr(db_table, key, value)
    
    db.commit()
    db.refresh(db_table)
    return db_table

@router.put("/{table_id}/status")
def update_table_status(
    table_id: int,
    status: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    table.status = status
    db.commit()
    return {"message": "Table status updated", "status": status}

@router.delete("/{table_id}")
def delete_table(
    table_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    db.delete(table)
    db.commit()
    return {"message": "Table deleted successfully"}