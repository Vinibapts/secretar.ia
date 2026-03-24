from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database.database import get_db
from database.models import User, UserPoints, PointHistory
from schemas.schemas import RankingMeuOut, RankingTopOut, PointHistoryCreate, PointHistoryOut
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from datetime import datetime, date, timedelta
from typing import List
import os

load_dotenv()

router = APIRouter(prefix="/ranking", tags=["Ranking"])

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

# Configuração de níveis e pontos
NIVEIS = {
    "Iniciante": {"min": 0, "max": 99, "emoji": "🌱"},
    "Aprendiz": {"min": 100, "max": 499, "emoji": "⭐"},
    "Produtivo": {"min": 500, "max": 1499, "emoji": "🚀"},
    "Expert": {"min": 1500, "max": 3999, "emoji": "💎"},
    "Mestre": {"min": 4000, "max": float('inf'), "emoji": "👑"}
}

def calcular_nivel(pontos: int) -> str:
    for nivel, config in NIVEIS.items():
        if config["min"] <= pontos <= config["max"]:
            return nivel
    return "Iniciante"

def get_proximo_nivel(nivel_atual: str) -> str:
    nivel_keys = list(NIVEIS.keys())
    current_index = nivel_keys.index(nivel_atual)
    if current_index < len(nivel_keys) - 1:
        return nivel_keys[current_index + 1]
    return nivel_atual

def adicionar_pontos(
    user_id: int, 
    pontos: int, 
    motivo: str, 
    db: Session
) -> UserPoints:
    # Garantir que UserPoints exista
    user_points = db.query(UserPoints).filter(UserPoints.user_id == user_id).first()
    if not user_points:
        user_points = UserPoints(
            user_id=user_id,
            pontos_total=0,
            pontos_hoje=0,
            streak_dias=0,
            streak_vidas=3,
            nivel="Iniciante"
        )
        db.add(user_points)
        db.commit()
        db.refresh(user_points)
    
    # Atualizar streak diário
    hoje = date.today()
    if user_points.ultimo_acesso:
        dias_desde_ultimo_acesso = (hoje - user_points.ultimo_acesso.date()).days
        
        if dias_desde_ultimo_acesso == 1:
            # Acessou no dia seguinte - mantém streak
            user_points.streak_dias += 1
        elif dias_desde_ultimo_acesso > 1:
            # Perdeu dias - verificar streak vidas
            if user_points.streak_vidas > 1:
                user_points.streak_vidas -= 1
            else:
                # Perdeu todas as vidas - zera streak
                user_points.streak_dias = 0
                user_points.streak_vidas = 3
                
        # Reset mensal das vidas (dia 1 de cada mês)
        if hoje.day == 1:
            user_points.streak_vidas = 3
    
    # Zerar pontos diários se for novo dia
    if user_points.ultimo_acesso and user_points.ultimo_acesso.date() < hoje:
        user_points.pontos_hoje = 0
    
    # Adicionar pontos
    user_points.pontos_total += pontos
    user_points.pontos_hoje += pontos
    user_points.ultimo_acesso = datetime.now()
    
    # Atualizar nível
    novo_nivel = calcular_nivel(user_points.pontos_total)
    user_points.nivel = novo_nivel
    
    # Salvar histórico
    historico = PointHistory(
        user_id=user_id,
        pontos=pontos,
        motivo=motivo
    )
    db.add(historico)
    
    db.commit()
    db.refresh(user_points)
    
    return user_points

