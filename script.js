// FASE 1: Classe Produto

class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        nome = String(nome).trim();
        preco = Number(preco);
        quantidade = Number(quantidade);

        if (nome === "") {
            throw new Error("O nome do produto não pode ficar vazio.");
        }

        if (!Number.isFinite(preco) || preco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        if (
            !Number.isSafeInteger(quantidade) ||
            quantidade < 1
        ) {
            throw new Error("A quantidade deve ser um número inteiro maior que zero.");
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


// FASE 2: Estado dos produtos

// Recupera os dados do localStorage.

let dadosSalvos = [];

try {
    dadosSalvos = JSON.parse(
        localStorage.getItem("listaDeProdutos")
    ) || [];

} catch (erro) {
    console.log("Não foi possível recuperar os dados.");
    dadosSalvos = [];
}


// Recupera somente produtos válidos.

const listaDeProdutos = [];

dadosSalvos.forEach(function(produto) {

    try {

        if (
            produto &&
            produto.nome !== undefined &&
            produto.preco !== undefined &&
            produto.quantidade !== undefined
        ) {

            const produtoRecuperado = new Produto(
                produto.nome,
                produto.preco,
                produto.quantidade
            );

            listaDeProdutos.push(produtoRecuperado);

        }

    } catch (erro) {
        console.log("Produto antigo inválido ignorado.");
    }

});

let indiceEdicao = null;


// Formatação de moeda.

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });


// FUNÇÃO PARA SALVAR PRODUTOS.

function salvarProdutos() {

    try {

        const produtosParaSalvar = listaDeProdutos.map(
            produto => ({
                nome: produto.nome,
                preco: produto.preco,
                quantidade: produto.quantidade
            })
        );

        localStorage.setItem(
            "listaDeProdutos",
            JSON.stringify(produtosParaSalvar)
        );

        console.log("Produtos salvos com sucesso!");

    } catch (erro) {

        console.error("Erro ao salvar:", erro);

        alert("Não foi possível salvar no navegador.");

    }
}


// FASE 3: Elementos do formulário.

const formProduto = document.getElementById("produto-form");

const botaoSalvar = formProduto.querySelector(".btn-primary");

const campoNome = document.getElementById("nome");

const campoPreco = document.getElementById("preco");

const campoQuantidade = document.getElementById("quantidade");

const botaoLimpar = document.getElementById("limpar-tabela");

const campoBusca = document.getElementById("campo-busca");


// CADASTRAR E EDITAR PRODUTOS.

formProduto.addEventListener("submit", function(event) {

    event.preventDefault();

    const nomeInput = campoNome.value.trim();

    const precoInput = campoPreco.value;

    const quantidadeInput = campoQuantidade.value;

    const preco = Number(precoInput);

    const quantidade = Number(quantidadeInput);


    // Validação dos campos.

    if (
        nomeInput === "" ||
        precoInput.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        quantidadeInput.trim() === "" ||
        !Number.isSafeInteger(quantidade) ||
        quantidade < 1
    ) {

        alert(
            "Dados inválidos!\n\n" +
            "• Informe o nome do produto.\n" +
            "• O preço deve ser maior que zero.\n" +
            "• A quantidade deve ser um número inteiro maior que zero."
        );

        return;
    }


    try {

        const novoProduto = new Produto(
            nomeInput,
            preco,
            quantidade
        );


        if (indiceEdicao === null) {

            // Adicionar produto.

            listaDeProdutos.push(novoProduto);

        } else {

            // Editar produto.

            if (
                indiceEdicao < 0 ||
                indiceEdicao >= listaDeProdutos.length
            ) {

                indiceEdicao = null;

                botaoSalvar.textContent = "Adicionar produto";

                alert("Produto não encontrado.");

                return;
            }

            listaDeProdutos[indiceEdicao] = novoProduto;

        }


        // Salvar no navegador.

        salvarProdutos();

        // Atualizar tabela.

        renderizarTabela();

        // Limpar formulário.

        formProduto.reset();

        indiceEdicao = null;

        botaoSalvar.textContent = "Adicionar produto";

    } catch (erro) {

        alert(erro.message);

    }

});


