from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Event, User
from schemas.schemas import EventCreate, EventOut
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
from routers.ranking import adicionar_pontos

load_dotenv()

router = APIRouter(prefix="/events", tags=["Events"])

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

@router.post("/", response_model=EventOut, status_code=201)
def criar_evento(event: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    novo = Event(
        user_id=current_user.id,
        titulo=event.titulo,
        descricao=event.descricao,
        data_inicio=event.data_inicio,
        data_fim=event.data_fim
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    
    # Adicionar pontos por criar evento
    try:
        adicionar_pontos(current_user.id, 10, "Criou evento na agenda", db)
    except Exception as e:
        print(f"Erro ao adicionar pontos: {e}")
    
    return novo

@router.get("/", response_model=list[EventOut])
def listar_eventos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Event).filter(Event.user_id == current_user.id).all()

@router.get("/{event_id}", response_model=EventOut)
def buscar_evento(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return event

@router.put("/{event_id}", response_model=EventOut)
def atualizar_evento(event_id: int, event: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    db_event.titulo = event.titulo
    db_event.descricao = event.descricao
    db_event.data_inicio = event.data_inicio
    db_event.data_fim = event.data_fim
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=204)
def deletar_evento(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    db.delete(db_event)
    db.commit()
    return None