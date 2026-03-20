from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Task, User
from schemas.schemas import TaskCreate, TaskOut, TaskUpdate
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/tasks", tags=["Tasks"])

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

@router.post("/", response_model=TaskOut, status_code=201)
def criar_tarefa(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    nova = Task(
        user_id=current_user.id,
        titulo=task.titulo,
        prazo=task.prazo,
        prioridade=task.prioridade,
        categoria=task.categoria
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@router.get("/", response_model=list[TaskOut])
def listar_tarefas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.user_id == current_user.id).all()

@router.get("/{task_id}", response_model=TaskOut)
def buscar_tarefa(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return task

@router.put("/{task_id}", response_model=TaskOut)
def atualizar_tarefa(task_id: int, task: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    if task.titulo is not None:
        db_task.titulo = task.titulo
    if task.prazo is not None:
        db_task.prazo = task.prazo
    if task.prioridade is not None:
        db_task.prioridade = task.prioridade
    if task.status is not None:
        db_task.status = task.status
    if task.categoria is not None:
        db_task.categoria = task.categoria
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=204)
def deletar_tarefa(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    db.delete(db_task)
    db.commit()
    return None