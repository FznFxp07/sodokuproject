// --- CONJUNTO DE TABULEIROS DISPONÍVEIS ---
const SUDOKUS = [
    [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    [
        [0, 2, 0, 6, 0, 8, 0, 0, 0],
        [5, 8, 0, 0, 0, 9, 7, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [3, 7, 0, 0, 0, 0, 5, 0, 0],
        [6, 0, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 8, 0, 0, 0, 0, 1, 3],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 9, 8, 0, 0, 0, 3, 6],
        [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ]
];

// Seleciona um aleatoriamente
let SUDOKU_INICIAL = gerarSudokuAleatorio();
let tabuleiroAtual = SUDOKU_INICIAL.map(row => [...row]);

const tabuleiroDOM = document.getElementById('tabuleiro');
const mensagemDOM = document.getElementById('mensagem');
const verificarBtn = document.getElementById('verificar-btn');
const novoJogoBtn = document.getElementById('novo-jogo-btn');

document.addEventListener('DOMContentLoaded', () => {
    criarTabuleiroDOM();
    verificarBtn.addEventListener('click', verificarSolucao);
    novoJogoBtn.addEventListener('click', reiniciarJogo);
});

function gerarSudokuAleatorio() {
    const indice = Math.floor(Math.random() * SUDOKUS.length);
    return SUDOKUS[indice].map(row => [...row]); // cópia profunda
}

function criarTabuleiroDOM() {
    tabuleiroDOM.innerHTML = '';
    for (let linha = 0; linha < 9; linha++) {
        for (let coluna = 0; coluna < 9; coluna++) {
            const celula = document.createElement('div');
            celula.classList.add('celula');
            celula.dataset.linha = linha;
            celula.dataset.coluna = coluna;
            const valor = tabuleiroAtual[linha][coluna];

            if (valor !== 0) {
                celula.classList.add('inicial');
                celula.textContent = valor;
            } else {
                celula.classList.add('editavel');
                celula.contentEditable = true;
                celula.addEventListener('input', aoDigitar);
                celula.addEventListener('blur', validarEntrada);
                celula.addEventListener('keydown', filtrarTeclas);
            }
            tabuleiroDOM.appendChild(celula);
        }
    }
    mensagemDOM.textContent = "Preencha os números de 1 a 9.";
}

function filtrarTeclas(event) {
    const key = event.key;
    const isNumber = /^[1-9]$/.test(key);
    const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key);
    if (!isNumber && !isControl) event.preventDefault();
}

function validarEntrada(event) {
    const celula = event.target;
    const linha = parseInt(celula.dataset.linha);
    const coluna = parseInt(celula.dataset.coluna);
    let valor = celula.textContent.trim();
    if (!/^[1-9]$/.test(valor)) {
        celula.textContent = '';
        tabuleiroAtual[linha][coluna] = 0;
        celula.classList.remove('invalida');
        return;
    }
    tabuleiroAtual[linha][coluna] = parseInt(valor);
}

function aoDigitar(event) {
    const celula = event.target;
    let valor = celula.textContent.trim();
    if (valor.length > 1) {
        celula.textContent = valor.slice(0, 1);
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(celula.firstChild, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    celula.classList.remove('invalida');
}

function reiniciarJogo() {
    SUDOKU_INICIAL = gerarSudokuAleatorio();
    tabuleiroAtual = SUDOKU_INICIAL.map(row => [...row]);
    criarTabuleiroDOM();
    mensagemDOM.textContent = "Novo jogo iniciado. Boa sorte!";
    mensagemDOM.style.color = 'black';
}

function verificarSolucao() {
    let tabuleiroCompleto = true;
    let tabuleiroValido = true;
    document.querySelectorAll('.celula').forEach(c => c.classList.remove('invalida'));

    for (let l = 0; l < 9; l++) {
        for (let c = 0; c < 9; c++) {
            const valor = tabuleiroAtual[l][c];
            const celulaDOM = tabuleiroDOM.children[l * 9 + c];
            if (valor === 0) tabuleiroCompleto = false;
            if (valor !== 0) {
                tabuleiroAtual[l][c] = 0; 
                if (!verificarValidade(tabuleiroAtual, l, c, valor)) {
                    celulaDOM.classList.add('invalida');
                    tabuleiroValido = false;
                }
                tabuleiroAtual[l][c] = valor;
            }
        }
    }

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

function verificarValidade(tabuleiro, linha, coluna, num) {
    for (let c = 0; c < 9; c++) if (c !== coluna && tabuleiro[linha][c] === num) return false;
    for (let l = 0; l < 9; l++) if (l !== linha && tabuleiro[l][coluna] === num) return false;
    const inicioLinha = linha - (linha % 3);
    const inicioColuna = coluna - (coluna % 3);
    for (let l = inicioLinha; l < inicioLinha + 3; l++) {
        for (let c = inicioColuna; c < inicioColuna + 3; c++) {
            if ((l !== linha || c !== coluna) && tabuleiro[l][c] === num) return false;
        }
    }
    return true;
}
