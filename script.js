//
// FASE 1: Modelagem dos dados (Classe Base)
//

// A classe funciona como um molde para criar produtos
class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        // Remove espaços extras do nome
        nome = nome.trim();

        // Converte os valores
        preco = parseFloat(preco);
        quantidade = parseInt(quantidade);

        // Validações
        if (nome === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        if (isNaN(preco) || preco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        if (isNaN(quantidade) || quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        // Propriedades do objeto
        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    // Getter do preço
    get preco() {
        return this.#preco;
    }

    // Getter da quantidade
    get quantidade() {
        return this.#quantidade;
    }

    // Método que calcula o subtotal
    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }
}


//
// FASE 2: Gerenciamento de Estado (memória)
//

// Array global que guardará todas as instâncias da classe Produto
const listaDeProdutos = [];


//
// FASE 3: Escuta de Eventos do DOM
//

// Selecionamos o formulário pelo ID
const formProduto = document.getElementById("produto-form");

// Evento de envio do formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Captura dos valores digitados
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    try {
        // Cria uma nova instância da classe Produto
        const novoProduto = new Produto(
            nomeInput,
            precoInput,
            quantidadeInput
        );

        // Adiciona o produto ao array
        listaDeProdutos.push(novoProduto);

        // Atualiza a tabela
        renderizarTabela();

        // Atualiza o total do estoque
        atualizarTotalEstoque();

        // Limpa o formulário
        formProduto.reset();

    } catch (erro) {
        // Exibe o erro sem travar a aplicação
        alert(erro.message);
    }
});


//
// FASE 4: Renderização da Interface DOM
//

// Função responsável por desenhar a tabela
function renderizarTabela() {
    // Seleciona o corpo da tabela
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    // Limpa o conteúdo anterior
    tabelaBody.innerHTML = "";

    // Percorre o array de produtos
    listaDeProdutos.forEach((produto, index) => {

        // Cria uma linha
        const linha = document.createElement("tr");

        // Preenche a linha com os dados
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover" onclick="removerProduto(${index})">
                    Remover
                </button>
            </td>
        `;

        // Insere a linha na tabela
        tabelaBody.appendChild(linha);
    });
}


//
// FASE 5: Total do Estoque
//

function atualizarTotalEstoque() {

    // Soma o subtotal de todos os produtos
    const total = listaDeProdutos.reduce((acumulador, produto) => {
        return acumulador + produto.calcularSubtotal();
    }, 0);

    // Seleciona o elemento do total
    const elementoTotal = document.getElementById("total-estoque");

    // Formata o valor como moeda brasileira
    elementoTotal.textContent = `Total em estoque: ${total.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    )}`;
}


//
// FASE 6: Remover Produto
//

function removerProduto(index) {

    // Remove um produto pela posição
    listaDeProdutos.splice(index, 1);

    // Atualiza a tabela
    renderizarTabela();

    // Atualiza o total
    atualizarTotalEstoque();
}


//
// FASE 7: Limpar Todo o Estoque
//

const botaoLimpar = document.getElementById("limpar-tabela");

botaoLimpar.addEventListener("click", function () {

    // Esvazia o array
    listaDeProdutos.length = 0;

    // Atualiza a tabela
    renderizarTabela();

    // Atualiza o total
    atualizarTotalEstoque();
});