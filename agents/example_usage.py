"""
Exemplos de Uso dos Agentes Especializados do Secretar.IA
"""
import asyncio
from agents.agent_router import ask_agents
from agents import DatabaseAgent, BackendAgent, UIUXAgent, SalesAgent

async def main():
    print("🤖 Sistema de Agentes Especializados - Secretar.IA\n")
    
    # Exemplo 1: Problema de Banco de Dados
    print("=" * 50)
    print("📊 Exemplo 1: Problema de Performance no Banco")
    print("=" * 50)
    
    result1 = await ask_agents(
        message="Minhas queries de eventos estão muito lentas no mobile, como otimizar?",
        context={"user_id": 123, "issue": "performance"}
    )
    
    print(f"Agente selecionado: {result1['agente']}")
    print(f"Confiança: {result1['routing']['confidence']:.2f}")
    print(f"Resposta: {result1['resposta'][:200]}...")
    print()
    
    # Exemplo 2: Duvida de UI/UX
    print("=" * 50)
    print("🎨 Exemplo 2: Melhoria de Conversão")
    print("=" * 50)
    
    result2 = await ask_agents(
        message="Minha tela de cadastro tem 60% de abandono, como melhorar?",
        context={"user_id": 123, "metric": "conversion_rate"}
    )
    
    print(f"Agente selecionado: {result2['agente']}")
    print(f"Resposta: {result2['resposta'][:200]}...")
    print()
    
    # Exemplo 3: Estratégia de Monetização
    print("=" * 50)
    print("💰 Exemplo 3: Modelo de Negócio")
    print("=" * 50)
    
    result3 = await ask_agents(
        message="Quero monetizar meu app, qual modelo usar: freemium ou assinatura?",
        context={"user_id": 123, "goal": "monetization"}
    )
    
    print(f"Agente selecionado: {result3['agente']}")
    print(f"Resposta: {result3['resposta'][:200]}...")
    print()
    
    # Exemplo 4: Problema Técnico Geral
    print("=" * 50)
    print("🔧 Exemplo 4: Arquitetura e Escala")
    print("=" * 50)
    
    result4 = await ask_agents(
        message="Como preparar meu app para 1 milhão de usuários?",
        context={"user_id": 123, "scale": "million_users"}
    )
    
    print(f"Agente selecionado: {result4['agente']}")
    print(f"Alternativas: {result4['routing']['alternatives']}")
    print(f"Resposta: {result4['resposta'][:200]}...")
    print()
    
    # Exemplo 5: Usando Agente Específico
    print("=" * 50)
    print("🎯 Exemplo 5: Agente Específico - Database")
    print("=" * 50)
    
    db_agent = DatabaseAgent()
    result5 = await db_agent.process_message(
        message="Que índices devo adicionar na tabela de eventos?",
        context="App tem 10k usuários com média de 50 eventos por usuário"
    )
    
    print(f"Agente: {result5['agente']}")
    print(f"Expertise: {', '.join(result5['expertise'])}")
    print(f"Resposta: {result5['resposta'][:200]}...")
    print()

async def test_all_agents():
    """Testa todos os agentes com uma mensagem específica"""
    from agents.agent_router import AgentRouter
    
    router = AgentRouter()
    
    print("🧪 Testando todos os agentes...")
    print("=" * 50)
    
    test_messages = [
        ("database", "Como otimizar queries PostgreSQL para mobile?"),
        ("backend", "Qual melhor estratégia de cache para APIs?"),
        ("frontend", "Como otimizar performance de lists no React Native?"),
        ("uiux", "Quais cores usar para transmitir confiança?"),
        ("ai", "Qual API de IA tem melhor custo-benefício?"),
        ("techlead", "Devo migrar para microserviços?"),
        ("sales", "Como precificar features premium?"),
        ("devops", "Qual cloud provider para startup?"),
        ("qa", "Como implementar testes E2E em mobile?")
    ]
    
    for agent_type, message in test_messages:
        result = await ask_agents(message)
        print(f"{agent_type.upper():10} → {result['agente']:15} ✓")
    
    print("\n✅ Todos os agentes testados com sucesso!")

if __name__ == "__main__":
    print("Iniciando demonstração dos agentes...\n")
    
    # Rodar exemplos
    asyncio.run(main())
    
    print("\n" + "=" * 50)
    print("🚀 Para testar todos os agentes, execute:")
    print("python -c \"import asyncio; from example_usage import test_all_agents; asyncio.run(test_all_agents())\"")
    print("=" * 50)
