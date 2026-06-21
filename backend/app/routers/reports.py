from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from .. import models, database, auth

router = APIRouter()

@router.get("/daily-sales")
def get_daily_sales(
    date: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    start_date = datetime.strptime(date, "%Y-%m-%d")
    end_date = start_date + timedelta(days=1)
    
    orders = db.query(models.Order).filter(
        models.Order.created_at >= start_date,
        models.Order.created_at < end_date,
        models.Order.status != models.OrderStatus.CANCELLED
    ).all()
    
    total_sales = sum(order.total for order in orders)
    total_orders = len(orders)
    average_order = total_sales / total_orders if total_orders > 0 else 0
    
    # Sales by payment method
    payments = db.query(
        models.PaymentMethod.name,
        func.sum(models.Payment.amount).label('total')
    ).join(
        models.Payment,
        models.Payment.payment_method_id == models.PaymentMethod.id
    ).join(
        models.Order,
        models.Order.id == models.Payment.order_id
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.created_at < end_date
    ).group_by(
        models.PaymentMethod.name
    ).all()
    
    return {
        "date": date,
        "total_sales": total_sales,
        "total_orders": total_orders,
        "average_order": round(average_order, 2),
        "payment_methods": [{"method": p[0], "total": p[1]} for p in payments]
    }

@router.get("/popular-items")
def get_popular_items(
    days: int = 7,
    limit: int = 10,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    start_date = datetime.now() - timedelta(days=days)
    
    # This is a simplified version - in production you'd need a proper order_items table
    orders = db.query(models.Order).filter(
        models.Order.created_at >= start_date,
        models.Order.status != models.OrderStatus.CANCELLED
    ).all()
    
    # Count items from JSON
    item_counts = {}
    for order in orders:
        if order.items:
            for item in order.items:
                name = item.get('name', 'Unknown')
                quantity = item.get('quantity', 0)
                if name in item_counts:
                    item_counts[name] += quantity
                else:
                    item_counts[name] = quantity
    
    # Sort by count and get top items
    popular_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    return [
        {"name": item[0], "quantity_sold": item[1]}
        for item in popular_items
    ]

@router.get("/hourly-sales")
def get_hourly_sales(
    date: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    start_date = datetime.strptime(date, "%Y-%m-%d")
    end_date = start_date + timedelta(days=1)
    
    hourly_data = []
    for hour in range(24):
        hour_start = start_date + timedelta(hours=hour)
        hour_end = hour_start + timedelta(hours=1)
        
        orders = db.query(models.Order).filter(
            models.Order.created_at >= hour_start,
            models.Order.created_at < hour_end,
            models.Order.status != models.OrderStatus.CANCELLED
        ).all()
        
        total = sum(order.total for order in orders)
        count = len(orders)
        
        hourly_data.append({
            "hour": hour,
            "sales": total,
            "orders": count
        })
    
    return {
        "date": date,
        "hourly_data": hourly_data
    }