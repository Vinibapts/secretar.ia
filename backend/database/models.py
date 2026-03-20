from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.database import Base
import enum

# Enums
class PrioridadeEnum(str, enum.Enum):
    alta = "alta"
    media = "media"
    baixa = "baixa"

class StatusEnum(str, enum.Enum):
    a_fazer = "a_fazer"
    em_andamento = "em_andamento"
    concluido = "concluido"

class TipoFinanceiroEnum(str, enum.Enum):
    gasto = "gasto"
    receita = "receita"

class CanalEnum(str, enum.Enum):
    push = "push"
    whatsapp = "whatsapp"

# Tabelas
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    telefone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    events = relationship("Event", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    finances = relationship("Finance", back_populates="user")
    habits = relationship("Habit", back_populates="user")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    titulo = Column(String, nullable=False)
    descricao = Column(Text, nullable=True)
    data_inicio = Column(DateTime(timezone=True), nullable=False)
    data_fim = Column(DateTime(timezone=True), nullable=True)
    google_event_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="events")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    titulo = Column(String, nullable=False)
    prazo = Column(DateTime(timezone=True), nullable=True)
    prioridade = Column(Enum(PrioridadeEnum), default=PrioridadeEnum.media)
    status = Column(Enum(StatusEnum), default=StatusEnum.a_fazer)
    categoria = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="tasks")

class Finance(Base):
    __tablename__ = "finances"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    valor = Column(Float, nullable=False)
    tipo = Column(Enum(TipoFinanceiroEnum), nullable=False)
    categoria = Column(String, nullable=True)
    descricao = Column(Text, nullable=True)
    data = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="finances")

class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nome = Column(String, nullable=False)
    frequencia = Column(String, default="diario")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit")

class HabitLog(Base):
    __tablename__ = "habit_logs"
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    data = Column(DateTime(timezone=True), server_default=func.now())
    concluido = Column(Boolean, default=False)

    habit = relationship("Habit", back_populates="logs")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mensagem = Column(Text, nullable=False)
    canal = Column(Enum(CanalEnum), default=CanalEnum.push)
    enviado = Column(Boolean, default=False)
    enviado_em = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())