// PREPARAR EDIÇÃO.

function prepararEdicao(index) {

    const produto = listaDeProdutos[index];

    if (!produto) {
        return;
    }

    campoNome.value = produto.nome;

    campoPreco.value = produto.preco;

    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;

    botaoSalvar.textContent = "Salvar Alterações";

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// BOTÃO LIMPAR TUDO.

botaoLimpar.addEventListener("click", function() {

    const confirmar = confirm(
        "Deseja realmente apagar todos os produtos?"
    );

    if (!confirmar) {
        return;
    }

    listaDeProdutos.length = 0;

    indiceEdicao = null;

    formProduto.reset();

    campoBusca.value = "";

    botaoSalvar.textContent = "Adicionar produto";

    salvarProdutos();

    renderizarTabela();

});


// FASE 4: FILTRO DE PESQUISA V4.

function obterProdutosFiltrados() {

    const termoBusca = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );

}


// Evento input: pesquisa em tempo real.

campoBusca.addEventListener("input", function() {

    renderizarTabela();

});


// FASE 5: RENDERIZAÇÃO DA TABELA.

function renderizarTabela() {

    const tabelaBody = document.querySelector(
        "#tabela-produtos tbody"
    );

    tabelaBody.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();


    // Mensagem quando não encontrar produtos.

    if (produtosFiltrados.length === 0) {

        const linha = document.createElement("tr");

        const celulaMensagem = document.createElement("td");

        celulaMensagem.colSpan = 5;

        celulaMensagem.textContent =
            campoBusca.value.trim() !== ""
                ? "Nenhum produto encontrado!"
                : "Nenhum produto cadastrado.";

        celulaMensagem.className = "mensagem-vazia";

        linha.appendChild(celulaMensagem);

        tabelaBody.appendChild(linha);

    }


    // Mostrar produtos encontrados.

    produtosFiltrados.forEach(function(produto) {

        const index = listaDeProdutos.indexOf(produto);

        const linha = document.createElement("tr");


        // Nome.

        const celulaNome = document.createElement("td");

        celulaNome.textContent = produto.nome;


        // Preço.

        const celulaPreco = document.createElement("td");

        celulaPreco.textContent =
            "R$ " + formatarMoeda(produto.preco);


        // Quantidade.

        const celulaQuantidade = document.createElement("td");

        celulaQuantidade.textContent = produto.quantidade;


        // Subtotal.

        const celulaSubtotal = document.createElement("td");

        celulaSubtotal.textContent =
            "R$ " + formatarMoeda(produto.calcularSubtotal());


        // Ações.

        const celulaAcoes = document.createElement("td");


        // Botão editar.

        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";

        botaoEditar.textContent = "Editar";

        botaoEditar.className = "btn-editar";

        botaoEditar.addEventListener("click", function() {

            prepararEdicao(index);

        });


        // Botão remover.

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

            salvarProdutos();

            renderizarTabela();

        });


        // Adicionar botões.

        celulaAcoes.appendChild(botaoEditar);

        celulaAcoes.appendChild(botaoRemover);


        // Montar linha.

        linha.appendChild(celulaNome);

        linha.appendChild(celulaPreco);

        linha.appendChild(celulaQuantidade);

        linha.appendChild(celulaSubtotal);

        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);

    });


    // FASE 6: TOTAL DO ESTOQUE.

    const totalEstoque = produtosFiltrados.reduce(
        (total, produto) => total + produto.calcularSubtotal(),
        0
    );

    document.getElementById("total-estoque").textContent =
        "Total em estoque: R$ " + formatarMoeda(totalEstoque);

}


// FASE 7: CARREGAR PRODUTOS AO ABRIR A PÁGINA.

renderizarTabela();