from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, Event, Task, Finance, Habit
from schemas.schemas import ChatMessage, ChatResponse
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from datetime import datetime
import httpx
import os

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chat"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
GROK_API_KEY = os.getenv("GROK_API_KEY")

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

def get_contexto_usuario(user_id: int, db: Session):
    eventos = db.query(Event).filter(Event.user_id == user_id).all()
    tarefas = db.query(Task).filter(Task.user_id == user_id).all()
    habitos = db.query(Habit).filter(Habit.user_id == user_id).all()

    contexto = "Dados atuais do usuário:\n"

    if eventos:
        contexto += "\nEventos na agenda:\n"
        for e in eventos:
            contexto += f"- [{e.id}] {e.titulo} em {e.data_inicio.strftime('%d/%m/%Y %H:%M')}\n"
    else:
        contexto += "\nNenhum evento na agenda.\n"

    if tarefas:
        contexto += "\nTarefas:\n"
        for t in tarefas:
            contexto += f"- [{t.id}] {t.titulo} | prioridade: {t.prioridade} | status: {t.status}\n"
    else:
        contexto += "\nNenhuma tarefa cadastrada.\n"

    if habitos:
        contexto += "\nHábitos:\n"
        for h in habitos:
            contexto += f"- [{h.id}] {h.nome} ({h.frequencia})\n"
    else:
        contexto += "\nNenhum hábito cadastrado.\n"

    return contexto

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not GROK_API_KEY or GROK_API_KEY == "sua_chave_aqui":
        return ChatResponse(
            resposta="IA ainda não configurada. Adicione sua chave do Grok no arquivo .env.",
            acao_executada=None
        )

    contexto = get_contexto_usuario(current_user.id, db)
    hoje = datetime.now().strftime("%d/%m/%Y %H:%M")

    system_prompt = f"""Você é o Secretar.IA, um secretário pessoal inteligente.
Hoje é {hoje}.
Responda sempre em português brasileiro.
Seja objetivo e direto. Máximo 3 frases por resposta.
Seu nome é Secretar.IA e foi criado por Vinícius.

{contexto}

Você pode ajudar o usuário a:
- Consultar eventos, tarefas e hábitos
- Sugerir organizações de rotina
- Responder perguntas sobre a agenda
- Dar dicas de produtividade

Quando o usuário pedir para criar, editar ou deletar algo, informe que a ação 
deve ser feita pelas telas do app por enquanto."""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROK_API_KEY}"
                },
                json={
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message.mensagem}
                    ],
                    "model": "grok-3-latest",
                    "stream": False,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            data = response.json()
            print("RESPOSTA GROK:", data)
            if "choices" not in data:
                raise HTTPException(status_code=500, detail=f"Erro Grok: {data}")
            resposta = data["choices"][0]["message"]["content"]

            return ChatResponse(
                resposta=resposta,
                acao_executada=None
            )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")