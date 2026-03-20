from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from database.models import Finance, User
from schemas.schemas import FinanceCreate, FinanceOut
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/finances", tags=["Finances"])

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

@router.post("/", response_model=FinanceOut, status_code=201)
def criar_registro(finance: FinanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    novo = Finance(
        user_id=current_user.id,
        valor=finance.valor,
        tipo=finance.tipo,
        categoria=finance.categoria,
        descricao=finance.descricao
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/", response_model=list[FinanceOut])
def listar_registros(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Finance).filter(Finance.user_id == current_user.id).all()

@router.get("/resumo")
def resumo_financeiro(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_gastos = db.query(func.sum(Finance.valor)).filter(
        Finance.user_id == current_user.id,
        Finance.tipo == "gasto"
    ).scalar() or 0

    total_receitas = db.query(func.sum(Finance.valor)).filter(
        Finance.user_id == current_user.id,
        Finance.tipo == "receita"
    ).scalar() or 0

    return {
        "total_gastos": round(total_gastos, 2),
        "total_receitas": round(total_receitas, 2),
        "saldo": round(total_receitas - total_gastos, 2)
    }

@router.get("/{finance_id}", response_model=FinanceOut)
def buscar_registro(finance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    finance = db.query(Finance).filter(Finance.id == finance_id, Finance.user_id == current_user.id).first()
    if not finance:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    return finance

@router.delete("/{finance_id}", status_code=204)
def deletar_registro(finance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_finance = db.query(Finance).filter(Finance.id == finance_id, Finance.user_id == current_user.id).first()
    if not db_finance:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    db.delete(db_finance)
    db.commit()
    return None