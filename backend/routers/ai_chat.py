from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, Event, Notification, Finance, Habit, TipoFinanceiroEnum
from schemas.schemas import ChatMessage, ChatResponse
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from datetime import datetime, timedelta
from routers.ranking import adicionar_pontos
import httpx
import os
import re
import tempfile

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chat"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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

def get_contexto_usuario(user_id: int, db: Session):
    eventos = db.query(Event).filter(Event.user_id == user_id).all()
    financas = db.query(Finance).filter(Finance.user_id == user_id).all()
    habitos = db.query(Habit).filter(Habit.user_id == user_id).all()
    agora = datetime.now()

    contexto = f"Data atual: {agora.strftime('%d/%m/%Y %H:%M')} ({['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'][agora.weekday()]})\n"

    if eventos:
        contexto += "\nEventos na agenda:\n"
        for e in eventos:
            contexto += f"- [{e.id}] {e.titulo} em {e.data_inicio.strftime('%d/%m/%Y %H:%M')}\n"
    else:
        contexto += "\nNenhum evento na agenda.\n"

    if financas:
        total_receitas = sum(f.valor for f in financas if f.tipo == TipoFinanceiroEnum.receita)
        total_gastos = sum(f.valor for f in financas if f.tipo == TipoFinanceiroEnum.gasto)
        contexto += f"\nFinanças: Receitas R${total_receitas:.2f} | Gastos R${total_gastos:.2f} | Saldo R${total_receitas - total_gastos:.2f}\n"
    else:
        contexto += "\nNenhuma finança registrada.\n"

    if habitos:
        contexto += "\nHábitos:\n"
        for h in habitos:
            contexto += f"- [{h.id}] {h.nome} ({h.frequencia})\n"
    else:
        contexto += "\nNenhum hábito cadastrado.\n"

    return contexto

