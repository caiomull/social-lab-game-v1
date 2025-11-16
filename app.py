from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import random
import os
import google.generativeai as genai

# --- 1. Configuração da API de IA (Idêntico) ---
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("AVISO: A variável de ambiente GEMINI_API_KEY não foi definida.")
else:
    genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- 2. Configuração do Servidor (NOVO E LIMPO) ---
# O Flask encontra as pastas 'static' e 'templates' automaticamente!
app = Flask(__name__)
CORS(app)


# --- 3. Nova Rota para Servir o Jogo ---
@app.route("/")
def serve_index():
    # Esta função procura 'index.html' na pasta 'templates'
    return render_template('index.html')


# --- 4. Função de IA (Idêntico) ---
def gerar_narrativa_anual(dados_ano, escolha_jogador):
    # (O seu código da função de IA fica aqui, sem alteração)
    # ...
    if not API_KEY: return "(IA desligada)"
    ano = dados_ano['ano']
    cooperacao = dados_ano['cooperacao']
    conflito = dados_ano['conflito']
    mapa_escolha = {
        "educacao": "investir em educação", "tecnologia": "focar em tecnologia",
        "social": "promover leis sociais", "saude": "expandir a saúde pública",
        "nenhuma": "manter o status quo"
    }
    texto_escolha = mapa_escolha.get(escolha_jogador, "manter o status quo")
    prompt = f"""
    Você é um narrador de eventos. Para o Ano {ano}, o governo decidiu {texto_escolha}.
    Os resultados no final do ano foram: - Cooperação: {cooperacao}% - Conflito: {conflito}%
    Escreva UMA ÚNICA frase curta (máximo 1-2 linhas) descrevendo
    um evento ou notícia que reflita a decisão do governo E os resultados.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Erro ao chamar a API da IA (Anual): {e}")
        return f"(Ocorreu um erro na IA: {e})"

# --- 5. O Motor de Simulação (Idêntico) ---
def calcular_um_ano(estado_anterior, escolha_jogador):
    # (Todo o seu código de 'calcular_um_ano' fica aqui, sem alteração)
    # ...
    ano_anterior = estado_anterior['ano']
    educacao_atual = estado_anterior['educacao']
    desigualdade_atual = estado_anterior['desigualdade']
    tecnologia_atual = estado_anterior['tecnologia']
    economia_atual = estado_anterior['economia']
    saude_atual = estado_anterior['saude']
    orcamento_atual = estado_anterior['orcamento']
    impostos = round(economia_atual * 0.15)
    orcamento_atual += impostos
    custos = {
        "educacao": 10, "tecnologia": 10, "social": 15, "saude": 10, "nenhuma": 0
    }
    custo_da_escolha = custos.get(escolha_jogador, 0)
    if orcamento_atual >= custo_da_escolha:
        orcamento_atual -= custo_da_escolha
        if escolha_jogador == "educacao": educacao_atual += random.randint(3, 7)
        elif escolha_jogador == "tecnologia": tecnologia_atual += random.randint(3, 7)
        elif escolha_jogador == "social": desigualdade_atual -= random.randint(3, 7)
        elif escolha_jogador == "saude": saude_atual += random.randint(5, 10)
    bonus_tecnologia = (tecnologia_atual * 0.25)
    bonus_saude = (saude_atual * 0.10) 
    cooperacao = round(((educacao_atual - desigualdade_atual + bonus_tecnologia + bonus_saude) + 100) / 2)
    conflito = round(desigualdade_atual)
    crescimento_economia = 0
    if educacao_atual > 50: crescimento_economia += random.randint(0, 2)
    if tecnologia_atual > 50: crescimento_economia += random.randint(1, 3)
    if saude_atual > 60: crescimento_economia += random.randint(0, 2)
    if conflito > 60: crescimento_economia -= random.randint(1, 4)
    economia_atual += crescimento_economia
    if cooperacao > 50: educacao_atual += random.randint(1, 2)
    if conflito < 40: desigualdade_atual -= random.randint(1, 2)
    if tecnologia_atual > 50: educacao_atual += random.randint(0, 1)
    if saude_atual > 50: saude_atual -= random.randint(0, 2)
    educacao_atual += random.randint(-1, 1)
    desigualdade_atual += random.randint(-1, 1)
    tecnologia_atual += random.randint(-1, 1)
    educacao_atual = max(0, min(100, educacao_atual))
    desigualdade_atual = max(0, min(100, desigualdade_atual))
    tecnologia_atual = max(0, min(100, tecnologia_atual))
    saude_atual = max(0, min(100, saude_atual))
    economia_atual = max(10, min(500, economia_atual))
    orcamento_atual = round(orcamento_atual)
    novo_estado = {
        "ano": ano_anterior + 1, "educacao": round(educacao_atual),
        "desigualdade": round(desigualdade_atual), "tecnologia": round(tecnologia_atual),
        "economia": round(economia_atual), "saude": round(saude_atual),
        "orcamento": orcamento_atual, "cooperacao": cooperacao, "conflito": conflito
    }
    print(f"Cálculo do Ano {novo_estado['ano']} concluído.")
    return novo_estado


# --- 6. A Rota da API: /avancar_ano (Idêntica) ---
@app.route("/avancar_ano", methods=['POST'])
def rota_de_avancar_ano():
    dados_recebidos = request.json
    estado_atual = dados_recebidos.get('estado')
    escolha_atual = dados_recebidos.get('escolha')
    if estado_atual is None or escolha_atual is None:
        return jsonify({"erro": "Dados de estado ou escolha não recebidos"}), 400
    novo_estado_calculado = calcular_um_ano(estado_atual, escolha_atual)
    narrativa_ia = gerar_narrativa_anual(novo_estado_calculado, escolha_atual)
    return jsonify({
        "novo_estado": novo_estado_calculado,
        "narrativa_ia": narrativa_ia
    })

# --- 7. Roda o Servidor (Idêntico) ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)