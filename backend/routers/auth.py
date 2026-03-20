from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from schemas.schemas import UserCreate, UserLogin, Token
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

def hash_senha(senha: str):
    return pwd_context.hash(senha)

def verificar_senha(senha: str, hash: str):
    return pwd_context.verify(senha, hash)

def criar_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existente = db.query(User).filter(User.email == user.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    novo = User(
        nome=user.nome,
        email=user.email,
        senha_hash=hash_senha(user.senha),
        telefone=user.telefone
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"mensagem": "Usuário criado com sucesso", "id": novo.id}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verificar_senha(user.senha, db_user.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    token = criar_token({"sub": str(db_user.id), "email": db_user.email})
    return {"access_token": token, "token_type": "bearer"}