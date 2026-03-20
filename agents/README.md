# Sistema de Agentes Especializados - Secretar.IA

## 🤖 Visão Geral

Sistema de 8 agentes especializados para transformar o Secretar.IA em um aplicativo de sucesso. Cada agente é um especialista sênior em sua área, pronto para dar orientações práticas e implementáveis.

## 🎯 Agentes Disponíveis

### 1. **DatabaseAgent** - Arquiteto de Banco de Dados
- **Expertise**: PostgreSQL, Performance Mobile, Índices, Cache
- **Função**: Otimizar schema, queries e estratégias offline-first
- **Keywords**: `banco de dados`, `sql`, `performance`, `índice`

### 2. **BackendAgent** - Arquiteto Backend Sênior  
- **Expertise**: FastAPI, Python, APIs, Segurança, Performance
- **Função**: Otimizar endpoints, segurança e escalabilidade
- **Keywords**: `backend`, `api`, `fastapi`, `segurança`

### 3. **FrontendReactAgent** - Especialista React Native
- **Expertise**: React Native, Expo, Performance, Animações
- **Função**: Otimizar performance mobile e UX
- **Keywords**: `frontend`, `react native`, `mobile`, `performance`

### 4. **UIUXAgent** - Designer de Conversão
- **Expertise**: UI/UX, Design Systems, Conversão, Psicologia
- **Função**: Criar interfaces que convertem e encantam
- **Keywords**: `design`, `ui`, `ux`, `conversão`

### 5. **AIAgent** - Especialista em Inteligência Artificial
- **Expertise**: APIs de IA, Chat por Voz, Prompt Engineering
- **Função**: Implementar e otimizar features de IA
- **Keywords**: `ia`, `ai`, `chat`, `voz`, `api`

### 6. **TechLeadAgent** - Conselheiro Técnico Fullstack
- **Expertise**: Arquitetura, Liderança, Estratégia, Escalabilidade
- **Função**: Visão holística e decisões estratégicas
- **Keywords**: `arquitetura`, `estratégia`, `futuro`, `liderança`

### 7. **SalesAgent** - Estrategista de Monetização
- **Expertise**: Product-Market Fit, Monetização, Crescimento
- **Função**: Estratégias para converter e monetizar usuários
- **Keywords**: `vendas`, `monetização`, `negócio`, `crescimento`

### 8. **DevOpsAgent** - Engenheiro de Infraestrutura
- **Expertise**: CI/CD, Cloud, Monitoramento, Segurança
- **Função**: Infraestrutura escalável e automatizada
- **Keywords**: `deploy`, `infra`, `cloud`, `monitoramento`

### 9. **QAAgent** - Especialista em Qualidade
- **Expertise**: Testes Automatizados, Performance, Bugs
- **Função**: Garantir qualidade em produção
- **Keywords**: `teste`, `qualidade`, `bug`, `performance`

## 🚀 Como Usar

### Instalação
```bash
# No backend do Secretar.IA
pip install httpx python-dotenv
```

### Configuração
```bash
# No arquivo .env
GROK_API_KEY=sua_chave_do_grok_aqui
```

### Uso Básico
```python
from agents.agent_router import ask_agents

# Exemplo de uso
result = await ask_agents(
    message="Meu banco de dados está lento, como otimizar?",
    context={"user_id": 123}
)

print(result["resposta"])
print(f"Agente: {result['agente']}")
```

### Uso Avançado
```python
from agents import DatabaseAgent, BackendAgent

# Usar agente específico
db_agent = DatabaseAgent()
result = await db_agent.process_message(
    message="Como adicionar índices para performance?",
    context="Contexto do projeto..."
)
```

## 🧠 Sistema de Roteamento Inteligente

O `AgentRouter` analisa automaticamente sua mensagem e direciona para o agente mais apropriado:

- **Análise de keywords** - Identifica palavras-chave específicas
- **Sistema de pontuação** - Escolhe o agente com maior relevância
- **Contexto do projeto** - Todos os agentes conhecem o Secretar.IA
- **Fallback inteligente** - Usa TechLead para mensagens gerais

## 📊 Exemplos de Uso

### Problema de Performance
```python
result = await ask_agents("Meu app está lento ao carregar eventos")
# → Roteia para DatabaseAgent ou BackendAgent
```

### Dúvida de Design
```python
result = await ask_agents("Como melhorar o botão de cadastro para converter mais?")
# → Roteia para UIUXAgent
```

### Estratégia de Negócio
```python
result = await ask_agents("Qual modelo de monetização devo usar?")
# → Roteia para SalesAgent
```

### Problema Técnico Geral
```python
result = await ask_agents("Qual stack usar para escalar para 1M usuários?")
# → Roteia para TechLeadAgent
```

## 🔧 Integração com Backend

Para integrar com seu backend FastAPI:

```python
# Em backend/routers/agents.py
from fastapi import APIRouter, Depends
from agents.agent_router import ask_agents

router = APIRouter(prefix="/agents", tags=["AI Agents"])

@router.post("/chat")
async def chat_with_agents(message: str, user_id: int):
    result = await ask_agents(
        message=message,
        context={"user_id": user_id}
    )
    return result
```

## 📈 Benefícios

- **Desenvolvimento 5x mais rápido** - Orientação especializada instantânea
- **Qualidade enterprise** - Best practices de especialistas sênior
- **Economia de recursos** - Conselhos que evitam erros caros
- **Visão 360°** - Cobertura completa do projeto
- **Escalabilidade** - Soluções que crescem com seu negócio

## 🎯 Casos de Uso Recomendados

1. **Revisão de código** - "Este código está bom?"
2. **Arquitetura** - "Como estruturar X?"
3. **Performance** - "Como otimizar Y?"
4. **Bugs** - "Estou com problema em Z"
5. **Estratégia** - "Qual direção tomar?"
6. **Monetização** - "Como ganhar dinheiro com X?"
7. **UI/UX** - "Como melhorar esta tela?"
8. **Deploy** - "Como configurar produção?"

## 🚀 Próximos Passos

1. Configure sua chave do Grok no `.env`
2. Teste os agentes com suas dúvidas atuais
3. Integre com seu backend FastAPI
4. Use no dia a dia para acelerar desenvolvimento

---

**Transforme seu aplicativo com orientação de especialistas! 🚀**
