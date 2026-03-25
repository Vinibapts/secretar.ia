# -*- coding: utf-8 -*-
"""
Sistema de Treinamento da IA - Secretar.IA
Exemplos de treinamento em português para aprender comandos de voz
"""

TRAINING_EXAMPLES = {
    # AGENDA - MARCAÇÃO DE COMPROMISSOS
    "agenda_examples": [
        {
            "input": "marca uma reunião com o cliente amanhã às 14h",
            "intent": "create_event",
            "entities": {
                "titulo": "Reunião com cliente",
                "data_inicio": "amanhã 14:00",
                "tipo": "reunião"
            },
            "response": "Reunião marcada com sucesso para amanhã às 14h!"
        },
        {
            "input": "agende uma consulta médica dia 25 às 10 da manhã",
            "intent": "create_event",
            "entities": {
                "titulo": "Consulta médica",
                "data_inicio": "dia 25 10:00",
                "tipo": "consulta"
            },
            "response": "Consulta médica agendada para dia 25 às 10h!"
        },
        {
            "input": "tenho uma reunião importante sexta às 15h",
            "intent": "create_event",
            "entities": {
                "titulo": "Reunião importante",
                "data_inicio": "sexta 15:00",
                "tipo": "reunião"
            },
            "response": "Reunião importante marcada para sexta às 15h!"
        },
        {
            "input": "lembra de almoçar com o João hoje ao meio-dia",
            "intent": "create_event",
            "entities": {
                "titulo": "Almoço com João",
                "data_inicio": "hoje 12:00",
                "tipo": "almoço"
            },
            "response": "Almoço com João agendado para hoje ao meio-dia!"
        },
        {
            "input": "preciso ir ao banco segunda às 9h",
            "intent": "create_event",
            "entities": {
                "titulo": "Ir ao banco",
                "data_inicio": "segunda 09:00",
                "tipo": "banco"
            },
            "response": "Visita ao banco agendada para segunda às 9h!"
        }
    ],
    
    # FINANÇAS - REGISTRO DE TRANSAÇÕES
    "finances_examples": [
        {
            "input": "gastei 50 reais com Uber",
            "intent": "create_finance",
            "entities": {
                "valor": 50.00,
                "tipo": "gasto",
                "categoria": "transporte",
                "descricao": "Uber"
            },
            "response": "Gasto de R$ 50,00 com transporte (Uber) registrado!"
        },
        {
            "input": "recebi meu salário de 3000 reais",
            "intent": "create_finance",
            "entities": {
                "valor": 3000.00,
                "tipo": "receita",
                "categoria": "salário",
                "descricao": "Salário"
            },
            "response": "Receita de R$ 3.000,00 (salário) registrada!"
        },
        {
            "input": "paguei 120 reais de aluguel",
            "intent": "create_finance",
            "entities": {
                "valor": 120.00,
                "tipo": "gasto",
                "categoria": "moradia",
                "descricao": "Aluguel"
            },
            "response": "Gasto de R$ 120,00 com moradia (aluguel) registrado!"
        },
        {
            "input": "gastei 25 reais no mercado",
            "intent": "create_finance",
            "entities": {
                "valor": 25.00,
                "tipo": "gasto",
                "categoria": "alimentação",
                "descricao": "Mercado"
            },
            "response": "Gasto de R$ 25,00 com alimentação (mercado) registrado!"
        },
        {
            "input": "ganhei 200 reais de bico",
            "intent": "create_finance",
            "entities": {
                "valor": 200.00,
                "tipo": "receita",
                "categoria": "extra",
                "descricao": "Bico"
            },
            "response": "Receita de R$ 200,00 (extra) registrada!"
        }
    ],
    
    # HÁBITOS - REGISTRO DE ATIVIDADES
    "habits_examples": [
        {
            "input": "corri 30 minutos hoje",
            "intent": "create_habit",
            "entities": {
                "atividade": "corrida",
                "duracao": 30,
                "data": "hoje"
            },
            "response": "Corrida de 30 minutos registrada para hoje! Parabéns! 🏃‍♂️"
        },
        {
            "input": "estudei 2 horas inglês",
            "intent": "create_habit",
            "entities": {
                "atividade": "estudo",
                "duracao": 120,
                "categoria": "inglês",
                "data": "hoje"
            },
            "response": "Estudo de 2 horas de inglês registrado! Ótimo trabalho! 📚"
        },
        {
            "input": "fui à academia hoje por 1 hora",
            "intent": "create_habit",
            "entities": {
                "atividade": "academia",
                "duracao": 60,
                "data": "hoje"
            },
            "response": "Treino na academia de 1 hora registrado! 💪"
        },
        {
            "input": "li um livro por 45 minutos",
            "intent": "create_habit",
            "entities": {
                "atividade": "leitura",
                "duracao": 45,
                "data": "hoje"
            },
            "response": "Leitura de 45 minutos registrada! 📖"
        },
        {
            "input": "meditei 15 minutos",
            "intent": "create_habit",
            "entities": {
                "atividade": "meditação",
                "duracao": 15,
                "data": "hoje"
            },
            "response": "Meditação de 15 minutos registrada! 🧘‍♂️"
        }
    ],
    
    # RANKING - ATUALIZAÇÃO DE PONTOS
    "ranking_examples": [
        {
            "input": "completei todas as tarefas de hoje",
            "intent": "update_ranking",
            "entities": {
                "acao": "tarefas_concluidas",
                "pontos": 10
            },
            "response": "Parabéns! Você ganhou 10 pontos por completar todas as tarefas! 🎯"
        },
        {
            "input": "consegui focar por 4 horas seguidas",
            "intent": "update_ranking",
            "entities": {
                "acao": "foco",
                "pontos": 15
            },
            "response": "Excelente! 4 horas de foco renderam 15 pontos! 🔥"
        },
        {
            "input": "finalizei o projeto antes do prazo",
            "intent": "update_ranking",
            "entities": {
                "acao": "projeto_concluido",
                "pontos": 25
            },
            "response": "Incrível! Projeto concluído antes do prazo: +25 pontos! 🚀"
        }
    ],
    
    # CONFLITOS DE AGENDA - DETECÇÃO E RESOLUÇÃO
    "conflict_examples": [
        {
            "input": "marca uma reunião com o cliente amanhã às 14h",
            "context": {
                "existing_events": [
                    {"titulo": "Reunião com fornecedor", "data_inicio": "amanhã 14:00"}
                ]
            },
            "intent": "create_event_with_conflict",
            "response": "⚠️ Você já tem uma reunião marcada para amanhã às 14h: 'Reunião com fornecedor'. Deseja substituir ou marcar para outro horário?"
        },
        {
            "input": "agenda consulta médica dia 25 às 10",
            "context": {
                "existing_events": [
                    {"titulo": "Reunião de equipe", "data_inicio": "dia 25 10:00"}
                ]
            },
            "intent": "create_event_with_conflict",
            "response": "⚠️ Conflito detectado! Você já tem 'Reunião de equipe' marcada para dia 25 às 10h. Quer substituir ou escolher outro horário?"
        }
    ],
    
    # GÍRIAS E LINGUAGEM INFORMAL
    "slang_examples": [
        {
            "input": "bora marcar um rolê com a galera sexta à noite",
            "intent": "create_event",
            "entities": {
                "titulo": "Encontro com amigos",
                "data_inicio": "sexta 20:00",
                "tipo": "social"
            },
            "response": "Encontro com amigos marcado para sexta à noite! 🎉"
        },
        {
            "input": "gastei uma grana no shopping",
            "intent": "create_finance",
            "entities": {
                "valor": "não especificado",
                "tipo": "gasto",
                "categoria": "compras",
                "descricao": "Shopping"
            },
            "response": "Quanto você gastou no shopping? Posso registrar o valor."
        },
        {
            "input": "tô sem grana nenhuma",
            "intent": "check_balance",
            "entities": {},
            "response": "Vou verificar seu saldo atual. Um momento..."
        },
        {
            "input": "depois eu vejo isso",
            "intent": "postpone",
            "entities": {},
            "response": "Entendido! Posso te lembrar disso mais tarde."
        }
    ],
    
    # COMANDOS DE CONSULTA
    "query_examples": [
        {
            "input": "quais eventos eu tenho hoje?",
            "intent": "query_events",
            "entities": {
                "periodo": "hoje"
            },
            "response": "Verificando seus eventos para hoje..."
        },
        {
            "input": "quanto eu gastei este mês?",
            "intent": "query_finances",
            "entities": {
                "periodo": "mês",
                "tipo": "gastos"
            },
            "response": "Calculando seus gastos este mês..."
        },
        {
            "input": "como está meu ranking?",
            "intent": "query_ranking",
            "entities": {},
            "response": "Verificando sua posição no ranking..."
        },
        {
            "input": "quais hábitos eu completei esta semana?",
            "intent": "query_habits",
            "entities": {
                "periodo": "semana"
            },
            "response": "Verificando seus hábitos desta semana..."
        }
    ]
}

