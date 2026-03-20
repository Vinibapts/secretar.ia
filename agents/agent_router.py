"""
AgentRouter - Sistema de Roteamento Inteligente de Agentes
Direciona mensagens para o agente especializado correto
"""
from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime

from .database_agent import DatabaseAgent
from .backend_agent import BackendAgent
from .frontend_react_agent import FrontendReactAgent
from .ui_ux_agent import UIUXAgent
from .ai_agent import AIAgent
from .tech_lead_agent import TechLeadAgent
from .sales_agent import SalesAgent
from .devops_agent import DevOpsAgent
from .qa_agent import QAAgent

class AgentRouter:
    def __init__(self):
        self.agents = {
            "database": DatabaseAgent(),
            "backend": BackendAgent(),
            "frontend": FrontendReactAgent(),
            "uiux": UIUXAgent(),
            "ai": AIAgent(),
            "techlead": TechLeadAgent(),
            "sales": SalesAgent(),
            "devops": DevOpsAgent(),
            "qa": QAAgent()
        }
        self.default_agent = "techlead"  # Agente padrão para mensagens gerais
        
    def route_message(self, message: str, context: Dict[str, Any] = None) -> str:
        """
        Direciona mensagem para o agente mais apropriado
        Retorna o nome do agente selecionado
        """
        message_lower = message.lower()
        context_str = context.get("context", "") if context else ""
        
        # Sistema de pontuação para encontrar melhor agente
        agent_scores = {}
        
        for agent_name, agent in self.agents.items():
            score = 0
            
            # Verificar keywords do agente
            for keyword in agent.get_keywords():
                if keyword in message_lower:
                    score += 2
                    
            # Verificar expertise
            for expertise in agent.expertise:
                if expertise.lower() in message_lower:
                    score += 1
                    
            # Bônus para agentes específicos baseado em contexto
            if "banco" in message_lower or "database" in message_lower:
                if agent_name == "database":
                    score += 5
            elif "backend" in message_lower or "api" in message_lower:
                if agent_name == "backend":
                    score += 5
            elif "frontend" in message_lower or "react" in message_lower:
                if agent_name == "frontend":
                    score += 5
            elif "design" in message_lower or "ui" in message_lower:
                if agent_name == "uiux":
                    score += 5
            elif "ia" in message_lower or "ai" in message_lower:
                if agent_name == "ai":
                    score += 5
            elif "negócio" in message_lower or "vendas" in message_lower:
                if agent_name == "sales":
                    score += 5
            elif "deploy" in message_lower or "infra" in message_lower:
                if agent_name == "devops":
                    score += 5
            elif "teste" in message_lower or "bug" in message_lower:
                if agent_name == "qa":
                    score += 5
            elif "estratégia" in message_lower or "futuro" in message_lower:
                if agent_name == "techlead":
                    score += 5
                    
            agent_scores[agent_name] = score
        
        # Encontrar agente com maior pontuação
        best_agent = max(agent_scores, key=agent_scores.get)
        
        # Se nenhum agente tiver pontuação suficiente, usar padrão
        if agent_scores[best_agent] == 0:
            best_agent = self.default_agent
            
        return best_agent
    
    async def process_message(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Processa mensagem usando o agente apropriado
        """
        try:
            # Direcionar para agente correto
            agent_name = self.route_message(message, context)
            agent = self.agents[agent_name]
            
            # Preparar contexto do projeto
            project_context = self._get_project_context(context)
            
            # Processar mensagem com o agente
            result = await agent.process_message(message, project_context)
            
            # Adicionar metadados do roteamento
            result["routing"] = {
                "selected_agent": agent_name,
                "confidence": self._calculate_confidence(message, agent_name),
                "alternatives": self._get_alternative_agents(message, agent_name),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            return {
                "resposta": f"Erro no roteamento: {str(e)}",
                "acao_executada": None,
                "agente": "router",
                "erro": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _get_project_context(self, context: Dict[str, Any] = None) -> str:
        """
        Constrói contexto do projeto para os agentes
        """
        base_context = """
PROJETO: Secretar.IA - Aplicativo de Gestão Pessoal com IA

STACK TÉCNICA:
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React Native + Expo
- IA: Grok API (chat por texto)
- Features: Autenticação, Eventos, Tarefas, Finanças, Hábitos, Chat IA

ESTÁGIO ATUAL:
- MVP funcional implementado
- Usuários em fase de testes
- Precisa escalar e otimizar
- Buscando monetização

DESAFIOS:
- Performance mobile
- Escalabilidade do backend
- Experiência do usuário
- Monetização e conversão
- Qualidade e testes
"""
        
        if context:
            base_context += f"\nCONTEXTO ADICIONAL:\n{context.get('context', '')}"
            
        return base_context
    
    def _calculate_confidence(self, message: str, agent_name: str) -> float:
        """
        Calcula confiança do roteamento (0.0 a 1.0)
        """
        agent = self.agents[agent_name]
        message_lower = message.lower()
        
        matches = 0
        total_keywords = len(agent.get_keywords())
        
        for keyword in agent.get_keywords():
            if keyword in message_lower:
                matches += 1
                
        if total_keywords == 0:
            return 0.5
            
        return min(matches / total_keywords, 1.0)
    
    def _get_alternative_agents(self, message: str, selected_agent: str) -> List[str]:
        """
        Retorna agentes alternativos com base na mensagem
        """
        alternatives = []
        message_lower = message.lower()
        
        for agent_name, agent in self.agents.items():
            if agent_name != selected_agent:
                for keyword in agent.get_keywords():
                    if keyword in message_lower:
                        alternatives.append(agent_name)
                        break
                        
        return alternatives[:3]  # Limitar a 3 alternativas
    
    def get_all_agents_info(self) -> Dict[str, Any]:
        """
        Retorna informações de todos os agentes disponíveis
        """
        return {
            "agents": {name: agent.get_agent_info() for name, agent in self.agents.items()},
            "default_agent": self.default_agent,
            "total_agents": len(self.agents)
        }

# Função principal para uso fácil
async def ask_agents(message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Interface principal para interagir com os agentes
    """
    router = AgentRouter()
    return await router.process_message(message, context)
