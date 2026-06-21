from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import models, schemas, database, auth

router = APIRouter()

@router.post("/start", response_model=schemas.SessionResponse)
def start_session(
    session_data: schemas.SessionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if user already has an active session
    active_session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.is_active == True
    ).first()
    
    if active_session:
        raise HTTPException(status_code=400, detail="You already have an active session")
    
    db_session = models.Session(
        user_id=current_user.id,
        starting_cash=session_data.starting_cash
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.post("/{session_id}/end")
def end_session(
    session_id: int,
    ending_cash: float,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.user_id == current_user.id,
        models.Session.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    session.end_time = datetime.utcnow()
    session.ending_cash = ending_cash
    session.expected_cash = session.starting_cash + session.total_sales
    session.cash_difference = ending_cash - session.expected_cash
    session.is_active = False
    session.closed_by = current_user.full_name
    
    db.commit()
    
    return {
        "message": "Session ended successfully",
        "session_id": session.id,
        "total_sales": session.total_sales,
        "expected_cash": session.expected_cash,
        "cash_difference": session.cash_difference,
        "order_count": session.order_count,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "starting_cash": session.starting_cash,
        "ending_cash": ending_cash
    }

@router.get("/active", response_model=schemas.SessionResponse)
def get_active_session(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="No active session")
    
    return session

@router.get("/last-closed")
def get_last_closed_session(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get the last closed session for the current user"""
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.is_active == False
    ).order_by(models.Session.end_time.desc()).first()
    
    if not session:
        return {
            "has_previous": False,
            "message": "No previous sessions found"
        }
    
    return {
        "has_previous": True,
        "session_id": session.id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "total_sales": session.total_sales,
        "order_count": session.order_count,
        "starting_cash": session.starting_cash,
        "ending_cash": session.ending_cash,
        "cash_difference": session.cash_difference,
        "closed_by": session.closed_by
    }

@router.get("/all-closed")
def get_all_closed_sessions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Get all closed sessions (admin only)"""
    sessions = db.query(models.Session).filter(
        models.Session.is_active == False
    ).order_by(models.Session.end_time.desc()).limit(50).all()
    
    return sessions

@router.get("/today-summary")
def get_today_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Get today's sales summary"""
    from datetime import datetime, timedelta
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    sessions = db.query(models.Session).filter(
        models.Session.start_time >= today_start
    ).all()
    
    total_sales = sum(s.total_sales or 0 for s in sessions)
    total_orders = sum(s.order_count or 0 for s in sessions)
    active_sessions = len([s for s in sessions if s.is_active])
    
    return {
        "date": today_start.strftime("%Y-%m-%d"),
        "total_sales": total_sales,
        "total_orders": total_orders,
        "active_sessions": active_sessions,
        "total_sessions": len(sessions)
    }