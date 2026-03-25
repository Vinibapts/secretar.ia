# -*- coding: utf-8 -*-
"""
Serviço de IA Inteligente - Secretar.IA
Processa comandos de voz em português com aprendizado contínuo
"""

import asyncio
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from .training_examples import (
    get_training_examples, get_context_patterns, get_response_templates,
    get_intent_from_input, extract_entities
)

class IntelligentAIService:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.training_examples = get_training_examples()
        self.context_patterns = get_context_patterns()
        self.response_templates = get_response_templates()
        
    async def process_voice_command(self, user_input: str, user_id: str) -> Dict[str, Any]:
        """
        Processa comando de voz e retorna resposta inteligente
        """
        try:
            # 1. Limpar e normalizar input
            clean_input = self._clean_input(user_input)
            
            # 2. Detectar intent
            intent = get_intent_from_input(clean_input)
            
            # 3. Extrair entidades
            entities = extract_entities(clean_input, intent)
            
            # 4. Verificar conflitos
            conflicts = await self._check_conflicts(user_id, intent, entities)
            
            # 5. Gerar resposta
            response = await self._generate_response(intent, entities, conflicts)
            
            # 6. Executar ação se necessário
            result = await self._execute_action(intent, entities, user_id, conflicts)
            
            return {
                "intent": intent,
                "entities": entities,
                "response": response,
                "result": result,
                "conflicts": conflicts,
                "success": True
            }
            
        except Exception as e:
            return {
                "intent": "error",
                "entities": {},
                "response": f"Desculpe, não entendi. Pode repetir?",
                "result": None,
                "conflicts": [],
                "success": False,
                "error": str(e)
            }
    
    def _clean_input(self, user_input: str) -> str:
        """Limpa e normaliza o input do usuário"""
        # Remover caracteres especiais, normalizar
        clean = user_input.lower().strip()
        
        # Converter gírias para linguagem formal
        slang_map = {
            "rolê": "encontro",
            "galera": "amigos",
            "grana": "dinheiro",
            "bora": "vamos",
            "tô": "estou",
            "pra": "para",
            "pro": "para o",
            "cê": "você"
        }
        
        for slang, formal in slang_map.items():
            clean = clean.replace(slang, formal)
        
        return clean
    
    async def _check_conflicts(self, user_id: str, intent: str, entities: Dict) -> List[Dict]:
        """Verifica conflitos de agenda e outros"""
        conflicts = []
        
        if intent == "create_event" and "data_inicio" in entities:
            # Verificar conflitos de agenda
            existing_events = await self._get_events_at_time(user_id, entities["data_inicio"])
            
            if existing_events:
                conflicts = [
                    {
                        "type": "agenda_conflict",
                        "message": f"Você já tem {len(existing_events)} evento(s) neste horário",
                        "existing_events": existing_events
                    }
                ]
        
        return conflicts
    
    async def _generate_response(self, intent: str, entities: Dict, conflicts: List[Dict]) -> str:
        """Gera resposta inteligente baseada no contexto"""
        
        if conflicts:
            # Se há conflitos, perguntar o que fazer
            conflict_msg = conflicts[0]["message"]
            return f"⚠️ {conflict_msg}. Deseja substituir ou escolher outro horário?"
        
        # Respostas baseadas no intent
        if intent == "create_event":
            if "titulo" in entities:
                return f"✅ {entities['titulo']} agendado com sucesso!"
            else:
                return "✅ Evento agendado com sucesso!"
                
        elif intent == "create_finance":
            if entities.get("tipo") == "gasto":
                valor = entities.get("valor", "valor não informado")
                return f"✅ Gasto de R$ {valor} registrado!"
            elif entities.get("tipo") == "receita":
                valor = entities.get("valor", "valor não informado")
                return f"✅ Receita de R$ {valor} registrada!"
                
        elif intent == "create_habit":
            if "atividade" in entities:
                return f"✅ {entities['atividade']} registrado! Parabéns! 🎯"
            else:
                return "✅ Hábito registrado! Continue assim! 💪"
                
        elif intent == "query_events":
            return "🔍 Verificando seus eventos..."
            
        elif intent == "query_finances":
            return "💰 Verificando suas finanças..."
            
        elif intent == "query_habits":
            return "📊 Verificando seus hábitos..."
            
        elif intent == "query_ranking":
            return "🏆 Verificando seu ranking..."
            
        else:
            return "🤔 Não entendi completamente. Pode reformular?"
    
    async def _execute_action(self, intent: str, entities: Dict, user_id: str, conflicts: List[Dict]) -> Optional[Dict]:
        """Executa a ação correspondente ao intent"""
        
        if conflicts:
            # Não executar se houver conflitos não resolvidos
            return None
        
        try:
            if intent == "create_event":
                return await self._create_event(entities, user_id)
            elif intent == "create_finance":
                return await self._create_finance(entities, user_id)
            elif intent == "create_habit":
                return await self._create_habit(entities, user_id)
            elif intent == "query_events":
                return await self._query_events(entities, user_id)
            elif intent == "query_finances":
                return await self._query_finances(entities, user_id)
            elif intent == "query_habits":
                return await self._query_habits(entities, user_id)
            elif intent == "query_ranking":
                return await self._query_ranking(entities, user_id)
            else:
                return None
                
        except Exception as e:
            return {"error": str(e)}
    
    async def _create_event(self, entities: Dict, user_id: str) -> Dict:
        """Cria um evento na agenda"""
        # Lógica para criar evento no banco
        # Por enquanto, simulação
        event_data = {
            "user_id": user_id,
            "titulo": entities.get("titulo", "Novo evento"),
            "data_inicio": self._parse_datetime(entities.get("data_inicio")),
            "status": "active"
        }
        
        # Aqui você implementaria a criação real no banco
        # await self.db.add(Event(**event_data))
        
        return {"event_id": "simulated_id", **event_data}
    
    async def _create_finance(self, entities: Dict, user_id: str) -> Dict:
        """Cria uma transação financeira"""
        finance_data = {
            "user_id": user_id,
            "valor": entities.get("valor", 0.0),
            "tipo": entities.get("tipo", "gasto"),
            "categoria": entities.get("categoria", "outros"),
            "descricao": entities.get("descricao", ""),
            "data": datetime.now()
        }
        
        # Aqui você implementaria a criação real no banco
        # await self.db.add(Finance(**finance_data))
        
        return {"finance_id": "simulated_id", **finance_data}
    
    async def _create_habit(self, entities: Dict, user_id: str) -> Dict:
        """Cria um registro de hábito"""
        habit_data = {
            "user_id": user_id,
            "atividade": entities.get("atividade", "Hábito"),
            "duracao": entities.get("duracao", 30),
            "data": datetime.now(),
            "concluido": True
        }
        
        # Aqui você implementaria a criação real no banco
        # await self.db.add(HabitLog(**habit_data))
        
        # Adicionar pontos ao ranking
        await self._add_ranking_points(user_id, 5)
        
        return {"habit_id": "simulated_id", **habit_data}
    
    async def _query_events(self, entities: Dict, user_id: str) -> Dict:
        """Consulta eventos do usuário"""
        # Lógica para consultar eventos
        # Por enquanto, simulação
        return {"events": [], "total": 0}
    
    async def _query_finances(self, entities: Dict, user_id: str) -> Dict:
        """Consulta finanças do usuário"""
        # Lógica para consultar finanças
        # Por enquanto, simulação
        return {"finances": [], "total_gastos": 0, "total_receitas": 0}
    
    async def _query_habits(self, entities: Dict, user_id: str) -> Dict:
        """Consulta hábitos do usuário"""
        # Lógica para consultar hábitos
        # Por enquanto, simulação
        return {"habits": [], "total": 0}
    
    async def _query_ranking(self, entities: Dict, user_id: str) -> Dict:
        """Consulta ranking do usuário"""
        # Lógica para consultar ranking
        # Por enquanto, simulação
        return {"position": 1, "points": 100, "level": "Bronze"}
    
    async def _add_ranking_points(self, user_id: str, points: int) -> Dict:
        """Adiciona pontos ao ranking"""
        # Lógica para adicionar pontos
        # Por enquanto, simulação
        return {"points_added": points, "total_points": 100 + points}
    
    async def _get_events_at_time(self, user_id: str, datetime_str: str) -> List[Dict]:
        """Obtém eventos em um determinado horário"""
        # Lógica para verificar conflitos
        # Por enquanto, simulação
        return []
    
    def _parse_datetime(self, datetime_str: str) -> datetime:
        """Converte string de data/hora para datetime"""
        now = datetime.now()
        
        if "amanhã" in datetime_str.lower():
            return now + timedelta(days=1)
        elif "hoje" in datetime_str.lower():
            return now
        elif "sexta" in datetime_str.lower():
            days_ahead = (4 - now.weekday()) % 7
            return now + timedelta(days=days_ahead)
        elif "segunda" in datetime_str.lower():
            days_ahead = (0 - now.weekday()) % 7
            return now + timedelta(days=days_ahead)
        
        # Extrair hora
        hora_match = re.search(r'(\d{1,2})h', datetime_str.lower())
        if hora_match:
            hora = int(hora_match.group(1))
            return now.replace(hour=hora, minute=0, second=0, microsecond=0)
        
        return now
    
    async def learn_from_interaction(self, user_input: str, intent: str, user_feedback: str):
        """
        Aprende com as interações do usuário para melhorar respostas futuras
        """
        # Salvar interação para aprendizado
        learning_data = {
            "user_input": user_input,
            "predicted_intent": intent,
            "user_feedback": user_feedback,
            "timestamp": datetime.now()
        }
        
        # Aqui você implementaria o aprendizado real
        # Por enquanto, apenas log
        print(f"🧠 Learning from interaction: {learning_data}")
        
        return learning_data
    
    async def get_suggestions(self, user_id: str) -> List[str]:
        """
        Gera sugestões inteligentes baseadas no histórico do usuário
        """
        suggestions = []
        
        # Analisar padrões do usuário
        # Por enquanto, sugestões genéricas
        suggestions = [
            "Você não registrou nenhum hábito hoje. Que tal começar com uma caminhada?",
            "Seu saldo está baixo. Que tal revisar seus gastos?",
            "Você tem poucos eventos esta semana. Que tal organizar sua agenda?"
        ]
        
        return suggestions

# Funções auxiliares para uso no backend
async def process_voice_command(user_input: str, user_id: str, db_session: Session) -> Dict[str, Any]:
    """
    Função principal para processar comandos de voz
    """
    ai_service = IntelligentAIService(db_session)
    return await ai_service.process_voice_command(user_input, user_id)

async def get_ai_suggestions(user_id: str, db_session: Session) -> List[str]:
    """
    Obtém sugestões inteligentes da IA
    """
    ai_service = IntelligentAIService(db_session)
    return await ai_service.get_suggestions(user_id)
