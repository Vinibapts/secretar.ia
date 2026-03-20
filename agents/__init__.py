"""
Sistema de Agentes Especializados para Secretar.IA
"""

from .database_agent import DatabaseAgent
from .backend_agent import BackendAgent
from .frontend_react_agent import FrontendReactAgent
from .ui_ux_agent import UIUXAgent
from .ai_agent import AIAgent
from .tech_lead_agent import TechLeadAgent
from .sales_agent import SalesAgent
from .devops_agent import DevOpsAgent
from .qa_agent import QAAgent
from .agent_router import AgentRouter

__all__ = [
    "DatabaseAgent",
    "BackendAgent", 
    "FrontendReactAgent",
    "UIUXAgent",
    "AIAgent",
    "TechLeadAgent",
    "SalesAgent",
    "DevOpsAgent",
    "QAAgent",
    "AgentRouter"
]
