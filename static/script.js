document.addEventListener('DOMContentLoaded', () => {

    // --- Variáveis Globais do Jogo ---
    let meuGrafico = null; 
    let estadoAtualDoJogo = null;
    let historicoParaGrafico = [];
    let escolhaDoJogador = "nenhuma";
    let custoDaEscolha = 0;

    // --- LÓGICA DE NAVEGAÇÃO DAS ABAS ---
    const btnTabControles = document.getElementById('btn-tab-controles');
    const btnTabVisual = document.getElementById('btn-tab-visual');
    const abaControles = document.getElementById('aba-controles');
    const abaVisual = document.getElementById('aba-visual');

    btnTabControles.addEventListener('click', () => {
        abaControles.style.display = 'block';
        abaVisual.style.display = 'none';
        btnTabControles.classList.add('ativo');
        btnTabVisual.classList.remove('ativo');
    });

    btnTabVisual.addEventListener('click', () => {
        abaControles.style.display = 'none';
        abaVisual.style.display = 'block';
        btnTabControles.classList.remove('ativo');
        btnTabVisual.classList.add('ativo');
    });
    // --- FIM DA LÓGICA DAS ABAS ---


    // --- 1. Selecionar os Elementos ---
    const sliderEducacao = document.getElementById('slider-educacao');
    const sliderDesigualdade = document.getElementById('slider-desigualdade');
    const sliderTecnologia = document.getElementById('slider-tecnologia'); 
    const sliderEconomia = document.getElementById('slider-economia');
    const sliderSaude = document.getElementById('slider-saude');
    
    const valorEducacao = document.getElementById('valor-educacao');
    const valorDesigualdade = document.getElementById('valor-desigualdade');
    const valorTecnologia = document.getElementById('valor-tecnologia');
    const valorEconomia = document.getElementById('valor-economia');
    const valorSaude = document.getElementById('valor-saude');

    const btnAvancar = document.getElementById('btn-avancar-ano');
    const btnsDecisao = document.querySelectorAll('.btn-decisao');
    const txtEscolhaAtual = document.getElementById('escolha-atual');

    const outputOrcamento = document.getElementById('output-orcamento');
    const outputEconomia = document.getElementById('output-economia');
    const outputSaude = document.getElementById('output-saude');
    const outputCooperacao = document.getElementById('output-cooperacao');
    const outputConflito = document.getElementById('output-conflito');
    const outputAnoAtual = document.getElementById('ano-atual');
    const outputHistorico = document.getElementById('output-historico');
    const outputEventoIA = document.getElementById('output-evento-ia');

    // Selecionar Elementos do Visualizador
    const vizEscola = document.getElementById('viz-escola');
    const vizFabricaLvl1 = document.getElementById('viz-fabrica-lvl1'); // Nível 1
    const vizFabricaLvl2 = document.getElementById('viz-fabrica-lvl2'); // Nível 2
    const vizHospital = document.getElementById('viz-hospital');
    const vizParque = document.getElementById('viz-parque');
    const vizFiltroConflito = document.getElementById('viz-filtro-conflito');
    
    
    // --- 2. Atualizar mostradores (Sliders) ---
    sliderEducacao.addEventListener('input', () => { valorEducacao.textContent = sliderEducacao.value; });
    sliderDesigualdade.addEventListener('input', () => { valorDesigualdade.textContent = sliderDesigualdade.value; });
    sliderTecnologia.addEventListener('input', () => { valorTecnologia.textContent = sliderTecnologia.value; });
    sliderEconomia.addEventListener('input', () => { valorEconomia.textContent = sliderEconomia.value; });
    sliderSaude.addEventListener('input', () => { valorSaude.textContent = sliderSaude.value; });

    // --- 3. Lidar com Cliques nos Botões de Decisão ---
    btnsDecisao.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            escolhaDoJogador = btn.dataset.choice;
            custoDaEscolha = parseInt(btn.dataset.cost);
            txtEscolhaAtual.textContent = `${btn.textContent.trim()} (Custo: ${custoDaEscolha})`;
            btnsDecisao.forEach(b => b.classList.remove('selecionado'));
            btn.classList.add('selecionado');
            btnAvancar.disabled = false;
        });
    });

    // --- 4. A Lógica do Jogo (Game Loop) ---
    async function avancarAno() {
        if (escolhaDoJogador === "nenhuma" && estadoAtualDoJogo !== null) {
            outputEventoIA.textContent = "Por favor, escolha uma política para o próximo ano!";
            return;
        }
        if (estadoAtualDoJogo !== null && estadoAtualDoJogo.orcamento < custoDaEscolha) {
             outputEventoIA.textContent = "Orçamento insuficiente para esta ação!";
             return;
        }

        btnAvancar.disabled = true;
        btnAvancar.textContent = "Calculando Próximo Ano...";
        btnsDecisao.forEach(btn => btn.disabled = true);
        
        let dadosParaEnviar = {};
        let escolhaParaEnviar = "nenhuma";

        if (estadoAtualDoJogo === null) {
            // --- É O PRIMEIRO CLIQUE (Início do Jogo) ---
            dadosParaEnviar = {
                ano: 0,
                educacao: parseInt(sliderEducacao.value),
                desigualdade: parseInt(sliderDesigualdade.value),
                tecnologia: parseInt(sliderTecnologia.value),
                economia: parseInt(sliderEconomia.value),
                saude: parseInt(sliderSaude.value),
                orcamento: 20
            };
            [sliderEducacao, sliderDesigualdade, sliderTecnologia, sliderEconomia, sliderSaude].forEach(s => s.disabled = true);
        } else {
            // --- JÁ É O ANO 2 OU MAIS ---
            dadosParaEnviar = estadoAtualDoJogo;
            escolhaParaEnviar = escolhaDoJogador;
        }

        try {
            // --- Chamada ao Python ---
            const resposta = await fetch('http://127.0.0.1:5000/avancar_ano', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: dadosParaEnviar, escolha: escolhaParaEnviar })
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.erro || `Erro ${resposta.status}`);
            }

            const respostaObjeto = await resposta.json(); 
            const novoEstado = respostaObjeto.novo_estado;
            const narrativaIA = respostaObjeto.narrativa_ia;

            // ATUALIZA O ESTADO GLOBAL
            estadoAtualDoJogo = novoEstado;
            historicoParaGrafico.push(novoEstado);

            // --- Atualiza UI (Cards, IA, Log) ---
            outputAnoAtual.textContent = novoEstado.ano;
            outputOrcamento.textContent = novoEstado.orcamento;
            outputEconomia.textContent = novoEstado.economia;
            outputSaude.textContent = novoEstado.saude + "%";
            outputCooperacao.textContent = novoEstado.cooperacao + "%";
            outputConflito.textContent = novoEstado.conflito + "%";
            outputEventoIA.textContent = narrativaIA;

            let textoLog = `--- Ano ${novoEstado.ano} (Escolha: ${escolhaParaEnviar}, Custo: ${custoDaEscolha}) ---\n`;
            textoLog += `  ${narrativaIA}\n`;
            textoLog += `  (Result: Coop:${novoEstado.cooperacao}%, Confl:${novoEstado.conflito}%, Econ:${novoEstado.economia}, Saúde:${novoEstado.saude}%)\n`;
            textoLog += `  (Orçamento Final: ${novoEstado.orcamento})\n\n`;
            outputHistorico.textContent = textoLog + outputHistorico.textContent;
            
            // --- Atualiza o Gráfico ---
            atualizarGrafico(historicoParaGrafico);

            // --- Atualiza o Visualizador ---
            atualizarVisualizador(novoEstado);

            // --- Prepara para o PRÓXIMO turno ---
            escolhaDoJogador = "nenhuma";
            custoDaEscolha = 0;
            txtEscolhaAtual.textContent = "Nenhuma";
            btnsDecisao.forEach(b => b.classList.remove('selecionado'));
            atualizarBotoesDeDecisao(novoEstado.orcamento);
            btnAvancar.disabled = true; 

        } catch (erro) {
            // --- Bloco Catch (Corrigido) ---
            console.error("Falha ao contactar o servidor:", erro);
            outputCooperacao.textContent = "Erro!";
            outputConflito.textContent = "Erro!";
            outputEconomia.textContent = "Erro!";
            outputSaude.textContent = "Erro!";
            outputOrcamento.textContent = "Erro!";
            outputHistorico.textContent = `Falha na simulação: ${erro.message}`;
            outputRelatorioIA.textContent = `Falha ao gerar relatório: ${erro.message}`;
            btnAvancar.disabled = false;
            if (estadoAtualDoJogo) {
                atualizarBotoesDeDecisao(estadoAtualDoJogo.orcamento);
            }
        }
        
        btnAvancar.textContent = "Avançar Ano";
    }

    // --- 5. Ligar o Botão ---
    btnAvancar.addEventListener('click', avancarAno);
    
    // --- 6. Função: Atualizar Botões de Decisão ---
    function atualizarBotoesDeDecisao(orcamentoDisponivel) {
        btnsDecisao.forEach(btn => {
            const custo = parseInt(btn.dataset.cost);
            btn.disabled = (custo > orcamentoDisponivel);
        });
    }

    // --- 7. Função do Gráfico ---
    function atualizarGrafico(historico) {
        const labels = historico.map(item => `Ano ${item.ano}`);
        const dadosCooperacao = historico.map(item => item.cooperacao);
        const dadosConflito = historico.map(item => item.conflito);
        const dadosEconomia = historico.map(item => item.economia);
        const dadosSaude = historico.map(item => item.saude);
        const dadosTecnologia = historico.map(item => item.tecnologia);
        
        const ctx = document.getElementById('grafico-simulacao').getContext('2d');
        if (meuGrafico) { meuGrafico.destroy(); }
        
        meuGrafico = new Chart(ctx, {
            type: 'line', 
            data: {
                labels: labels,
                datasets: [
                    { label: 'Cooperação (%)', data: dadosCooperacao, borderColor: 'rgba(0, 123, 255, 1)', tension: 0.1 },
                    { label: 'Conflito (%)', data: dadosConflito, borderColor: 'rgba(220, 53, 69, 1)', tension: 0.1 },
                    { label: 'Economia', data: dadosEconomia, borderColor: 'rgba(40, 167, 69, 1)', tension: 0.1, yAxisID: 'yEconomia' },
                    { label: 'Saúde (%)', data: dadosSaude, borderColor: 'rgba(253, 126, 20, 1)', tension: 0.1 },
                    { label: 'Tecnologia (%)', data: dadosTecnologia, borderColor: 'rgba(108, 52, 131, 1)', hidden: true }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        position: 'left'
                    },
                    yEconomia: {
                        beginAtZero: true,
                        position: 'right',
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: { title: { display: true, text: 'Evolução da Sociedade' } }
            }
        });
    }

    // --- 8. Função para Atualizar o Visualizador (COM NÍVEIS) ---
    function atualizarVisualizador(estado) {
        // Lógica da Educação
        vizEscola.style.display = (estado.educacao > 40) ? 'block' : 'none';
        
        // Lógica da Saúde
        vizHospital.style.display = (estado.saude > 40) ? 'block' : 'none';

        // Lógica Social
        vizParque.style.display = (estado.desigualdade < 30) ? 'block' : 'none';

        // Lógica do Conflito
        vizFiltroConflito.style.display = (estado.conflito > 60) ? 'block' : 'none';

        // LÓGICA DA FÁBRICA (3 Níveis)
        if (estado.tecnologia < 40) {
            // Nível 0: Esconde as duas
            vizFabricaLvl1.style.display = 'none';
            vizFabricaLvl2.style.display = 'none';
        } else if (estado.tecnologia >= 40 && estado.tecnologia < 70) {
            // Nível 1: Mostra a Lvl1, esconde a Lvl2
            vizFabricaLvl1.style.display = 'block';
            vizFabricaLvl2.style.display = 'none';
        } else {
            // Nível 2 (Tecnologia >= 70): Esconde a Lvl1, mostra a Lvl2
            vizFabricaLvl1.style.display = 'none';
            vizFabricaLvl2.style.display = 'block';
        }
    }


    // --- Início do Jogo ---
    btnAvancar.disabled = false;
    btnsDecisao.forEach(btn => btn.disabled = true);
    txtEscolhaAtual.textContent = "Nenhuma (Defina valores e inicie o jogo)";

    btnAvancar.addEventListener('click', () => {
        if(estadoAtualDoJogo && estadoAtualDoJogo.ano === 1) { 
            atualizarBotoesDeDecisao(estadoAtualDoJogo.orcamento);
            btnAvancar.disabled = true;
            txtEscolhaAtual.textContent = "Nenhuma";
        }
    }, { once: true });

});