// O tabuleiro inicial: 0 representa célula vazia
const SUDOKU_INICIAL = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

// O tabuleiro que o usuário irá manipular (faz uma cópia profunda)
let tabuleiroAtual = SUDOKU_INICIAL.map(row => [...row]);

const tabuleiroDOM = document.getElementById('tabuleiro');
const mensagemDOM = document.getElementById('mensagem');
const verificarBtn = document.getElementById('verificar-btn');
const novoJogoBtn = document.getElementById('novo-jogo-btn');

// --- INICIALIZAÇÃO E GERAÇÃO DO DOM ---

document.addEventListener('DOMContentLoaded', () => {
    criarTabuleiroDOM();
    verificarBtn.addEventListener('click', verificarSolucao);
    novoJogoBtn.addEventListener('click', reiniciarJogo);
});

function criarTabuleiroDOM() {
    tabuleiroDOM.innerHTML = ''; // Limpa o tabuleiro
    
    for (let linha = 0; linha < 9; linha++) {
        for (let coluna = 0; coluna < 9; coluna++) {
            const celula = document.createElement('div');
            celula.classList.add('celula');
            celula.dataset.linha = linha;
            celula.dataset.coluna = coluna;
            
            const valor = tabuleiroAtual[linha][coluna];

            if (valor !== 0) {
                // Célula inicial (não editável)
                celula.classList.add('inicial');
                celula.textContent = valor;
            } else {
                // Célula editável
                celula.classList.add('editavel');
                celula.contentEditable = true; // Permite a edição
                celula.addEventListener('input', aoDigitar);
                celula.addEventListener('blur', validarEntrada);
                celula.addEventListener('keydown', filtrarTeclas);
            }
            
            tabuleiroDOM.appendChild(celula);
        }
    }
    mensagemDOM.textContent = "Preencha os números de 1 a 9.";
}

// --- FUNÇÕES DE INTERAÇÃO DO USUÁRIO ---

function filtrarTeclas(event) {
    // Permite apenas números (0-9), backspace, delete, setas e tab.
    const key = event.key;
    const isNumber = /^[1-9]$/.test(key);
    const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key);

    if (!isNumber && !isControl) {
        event.preventDefault();
    }
}

function validarEntrada(event) {
    const celula = event.target;
    const linha = parseInt(celula.dataset.linha);
    const coluna = parseInt(celula.dataset.coluna);
    
    let valor = celula.textContent.trim();
    
    // Limpa se for algo diferente de 1-9
    if (!/^[1-9]$/.test(valor)) {
        celula.textContent = '';
        tabuleiroAtual[linha][coluna] = 0;
        celula.classList.remove('invalida');
        return;
    }

    // Atualiza o tabuleiro interno
    tabuleiroAtual[linha][coluna] = parseInt(valor);
}

function aoDigitar(event) {
    const celula = event.target;
    let valor = celula.textContent.trim();

    // Limita a entrada a um único dígito (1-9)
    if (valor.length > 1) {
        celula.textContent = valor.slice(0, 1);
        // Coloca o cursor no final (opcional, mas melhora a UX)
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(celula.firstChild, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    // Remove qualquer feedback de invalidez anterior
    celula.classList.remove('invalida');
}

// --- FUNÇÕES DE CONTROLE DE JOGO ---

function reiniciarJogo() {
    tabuleiroAtual = SUDOKU_INICIAL.map(row => [...row]); // Reset para o inicial
    criarTabuleiroDOM();
    mensagemDOM.textContent = "Novo jogo iniciado. Preencha os números de 1 a 9.";
}

function verificarSolucao() {
    let tabuleiroCompleto = true;
    let tabuleiroValido = true;
    
    // 1. Limpa o estado visual de invalidez
    document.querySelectorAll('.celula').forEach(c => c.classList.remove('invalida'));

    for (let l = 0; l < 9; l++) {
        for (let c = 0; c < 9; c++) {
            const valor = tabuleiroAtual[l][c];
            const celulaDOM = tabuleiroDOM.children[l * 9 + c];

            if (valor === 0) {
                tabuleiroCompleto = false;
            }
            
            // Checa a validade apenas se a célula estiver preenchida pelo usuário
            if (valor !== 0) {
                // Temporariamente define a célula como 0 para verificar o bloco
                tabuleiroAtual[l][c] = 0; 
                
                // Se a jogada for inválida (o número já existe em linha/coluna/bloco)
                if (!verificarValidade(tabuleiroAtual, l, c, valor)) {
                    celulaDOM.classList.add('invalida');
                    tabuleiroValido = false;
                }
                
                // Restaura o valor
                tabuleiroAtual[l][c] = valor;
            }
        }
    }

    // 2. Apresenta o resultado
    if (!tabuleiroCompleto && tabuleiroValido) {
        mensagemDOM.textContent = "O tabuleiro está válido até agora, mas ainda faltam números!";
        mensagemDOM.style.color = 'orange';
    } else if (tabuleiroCompleto && tabuleiroValido) {
        mensagemDOM.textContent = "🎉 Parabéns! O Sudoku está resolvido corretamente!";
        mensagemDOM.style.color = 'green';
    } else if (!tabuleiroValido) {
        mensagemDOM.textContent = "Alguns números são inválidos! Corrija as células em vermelho.";
        mensagemDOM.style.color = 'red';
    }
}

// --- FUNÇÕES DE VERIFICAÇÃO DE REGRAS (Núcleo da Lógica do Sudoku) ---

/**
 * Checa se o número 'num' pode ser colocado em (linha, coluna) sem violar
 * as regras de Sudoku (Linha, Coluna e Bloco 3x3).
 * Retorna TRUE se for válido (o número não está em nenhum lugar proibido).
 */
function verificarValidade(tabuleiro, linha, coluna, num) {
    // 1. Verificar Linha
    for (let c = 0; c < 9; c++) {
        if (c !== coluna && tabuleiro[linha][c] === num) return false;
    }

    // 2. Verificar Coluna
    for (let l = 0; l < 9; l++) {
        if (l !== linha && tabuleiro[l][coluna] === num) return false;
    }

    // 3. Verificar Bloco 3x3
    const inicioLinha = linha - (linha % 3);
    const inicioColuna = coluna - (coluna % 3);

    for (let l = inicioLinha; l < inicioLinha + 3; l++) {
        for (let c = inicioColuna; c < inicioColuna + 3; c++) {
            // Ignora a própria célula que está sendo checada
            if (l !== linha || c !== coluna) { 
                if (tabuleiro[l][c] === num) return false; // Número já existe no bloco
            }
        }
    }
    
    return true; // Válido em todos os aspectos
}