# CONTEXT PATTERNS - Para entender contexto do usuário
CONTEXT_PATTERNS = {
    "time_context": {
        "manhã": ["manhã", "cedo", "dia", "bom dia"],
        "tarde": ["tarde", "meio-dia", "boa tarde"],
        "noite": ["noite", "noitinha", "boa noite"],
        "amanhã": ["amanhã", "amanhã cedo", "amanhã de manhã"],
        "hoje": ["hoje", "hoje à noite", "hoje de manhã"],
        "semana": ["semana que vem", "próxima semana", "essa semana"]
    },
    "urgency_context": {
        "urgente": ["urgente", "importante", "prioridade", "rápido"],
        "normal": ["normal", "comum", "regular"],
        "baixa": ["depois", "mais tarde", "quando der"]
    }
}

# RESPONSE TEMPLATES - Respostas personalizadas
RESPONSE_TEMPLATES = {
    "success": [
        "✅ {action} com sucesso!",
        "🎉 {action}!",
        "👍 {action}!",
        "🚀 {action}!"
    ],
    "conflict": [
        "⚠️ {conflict_message}",
        "🚨 {conflict_message}",
        "❌ {conflict_message}"
    ],
    "clarification": [
        "🤔 {question}",
        "❓ {question}",
        "💭 {question}"
    ],
    "encouragement": [
        "💪 Parabéns! {message}",
        "🎯 Ótimo trabalho! {message}",
        "🌟 Excelente! {message}",
        "🔥 Incrível! {message}"
    ]
}

