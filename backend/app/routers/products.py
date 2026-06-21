from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_available: Optional[bool] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get all products with optional filters.
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **category_id**: Filter by category
    - **search**: Search products by name
    - **is_available**: Filter by availability status
    """
    query = db.query(models.Product)
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    
    if is_available is not None:
        query = query.filter(models.Product.is_available == is_available)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/featured", response_model=List[schemas.ProductResponse])
def get_featured_products(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all featured products."""
    products = db.query(models.Product).filter(
        models.Product.is_featured == True,
        models.Product.is_available == True
    ).all()
    return products

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a single product by ID."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.get("/barcode/{barcode}", response_model=schemas.ProductResponse)
def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a product by its barcode."""
    product = db.query(models.Product).filter(models.Product.barcode == barcode).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    """
    Create a new product.
    
    Requires manager or admin role.
    """
    # Check if product with same name exists
    existing_product = db.query(models.Product).filter(
        models.Product.name == product.name
    ).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this name already exists"
        )
    
    # Check if SKU already exists
    if product.sku:
        existing_sku = db.query(models.Product).filter(
            models.Product.sku == product.sku
        ).first()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists"
            )
    
    # Check if barcode already exists
    if product.barcode:
        existing_barcode = db.query(models.Product).filter(
            models.Product.barcode == product.barcode
        ).first()
        if existing_barcode:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this barcode already exists"
            )
    
    # Check if category exists if provided
    if product.category_id:
        category = db.query(models.Category).filter(
            models.Category.id == product.category_id
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    """
    Update an existing product.
    
    Requires manager or admin role.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if new name conflicts with existing product
    if product.name != db_product.name:
        existing_product = db.query(models.Product).filter(
            models.Product.name == product.name,
            models.Product.id != product_id
        ).first()
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this name already exists"
            )
    
    # Check if category exists if provided
    if product.category_id:
        category = db.query(models.Category).filter(
            models.Category.id == product.category_id
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Update all fields
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.patch("/{product_id}", response_model=schemas.ProductResponse)
def partial_update_product(
    product_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    price: Optional[float] = None,
    cost_price: Optional[float] = None,
    sku: Optional[str] = None,
    barcode: Optional[str] = None,
    image_url: Optional[str] = None,
    category_id: Optional[int] = None,
    is_available: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    stock_quantity: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    """
    Partially update a product. Only provided fields will be updated.
    
    Requires manager or admin role.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update only provided fields
    if name is not None:
        db_product.name = name
    if description is not None:
        db_product.description = description
    if price is not None:
        db_product.price = price
    if cost_price is not None:
        db_product.cost_price = cost_price
    if sku is not None:
        db_product.sku = sku
    if barcode is not None:
        db_product.barcode = barcode
    if image_url is not None:
        db_product.image_url = image_url
    if category_id is not None:
        db_product.category_id = category_id
    if is_available is not None:
        db_product.is_available = is_available
    if is_featured is not None:
        db_product.is_featured = is_featured
    if stock_quantity is not None:
        db_product.stock_quantity = stock_quantity
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """
    Delete a product.
    
    Requires admin role.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    db.delete(product)
    db.commit()
    return None

@router.put("/{product_id}/stock", response_model=schemas.ProductResponse)
def update_stock(
    product_id: int,
    quantity: int,
    operation: str = "set",  # set, add, subtract
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    """
    Update product stock quantity.
    
    - **quantity**: The quantity to set/add/subtract
    - **operation**: Stock operation type (set, add, subtract)
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if operation == "set":
        product.stock_quantity = quantity
    elif operation == "add":
        product.stock_quantity += quantity
    elif operation == "subtract":
        if product.stock_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        product.stock_quantity -= quantity
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid operation. Use 'set', 'add', or 'subtract'"
        )
    
    db.commit()
    db.refresh(product)
    return product

@router.get("/category/{category_id}", response_model=List[schemas.ProductResponse])
def get_products_by_category(
    category_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get all products in a specific category.
    """
    # Check if category exists
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    products = db.query(models.Product).filter(
        models.Product.category_id == category_id
    ).offset(skip).limit(limit).all()
    
    return products

@router.get("/low-stock/list", response_model=List[schemas.ProductResponse])
def get_low_stock_products(
    threshold: int = 10,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    """
    Get products with stock below threshold.
    
    - **threshold**: Stock quantity threshold (default: 10)
    """
    products = db.query(models.Product).filter(
        models.Product.stock_quantity <= threshold,
        models.Product.is_available == True
    ).all()
    
    return products

@router.get("/stats/summary")
def get_product_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get product statistics summary.
    """
    total_products = db.query(models.Product).count()
    available_products = db.query(models.Product).filter(
        models.Product.is_available == True
    ).count()
    featured_products = db.query(models.Product).filter(
        models.Product.is_featured == True
    ).count()
    low_stock = db.query(models.Product).filter(
        models.Product.stock_quantity <= 10,
        models.Product.is_available == True
    ).count()
    out_of_stock = db.query(models.Product).filter(
        models.Product.stock_quantity == 0,
        models.Product.is_available == True
    ).count()
    
    # Get average price
    from sqlalchemy import func
    avg_price = db.query(func.avg(models.Product.price)).scalar()
    
    return {
        "total_products": total_products,
        "available_products": available_products,
        "featured_products": featured_products,
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock,
        "average_price": round(float(avg_price), 2) if avg_price else 0
    }