def interpretar_data(data_str: str, hora_str: str) -> datetime:
    agora = datetime.now()
    data_str = data_str.lower().strip()

    meses = {
        'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3,
        'abril': 4, 'maio': 5, 'junho': 6,
        'julho': 7, 'agosto': 8, 'setembro': 9,
        'outubro': 10, 'novembro': 11, 'dezembro': 12
    }

    base = None

    try:
        if re.match(r'\d{2}/\d{2}/\d{4}', data_str):
            base = datetime.strptime(data_str[:10], '%d/%m/%Y')
        elif re.match(r'\d{2}/\d{2}', data_str):
            partes = data_str.split('/')
            dia, mes = int(partes[0]), int(partes[1])
            ano = agora.year
            try:
                data_tentativa = datetime(ano, mes, dia)
                if data_tentativa.date() < agora.date():
                    ano += 1
                base = datetime(ano, mes, dia)
            except:
                base = agora
    except:
        pass

    if base is None:
        for nome_mes, num_mes in meses.items():
            if nome_mes in data_str:
                numeros = re.findall(r'\d+', data_str)
                ano = agora.year
                if numeros:
                    anos = [int(n) for n in numeros if len(n) == 4]
                    dias = [int(n) for n in numeros if len(n) <= 2]
                    if anos:
                        ano = anos[0]
                    dia = dias[0] if dias else 1
                else:
                    dia = 1

                try:
                    data_tentativa = datetime(ano, num_mes, dia)
                    if not any(len(n) == 4 for n in re.findall(r'\d+', data_str)):
                        if data_tentativa.date() < agora.date():
                            ano += 1
                            data_tentativa = datetime(ano, num_mes, dia)
                    base = data_tentativa
                except:
                    base = agora
                break

    if base is None:
        if data_str in ['hoje', 'today']:
            base = agora
        elif data_str in ['amanhã', 'amanha']:
            base = agora + timedelta(days=1)
        elif 'depois de amanhã' in data_str or 'depois de amanha' in data_str:
            base = agora + timedelta(days=2)
        elif 'semana que vem' in data_str:
            base = agora + timedelta(weeks=1)
        elif 'próximo mês' in data_str or 'proximo mes' in data_str:
            base = agora + timedelta(days=30)
        elif 'segunda' in data_str:
            dias = (0 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        elif 'terça' in data_str or 'terca' in data_str:
            dias = (1 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        elif 'quarta' in data_str:
            dias = (2 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        elif 'quinta' in data_str:
            dias = (3 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        elif 'sexta' in data_str:
            dias = (4 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        elif 'sábado' in data_str or 'sabado' in data_str:
            dias = (5 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        elif 'domingo' in data_str:
            dias = (6 - agora.weekday()) % 7 or 7
            base = agora + timedelta(days=dias)
        else:
            base = agora

    try:
        hora_str = hora_str.replace('h', ':').replace('H', ':')
        if ':' in hora_str:
            partes = hora_str.split(':')
            h = partes[0].strip()
            m = partes[1].strip() if len(partes) > 1 else '0'
        else:
            h, m = hora_str.strip(), '0'
        base = base.replace(hour=int(h), minute=int(m), second=0, microsecond=0)
    except:
        base = base.replace(hour=12, minute=0, second=0, microsecond=0)

    return base

async def criar_evento(parametros: dict, user: User, db: Session, forcar_criacao: bool = False):
    titulo = parametros.get("titulo", "Novo evento")
    data = parametros.get("data", "hoje")
    hora = parametros.get("hora", "12:00")
    local = parametros.get("local", "")

    data_evento = interpretar_data(data, hora)
    descricao = local if local else ""

    # 🔍 VERIFICAR EVENTOS EXISTENTES NO EXATAMENTE MESMO DIA E HORÁRIO
    eventos_conflitantes = db.query(Event).filter(
        Event.user_id == user.id,
        Event.data_inicio >= data_evento.replace(minute=0, second=0, microsecond=0),
        Event.data_inicio < data_evento.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    ).all()

    # 🎯 CRIAR EVENTO NOVO DIRETO - SEM BLOQUEAR
    novo = Event(
        user_id=user.id,
        titulo=titulo,
        descricao=descricao,
        data_inicio=data_evento,
        data_fim=data_evento + timedelta(hours=1)
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)

    notif_horario = data_evento.replace(hour=8, minute=0, second=0, microsecond=0)
    if notif_horario <= datetime.now():
        notif_horario = datetime.now() + timedelta(hours=1)

    notif = Notification(
        user_id=user.id,
        mensagem=f"Lembrete: {titulo} hoje às {hora}" + (f" em {local}" if local else ""),
        canal="push",
        enviado=False,
        enviado_em=notif_horario
    )
    db.add(notif)
    db.commit()

    try:
        adicionar_pontos(user.id, 10, "Criou evento pela IA", db)
    except Exception as e:
        print(f"Erro ao adicionar pontos (evento): {e}")

    data_fmt = data_evento.strftime('%d/%m/%Y')
    hora_fmt = data_evento.strftime('%H:%M')
    local_fmt = f" em {local}" if local else ""
    
    # 📢 MONTAR MENSAGEM CORRETA
    mensagem_base = f"Agendado! Evento '{titulo}' Criado para Dia {data_fmt} às {hora_fmt}{local_fmt}."
    
    # 📢 ADICIONAR AVISO APENAS SE TIVER CONFLITO EXATO (MESMO HORÁRIO)
    if eventos_conflitantes:
        eventos_nomes = [f"'{e.titulo}'" for e in eventos_conflitantes]
        if len(eventos_nomes) == 1:
            aviso = f"\n⚠️ Lembrando que você já tem uma reunião nesse mesmo horário em {eventos_nomes[0]}"
        else:
            aviso = f"\n⚠️ Lembrando que você já tem reuniões nesse mesmo horário em {', '.join(eventos_nomes[:-1])} e {eventos_nomes[-1]}"
        mensagem_final = mensagem_base + aviso
    else:
        mensagem_final = mensagem_base
    
    return {
        "sucesso": True,
        "mensagem": mensagem_final,
        "id": novo.id,
        "data_evento": str(data_evento),
        "conflito": len(eventos_conflitantes) > 0
    }

async def criar_financa(parametros: dict, user: User, db: Session):
    try:
        valor_str = parametros.get("valor", "0").replace(",", ".").replace("r$", "").replace("R$", "").strip()
        valor = float(valor_str)
    except:
        valor = 0.0

    tipo_str = parametros.get("tipo", "gasto").lower().strip()
    if tipo_str not in ["gasto", "receita"]:
        tipo_str = "gasto"
    tipo = TipoFinanceiroEnum(tipo_str)

    categoria = parametros.get("categoria", "Geral")
    descricao = parametros.get("descricao", "")

    nova = Finance(
        user_id=user.id,
        valor=valor,
        tipo=tipo,
        categoria=categoria,
        descricao=descricao,
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)

    try:
        adicionar_pontos(user.id, 5, "Registrou finança pela IA", db)
    except Exception as e:
        print(f"Erro ao adicionar pontos (finança): {e}")

    return {
        "sucesso": True,
        "mensagem": f"{'Receita' if tipo_str == 'receita' else 'Gasto'} de R$ {valor:.2f} registrado em {categoria}",
        "id": nova.id
    }

async def criar_habito(parametros: dict, user: User, db: Session):
    nome = parametros.get("nome", "Novo hábito")
    frequencia = parametros.get("frequencia", "diario").lower().strip()
    if frequencia not in ["diario", "semanal", "mensal"]:
        frequencia = "diario"

    novo = Habit(
        user_id=user.id,
        nome=nome,
        frequencia=frequencia
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)

    try:
        adicionar_pontos(user.id, 15, "Criou hábito pela IA", db)
    except Exception as e:
        print(f"Erro ao adicionar pontos (hábito): {e}")

    return {
        "sucesso": True,
        "mensagem": f"Hábito '{nome}' criado com frequência {frequencia}",
        "id": novo.id
    }

async def processar_mensagem(texto: str, current_user: User, db: Session):
    contexto = get_contexto_usuario(current_user.id, db)
    agora = datetime.now()

    system_prompt = f"""Você é o Secretar.IA, secretário pessoal inteligente e proativo.
Data e hora atual: {agora.strftime('%d/%m/%Y %H:%M')} ({['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'][agora.weekday()]})
Responda sempre em português brasileiro de forma curta e informal.

{contexto}

REGRAS IMPORTANTES:
- **NUNCA VERIFIQUE CONFLITOS** - Sempre agende diretamente
- **OBRIGATÓRIO**: Use a tag [ACAO] para TODA ação solicitada
- **NUNCA responda apenas com texto** quando o usuário pedir para criar algo
- **NUNCA mencione outros eventos** ou horários existentes
- **SEMPRE CRIE** o evento solicitado, sem exceções

AÇÕES DISPONÍVEIS:

1. CRIAR EVENTO NA AGENDA:
[ACAO]create_event|titulo:TITULO|data:DATA|hora:HORA|local:LOCAL[/ACAO]

COMO PASSAR DATAS:
- Datas relativas: hoje, amanhã, depois de amanhã, semana que vem
- Dias da semana: próxima segunda, próxima terça, próxima quarta, próxima quinta, próxima sexta, próximo sábado, próximo domingo
- Datas com mês por extenso: 16 de setembro, 25 de dezembro, 10 de março
- Datas com ano: 16 de setembro de 2026, 25 de dezembro de 2027
- NUNCA use "hoje" quando o usuário mencionar um mês específico!

HORA deve ser no formato: 08:00, 14:00, 09:30, 20:00

Exemplos:
- "Reunião 14h amanhã na Memphis Films" → [ACAO]create_event|titulo:Reunião|data:amanhã|hora:14:00|local:Memphis Films[/ACAO]
- "Aniversário 16 de setembro às 8h" → [ACAO]create_event|titulo:Aniversário|data:16 de setembro|hora:08:00|local:[/ACAO]
- "Natal 25 de dezembro às 20h em casa" → [ACAO]create_event|titulo:Natal|data:25 de dezembro|hora:20:00|local:casa[/ACAO]
- "Consulta médica sexta às 10h" → [ACAO]create_event|titulo:Consulta médica|data:próxima sexta|hora:10:00|local:[/ACAO]
- "Academia hoje às 7h" → [ACAO]create_event|titulo:Academia|data:hoje|hora:07:00|local:[/ACAO]
- "Viagem dia 10 de julho" → [ACAO]create_event|titulo:Viagem|data:10 de julho|hora:12:00|local:[/ACAO]

**REGRA FINAL: SEMPRE CRIE O EVENTO, SEM VERIFICAR NADA!**

2. REGISTRAR FINANÇA:
[ACAO]create_finance|valor:VALOR|tipo:gasto_ou_receita|categoria:CATEGORIA|descricao:DESCRICAO[/ACAO]

Palavras que indicam GASTO: gastei, paguei, comprei, custou, saiu, torrei, acabei gastando, fui no mercado, comi fora
Palavras que indicam RECEITA: recebi, entrou, ganhei, caiu na conta, faturei, me pagaram, caiu o salário, ganhei

Categorias: Alimentação, Transporte, Saúde, Lazer, Vestuário, Moradia, Salário, Freelance, Receita, Geral

Exemplos:
- "gastei 3 reais no padeiro" → [ACAO]create_finance|valor:3|tipo:gasto|categoria:Alimentação|descricao:Padeiro[/ACAO]
- "acabei de gastar 200 com besteiras" → [ACAO]create_finance|valor:200|tipo:gasto|categoria:Lazer|descricao:Besteiras[/ACAO]
- "paguei 50 de uber" → [ACAO]create_finance|valor:50|tipo:gasto|categoria:Transporte|descricao:Uber[/ACAO]
- "entrou 20 reais" → [ACAO]create_finance|valor:20|tipo:receita|categoria:Receita|descricao:Entrada[/ACAO]
- "recebi 1000 de salário" → [ACAO]create_finance|valor:1000|tipo:receita|categoria:Salário|descricao:Salário mensal[/ACAO]
- "caiu 500 na conta" → [ACAO]create_finance|valor:500|tipo:receita|categoria:Receita|descricao:Entrada[/ACAO]
- "ganhei 300 de freela" → [ACAO]create_habit|nome:Beber água|frequencia:diario[/ACAO]
- "ganhei 200 reais da Batistella Projetos" → [ACAO]create_finance|valor:200|tipo:receita|categoria:Freelance|descricao:Batistella Projetos[/ACAO]

3. CRIAR HÁBITO:
[ACAO]create_habit|nome:NOME|frequencia:diario_ou_semanal_ou_mensal[/ACAO]

Exemplos:
- "quero criar hábito de beber água" → [ACAO]create_habit|nome:Beber água|frequencia:diario[/ACAO]
- "academia 3x por semana" → [ACAO]create_habit|nome:Academia|frequencia:semanal[/ACAO]"""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}"
            },
            json={
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": texto}
                ],
                "model": "llama-3.3-70b-versatile",
                "stream": False,
                "temperature": 0.1
            },
            timeout=30.0
        )
        data = response.json()
        print("RESPOSTA GROQ:", data)

        if "choices" not in data:
            raise HTTPException(status_code=500, detail=f"Erro Groq: {data}")

        resposta = data["choices"][0]["message"]["content"]

        acoes = re.findall(r'\[ACAO\](.*?)\[/ACAO\]', resposta, re.DOTALL)
        mensagens_sucesso = []
        acao_executada = None

        # 🔍 VERIFICAR SE HÁ CONFLITO NA RESPOSTA DA IA (mesmo sem [ACAO])
        if "conflito" in resposta.lower() or "deseja confirmar" in resposta.lower():
            # Extrair dados do conflito da resposta
            conflito_match = re.search(r'já tem [\'"]([^\'"]+)[\'"] às (\d{2}:\d{2})', resposta, re.IGNORECASE)
            if conflito_match:
                titulo_conflito = conflito_match.group(1)
                hora_conflito = conflito_match.group(2)
                
                # Tentar extrair dados do evento solicitado
                evento_match = re.search(r'criar ([\'"]?[^\'"]+[\'"]?)', resposta, re.IGNORECASE)
                titulo_solicitado = evento_match.group(1).replace("'", '"').strip('"') if evento_match else "Evento"
                
                # Criar dados pendentes simulados
                acao_executada = {
                    "sucesso": False,
                    "conflito": True,
                    "evento_conflito": {
                        "titulo": titulo_conflito,
                        "hora": hora_conflito
                    },
                    "dados_pendentes": {
                        "titulo": titulo_solicitado,
                        "data": "hoje",
                        "hora": hora_conflito,  # Assumindo mesmo horário para simplificar
                        "local": ""
                    }
                }

        for acao_content in acoes:
            partes = acao_content.split('|')
            action_type = partes[0].strip()
            parametros = {}
            for parte in partes[1:]:
                if ':' in parte:
                    k, v = parte.split(':', 1)
                    parametros[k.strip()] = v.strip()

            if action_type == "create_event":
                resultado = await criar_evento(parametros, current_user, db)
            elif action_type == "create_finance":
                resultado = await criar_financa(parametros, current_user, db)
            elif action_type == "create_habit":
                resultado = await criar_habito(parametros, current_user, db)
            else:
                resultado = {"sucesso": False, "mensagem": "Ação não reconhecida"}

            acao_executada = resultado
            if resultado.get("sucesso"):
                mensagens_sucesso.append(resultado.get("mensagem", ""))

        resposta = re.sub(r'\[ACAO\].*?\[/ACAO\]', '', resposta, flags=re.DOTALL).strip()
        if mensagens_sucesso:
            resposta = "Feito! " + " | ".join(mensagens_sucesso)

        return resposta, acao_executada

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not GROQ_API_KEY or GROQ_API_KEY == "sua_chave_aqui":
        return ChatResponse(
            resposta="IA não configurada. Adicione a chave do Groq no .env.",
            acao_executada=None
        )

    try:
        resposta, acao_executada = await processar_mensagem(message.mensagem, current_user, db)
        return ChatResponse(resposta=resposta, acao_executada=acao_executada)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")

@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq não configurado")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        async with httpx.AsyncClient() as client:
            with open(tmp_path, 'rb') as f:
                response = await client.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                    files={"file": ("audio.m4a", f, "audio/m4a")},
                    data={"model": "whisper-large-v3"},
                    timeout=30.0
                )

        os.unlink(tmp_path)
        data = response.json()
        print("WHISPER:", data)

        if "text" not in data:
            raise HTTPException(status_code=500, detail=f"Erro Whisper: {data}")

        texto = data["text"].strip()
        print("TRANSCRITO:", texto)

        resposta, acao_executada = await processar_mensagem(texto, current_user, db)

        return {
            "texto_transcrito": texto,
            "resposta": resposta,
            "acao_executada": acao_executada
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro na transcrição: {str(e)}")