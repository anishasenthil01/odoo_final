from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas, auth, database

router = APIRouter()

@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    
    # Default role to customer
    role = getattr(user, 'role', None) or 'customer'
    
    db_user = models.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # If role is customer, also create in customers table - ADD THIS
    if role == 'customer':
        existing_customer = db.query(models.Customer).filter(
            models.Customer.email == user.email
        ).first()
        if not existing_customer:
            db_customer = models.Customer(
                name=user.full_name,
                email=user.email,
                phone=getattr(user, 'phone', '') or '',
                visit_count=0,
                total_spent=0.0,
                loyalty_points=0
            )
            db.add(db_customer)
            db.commit()
    
    return db_user

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact admin."
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user