def get_training_examples():
    """Retorna todos os exemplos de treinamento"""
    return TRAINING_EXAMPLES

def get_context_patterns():
    """Retorna padrões de contexto"""
    return CONTEXT_PATTERNS

def get_response_templates():
    """Retorna templates de resposta"""
    return RESPONSE_TEMPLATES

def add_training_example(category, example):
    """Adiciona um novo exemplo de treinamento"""
    if category not in TRAINING_EXAMPLES:
        TRAINING_EXAMPLES[category] = []
    TRAINING_EXAMPLES[category].append(example)

def get_intent_from_input(user_input):
    """Analisa o input do usuário e retorna o intent provável"""
    user_input_lower = user_input.lower()
    
    # Palavras-chave para cada intent
    intent_keywords = {
        "create_event": ["marca", "agende", "agendar", "reunião", "consulta", "compromisso", "encontro"],
        "create_finance": ["gastei", "paguei", "gaste", "pague", "recebi", "ganhei", "comprei", "paguei"],
        "create_habit": ["corri", "estudei", "fui", "li", "meditei", "treinei"],
        "update_ranking": ["completei", "finalizei", "consegui", "terminei"],
        "query_events": ["quais eventos", "tenho eventos", "eventos hoje", "compromissos"],
        "query_finances": ["quanto gastei", "saldo", "gastos", "receitas", "finanças"],
        "query_habits": ["quais hábitos", "hábitos", "completei", "treinei"],
        "query_ranking": ["ranking", "pontos", "posição", "nível"]
    }
    
    for intent, keywords in intent_keywords.items():
        if any(keyword in user_input_lower for keyword in keywords):
            return intent
    
    return "unknown"

def extract_entities(user_input, intent):
    """Extrai entidades do input do usuário"""
    entities = {}
    user_input_lower = user_input.lower()
    
    if intent == "create_event":
        # Extrair título
        if "reunião" in user_input_lower:
            entities["tipo"] = "reunião"
        elif "consulta" in user_input_lower:
            entities["tipo"] = "consulta"
        elif "almoço" in user_input_lower:
            entities["tipo"] = "almoço"
        
        # Extrair data/hora
        if "amanhã" in user_input_lower:
            entities["data_inicio"] = "amanhã"
        elif "hoje" in user_input_lower:
            entities["data_inicio"] = "hoje"
        elif "sexta" in user_input_lower:
            entities["data_inicio"] = "sexta"
        elif "segunda" in user_input_lower:
            entities["data_inicio"] = "segunda"
        
        # Extrair hora
        import re
        horas = re.findall(r'(\d{1,2})h', user_input_lower)
        if horas:
            entities["hora"] = horas[0]
        
    elif intent == "create_finance":
        # Extrair valor
        import re
        valores = re.findall(r'(\d+\.?\d*)\s*reais?', user_input_lower)
        if valores:
            entities["valor"] = float(valores[0].replace('.', ''))
        
        # Extrair tipo
        if "gastei" in user_input_lower or "paguei" in user_input_lower:
            entities["tipo"] = "gasto"
        elif "recebi" in user_input_lower or "ganhei" in user_input_lower:
            entities["tipo"] = "receita"
        
        # Extrair categoria
        if "uber" in user_input_lower or "transporte" in user_input_lower:
            entities["categoria"] = "transporte"
        elif "salário" in user_input_lower:
            entities["categoria"] = "salário"
        elif "aluguel" in user_input_lower:
            entities["categoria"] = "moradia"
        elif "mercado" in user_input_lower:
            entities["categoria"] = "alimentação"
    
    return entities
