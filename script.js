
class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        nome = String(nome).trim();
        preco = Number(preco);
        quantidade = Number(quantidade);

        if (nome === "") {
            throw new Error("Preencha o campo nome do produto.");
        }

        if (!Number.isFinite(preco) || preco <= 0) {
            throw new Error("Informe um preço maior que zero.");
        }

        if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
            throw new Error("Informe uma quantidade inteira maior que zero.");
        }

        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }
}

let dadosSalvos = [];

try {
    dadosSalvos = JSON.parse(localStorage.getItem("listaDeProdutos")) || [];
} catch (erro) {
    dadosSalvos = [];
}

const listaDeProdutos = [];

dadosSalvos.forEach(function(produto) {
    try {
        if (
            produto &&
            produto.nome !== undefined &&
            produto.preco !== undefined &&
            produto.quantidade !== undefined
        ) {
            listaDeProdutos.push(
                new Produto(produto.nome, produto.preco, produto.quantidade)
            );
        }
    } catch (erro) {
        console.log("Produto antigo inválido ignorado.");
    }
});

let indiceEdicao = null;

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const formProduto = document.getElementById("produto-form");
const botaoSalvar = formProduto.querySelector(".btn-primary");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const botaoLimpar = document.getElementById("limpar-tabela");
const campoBusca = document.getElementById("campo-busca");
const mensagemStatus = document.getElementById("mensagem-status");

function mostrarMensagem(texto, tipo = "sucesso") {
    mensagemStatus.textContent = texto;
    mensagemStatus.className = "mensagem-status " + tipo;
}

function limparMensagem() {
    mensagemStatus.textContent = "";
    mensagemStatus.className = "mensagem-status";
}

function salvarProdutos() {
    try {
        const produtosParaSalvar = listaDeProdutos.map(produto => ({
            nome: produto.nome,
            preco: produto.preco,
            quantidade: produto.quantidade
        }));

        localStorage.setItem(
            "listaDeProdutos",
            JSON.stringify(produtosParaSalvar)
        );

        return true;
    } catch (erro) {
        mostrarMensagem(
            "Não foi possível salvar os produtos no navegador.",
            "erro"
        );

        return false;
    }
}

formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomeInput = campoNome.value.trim();
    const precoInput = campoPreco.value;
    const quantidadeInput = campoQuantidade.value;

    const preco = Number(precoInput);
    const quantidade = Number(quantidadeInput);

    if (nomeInput === "") {
        mostrarMensagem("Preencha o campo nome do produto.", "erro");
        campoNome.focus();
        return;
    }

    if (
        precoInput.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        mostrarMensagem("Preencha o campo preço com um valor válido.", "erro");
        campoPreco.focus();
        return;
    }

    if (
        quantidadeInput.trim() === "" ||
        !Number.isSafeInteger(quantidade) ||
        quantidade < 1
    ) {
        mostrarMensagem("Preencha a quantidade com um número inteiro maior que zero.", "erro");
        campoQuantidade.focus();
        return;
    }

    try {
        const novoProduto = new Produto(nomeInput, preco, quantidade);

        if (indiceEdicao === null) {
            listaDeProdutos.push(novoProduto);
            mostrarMensagem("Produto cadastrado com sucesso!", "sucesso");
        } else {
            if (
                indiceEdicao < 0 ||
                indiceEdicao >= listaDeProdutos.length
            ) {
                indiceEdicao = null;
                botaoSalvar.textContent = "Adicionar produto";
                mostrarMensagem("Produto não encontrado.", "erro");
                return;
            }

            listaDeProdutos[indiceEdicao] = novoProduto;
            mostrarMensagem("Produto atualizado com sucesso!", "sucesso");
        }

        if (salvarProdutos()) {
            renderizarTabela();
            formProduto.reset();
            indiceEdicao = null;
            botaoSalvar.textContent = "Adicionar produto";
        }

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    }
});

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        mostrarMensagem("Produto não encontrado.", "erro");
        return;
    }

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    botaoSalvar.textContent = "Salvar alterações";

    limparMensagem();

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

botaoLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        mostrarMensagem("Não existem produtos cadastrados para remover.", "erro");
        return;
    }

    listaDeProdutos.length = 0;
    indiceEdicao = null;

    formProduto.reset();
    campoBusca.value = "";
    botaoSalvar.textContent = "Adicionar produto";

    if (salvarProdutos()) {
        renderizarTabela();
        mostrarMensagem("Todos os produtos foram removidos com sucesso!", "sucesso");
    }
});

function obterProdutosFiltrados() {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );
}

campoBusca.addEventListener("input", function() {
    renderizarTabela();
});

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();

    if (produtosFiltrados.length === 0) {
        const linha = document.createElement("tr");
        const celulaMensagem = document.createElement("td");

        celulaMensagem.colSpan = 5;

        celulaMensagem.textContent =
            campoBusca.value.trim() !== ""
                ? "Nenhum produto encontrado."
                : "Nenhum produto cadastrado.";

        celulaMensagem.className = "mensagem-vazia";

        linha.appendChild(celulaMensagem);
        tabelaBody.appendChild(linha);
    }

    produtosFiltrados.forEach(function(produto) {
        const index = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = "R$ " + formatarMoeda(produto.preco);

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent =
            "R$ " + formatarMoeda(produto.calcularSubtotal());

        const celulaAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "btn-editar";

        botaoEditar.addEventListener("click", function() {
            prepararEdicao(index);
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";
        botaoRemover.className = "btn-remover";

        botaoRemover.addEventListener("click", function() {
            listaDeProdutos.splice(index, 1);

            if (indiceEdicao === index) {
                indiceEdicao = null;
                formProduto.reset();
                botaoSalvar.textContent = "Adicionar produto";
            } else if (
                indiceEdicao !== null &&
                indiceEdicao > index
            ) {
                indiceEdicao--;
            }

            if (salvarProdutos()) {
                renderizarTabela();
                mostrarMensagem("Produto removido com sucesso!", "sucesso");
            }
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoRemover);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);
    });

    const totalEstoque = produtosFiltrados.reduce(
        (total, produto) => total + produto.calcularSubtotal(),
        0
    );

    document.getElementById("total-estoque").textContent =
        "Total em estoque: R$ " + formatarMoeda(totalEstoque);
}

renderizarTabela();
