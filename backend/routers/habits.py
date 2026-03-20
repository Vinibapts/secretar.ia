from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Habit, HabitLog, User
from schemas.schemas import HabitCreate, HabitOut, HabitLogCreate, HabitLogOut
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

router = APIRouter(prefix="/habits", tags=["Habits"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.post("/", response_model=HabitOut, status_code=201)
def criar_habito(habit: HabitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    novo = Habit(
        user_id=current_user.id,
        nome=habit.nome,
        frequencia=habit.frequencia
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/", response_model=list[HabitOut])
def listar_habitos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()

@router.get("/{habit_id}", response_model=HabitOut)
def buscar_habito(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    return habit

@router.delete("/{habit_id}", status_code=204)
def deletar_habito(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    db.delete(db_habit)
    db.commit()
    return None

@router.post("/{habit_id}/log", response_model=HabitLogOut, status_code=201)
def registrar_log(habit_id: int, log: HabitLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    novo_log = HabitLog(
        habit_id=habit_id,
        concluido=log.concluido,
        data=datetime.now()
    )
    db.add(novo_log)
    db.commit()
    db.refresh(novo_log)
    return novo_log

@router.get("/{habit_id}/logs", response_model=list[HabitLogOut])
def listar_logs(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    return db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()