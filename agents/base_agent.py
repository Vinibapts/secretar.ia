"""
Classe Base para todos os Agentes Especializados
"""
import httpx
import os
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    def __init__(self, name: str, description: str, expertise: List[str]):
        self.name = name
        self.description = description
        self.expertise = expertise
        self.api_key = os.getenv("GROQ_API_KEY")
        self.created_at = datetime.now()
        
    def can_handle(self, message: str, context: Dict[str, Any] = None) -> bool:
        """Verifica se este agente pode processar a mensagem"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.get_keywords())
    
    def get_keywords(self) -> List[str]:
        """Retorna palavras-chave que este agente atende"""
        return []
    
    def get_system_prompt(self, context: str = "") -> str:
        """Retorna o prompt específico para este agente"""
        return f"""Você é {self.name}, especialista em {', '.join(self.expertise)}.
Responda sempre em português brasileiro.
Seja profissional, direto e prático.
Forneça soluções implementáveis e orientações claras."""
    
    async def process_message(self, message: str, context: str = "") -> Dict[str, Any]:
        """Processa a mensagem usando a API do Groq"""
        if not self.api_key or self.api_key == "sua_chave_aqui":
            return {
                "resposta": f"Agente {self.name} ainda não configurado. Configure a chave do Groq no .env",
                "acao_executada": None,
                "agente": self.name,
                "expertise": self.expertise,
                "timestamp": datetime.now().isoformat()
            }
        
        system_prompt = self.get_system_prompt(context)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message}
                        ],
                        "model": "llama-3.3-70b-versatile",
                        "stream": False,
                        "temperature": 0.7,
                        "max_tokens": 2000
                    },
                    timeout=30.0
                )
                
                data = response.json()
                if "choices" not in data:
                    raise Exception(f"Erro na API: {data}")
                
                resposta = data["choices"][0]["message"]["content"]
                
                return {
                    "resposta": resposta,
                    "acao_executada": None,
                    "agente": self.name,
                    "expertise": self.expertise,
                    "timestamp": datetime.now().isoformat(),
                    "tokens_usados": data.get("usage", {}).get("total_tokens", 0)
                }
                
        except Exception as e:
            return {
                "resposta": f"Erro no agente {self.name}: {str(e)}",
                "acao_executada": None,
                "agente": self.name,
                "expertise": self.expertise,
                "timestamp": datetime.now().isoformat(),
                "erro": str(e)
            }
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Retorna informações do agente"""
        return {
            "name": self.name,
            "description": self.description,
            "expertise": self.expertise,
            "created_at": self.created_at.isoformat(),
            "keywords": self.get_keywords()
        }
