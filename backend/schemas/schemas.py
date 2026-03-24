from pydantic import BaseModel, EmailStr
from typing import Optional, Any, List
from datetime import datetime
from enum import Enum

# ─── AUTH ───────────────────────────────────────────
class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    telefone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: int
    nome: str
    email: str
    telefone: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ─── EVENTS ─────────────────────────────────────────
class EventCreate(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: Optional[datetime] = None

class EventOut(EventCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ─── TASKS ──────────────────────────────────────────
class PrioridadeEnum(str, Enum):
    alta = "alta"
    media = "media"
    baixa = "baixa"

class StatusEnum(str, Enum):
    a_fazer = "a_fazer"
    em_andamento = "em_andamento"
    concluido = "concluido"

class TaskCreate(BaseModel):
    titulo: str
    prazo: Optional[datetime] = None
    prioridade: Optional[PrioridadeEnum] = PrioridadeEnum.media
    categoria: Optional[str] = None

class TaskUpdate(BaseModel):
    titulo: Optional[str] = None
    prazo: Optional[datetime] = None
    prioridade: Optional[PrioridadeEnum] = None
    status: Optional[StatusEnum] = None
    categoria: Optional[str] = None

class TaskOut(TaskCreate):
    id: int
    user_id: int
    status: StatusEnum
    created_at: datetime
    class Config:
        from_attributes = True

# ─── FINANCES ───────────────────────────────────────
class TipoEnum(str, Enum):
    gasto = "gasto"
    receita = "receita"

class FinanceCreate(BaseModel):
    valor: float
    tipo: TipoEnum
    categoria: Optional[str] = None
    descricao: Optional[str] = None

class FinanceOut(FinanceCreate):
    id: int
    user_id: int
    data: datetime
    class Config:
        from_attributes = True

# ─── HABITS ─────────────────────────────────────────
class HabitCreate(BaseModel):
    nome: str
    frequencia: Optional[str] = "diario"

class HabitOut(HabitCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class HabitLogCreate(BaseModel):
    concluido: bool = True

class HabitLogOut(BaseModel):
    id: int
    habit_id: int
    data: datetime
    concluido: bool
    class Config:
        from_attributes = True

# ─── AI CHAT ────────────────────────────────────────
class ChatMessage(BaseModel):
    mensagem: str

class ChatResponse(BaseModel):
    resposta: str
    acao_executada: Optional[Any] = None

# ─── RANKING ─────────────────────────────────────────
class UserPointsCreate(BaseModel):
    pontos_total: int = 0
    pontos_hoje: int = 0
    streak_dias: int = 0
    streak_vidas: int = 3
    nivel: str = "Iniciante"

class UserPointsOut(UserPointsCreate):
    id: int
    user_id: int
    ultimo_acesso: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

class PointHistoryCreate(BaseModel):
    pontos: int
    motivo: str

class PointHistoryOut(PointHistoryCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class RankingMeuOut(BaseModel):
    pontos_total: int
    pontos_hoje: int
    streak_dias: int
    streak_vidas: int
    nivel: str
    proximo_nivel: str
    pontos_proximo_nivel: int
    pontos_faltantes: int
    progresso_percentual: float
    historico_hoje: List[PointHistoryOut]
    posicao_ranking: Optional[int] = None

class RankingTopOut(BaseModel):
    posicao: int
    user_id: int
    nome: str
    pontos_total: int
    nivel: str
    streak_dias: int