@router.get("/meu", response_model=RankingMeuOut)
async def get_meu_ranking(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Garantir que UserPoints exista
    user_points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    if not user_points:
        user_points = UserPoints(
            user_id=current_user.id,
            pontos_total=0,
            pontos_hoje=0,
            streak_dias=0,
            streak_vidas=3,
            nivel="Iniciante",
            ultimo_acesso=datetime.now()
        )
        db.add(user_points)
        db.commit()
        db.refresh(user_points)
    
    # Histórico de hoje
    hoje_inicio = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    historico_hoje = db.query(PointHistory).filter(
        PointHistory.user_id == current_user.id,
        PointHistory.created_at >= hoje_inicio
    ).order_by(PointHistory.created_at.desc()).all()
    
    # Posição no ranking
    ranking_posicao = db.query(UserPoints).filter(
        UserPoints.pontos_total > user_points.pontos_total
    ).count() + 1
    
    # Próximo nível
    proximo_nivel = get_proximo_nivel(user_points.nivel)
    pontos_proximo_nivel = NIVEIS[proximo_nivel]["min"]
    pontos_faltantes = max(0, pontos_proximo_nivel - user_points.pontos_total)
    
    # Progresso percentual
    nivel_atual_config = NIVEIS[user_points.nivel]
    pontos_nivel_atual = user_points.pontos_total - nivel_atual_config["min"]
    pontos_total_nivel = nivel_atual_config["max"] - nivel_atual_config["min"]
    progresso_percentual = min(100, (pontos_nivel_atual / pontos_total_nivel) * 100) if pontos_total_nivel > 0 else 100
    
    return RankingMeuOut(
        pontos_total=user_points.pontos_total,
        pontos_hoje=user_points.pontos_hoje,
        streak_dias=user_points.streak_dias,
        streak_vidas=user_points.streak_vidas,
        nivel=user_points.nivel,
        proximo_nivel=proximo_nivel,
        pontos_proximo_nivel=pontos_proximo_nivel,
        pontos_faltantes=pontos_faltantes,
        progresso_percentual=progresso_percentual,
        historico_hoje=[PointHistoryOut.from_orm(h) for h in historico_hoje],
        posicao_ranking=ranking_posicao
    )

@router.get("/top10", response_model=List[RankingTopOut])
async def get_top_ranking(db: Session = Depends(get_db)):
    top_users = db.query(
        UserPoints.user_id,
        UserPoints.pontos_total,
        UserPoints.nivel,
        UserPoints.streak_dias,
        User.nome
    ).join(User, UserPoints.user_id == User.id)\
     .order_by(desc(UserPoints.pontos_total))\
     .limit(10).all()
    
    ranking = []
    for posicao, (user_id, pontos_total, nivel, streak_dias, nome) in enumerate(top_users, 1):
        ranking.append(RankingTopOut(
            posicao=posicao,
            user_id=user_id,
            nome=nome,
            pontos_total=pontos_total,
            nivel=nivel,
            streak_dias=streak_dias
        ))
    
    return ranking

@router.post("/adicionar")
async def adicionar_pontos_endpoint(
    pontos: int,
    motivo: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_points = adicionar_pontos(current_user.id, pontos, motivo, db)
    
    # Verificar se upou de nível
    nivel_emoji = NIVEIS[user_points.nivel]["emoji"]
    
    return {
        "sucesso": True,
        "mensagem": f"+{pontos} pontos adicionados! {user_points.nivel} {nivel_emoji}",
        "pontos_total": user_points.pontos_total,
        "nivel": user_points.nivel,
        "streak_dias": user_points.streak_dias
    }

@router.get("/streak-status")
async def get_streak_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_points = db.query(UserPoints).filter(UserPoints.user_id == current_user.id).first()
    
    if not user_points:
        return {"streak_dias": 0, "streak_vidas": 3, "em_risco": False}
    
    # Verificar se está em risco (não acessou hoje)
    hoje = date.today()
    em_risco = False
    
    if user_points.ultimo_acesso:
        dias_desde_ultimo_acesso = (hoje - user_points.ultimo_acesso.date()).days
        if dias_desde_ultimo_acesso >= 1:
            em_risco = True
    
    return {
        "streak_dias": user_points.streak_dias,
        "streak_vidas": user_points.streak_vidas,
        "em_risco": em_risco,
        "ultimo_acesso": user_points.ultimo_acesso
    }
