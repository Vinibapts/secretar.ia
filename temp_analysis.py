import asyncio
import sys
sys.path.append('.')
from agents.agent_router import ask_agents

async def analyze_with_agents():
    print('🔍 ANALISANDO COM OS AGENTES ENTERPRISE...')
    print()
    
    # 1. Problema do Dark/Light Mode - UIUXAgent
    print('📱 1. ANALISANDO PROBLEMA DARK/LIGHT MODE...')
    result1 = await ask_agents(
        'Meu app React Native não está detectando corretamente o modo do iPhone. useColorScheme() retorna dark mas o dispositivo está em light mode. Quero que siga automaticamente o modo do dispositivo e também tenha opção manual de troca. Como corrigir isso?',
        context={'feature': 'theme_detection', 'platform': 'react_native', 'problem': 'color_scheme_bug'}
    )
    print(f'Agente: {result1["agente"]}')
    print(f'Resposta: {result1["resposta"][:300]}...')
    print()
    
    # 2. Treinamento da IA - AIAgent  
    print('🤖 2. ANALISANDO SISTEMA DE TREINAMENTO DA IA...')
    result2 = await ask_agents(
        'Preciso criar um sistema de treinamento para IA em português que aprenda exemplos como "marca reunião com cliente amanhã às 14h", detecte conflitos de agenda automaticamente, entenda qualquer gíria, e integre com agenda, finanças, hábitos e ranking. Como estruturar isso?',
        context={'feature': 'ai_training', 'language': 'portuguese', 'integration': 'full_app'}
    )
    print(f'Agente: {result2["agente"]}')
    print(f'Resposta: {result2["resposta"][:300]}...')
    print()
    
    # 3. README.md Completo - TechLeadAgent
    print('📚 3. ANALISANDO ESTRUTURA DO README.MD...')
    result3 = await ask_agents(
        'Preciso criar um README.md completo para o Secretar.IA descrevendo todas as funcionalidades (agenda, finanças, hábitos, IA, ranking), objetivos do projeto, arquitetura, como usar, e exemplos práticos. Como estruturar isso?',
        context={'document': 'readme', 'scope': 'full_project_documentation'}
    )
    print(f'Agente: {result3["agente"]}')
    print(f'Resposta: {result3["resposta"][:300]}...')
    print()

if __name__ == "__main__":
    asyncio.run(analyze_with_agents())
