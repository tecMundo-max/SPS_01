// ======================================================
// SPS v4 - Chamados
// Bloco 1 - Inicialização
// ======================================================

const session = requireAuth();
const dbRef = firebase.database();

let chamadosCache = [];

// ======================================================
// FORMULÁRIO
// ======================================================

const form = document.getElementById("formChamado");

const inAnalista =
document.getElementById("analista");

const inData =
document.getElementById("data");

const inChamado =
document.getElementById("chamado");

const inMsisdn =
document.getElementById("msisdn");

const selEquip =
document.getElementById("equipamentoSelect");

const selCenario =
document.getElementById("cenarioSelect");

const inObs =
document.getElementById("observacoes");

const inChamadoId =
document.getElementById("chamadoId");

// ======================================================
// FILTROS
// ======================================================

const fDataIni =
document.getElementById("fDataIni");

const fDataFim =
document.getElementById("fDataFim");

const fAnalista =
document.getElementById("fAnalista");

const fChamado =
document.getElementById("fChamado");

const fLinha =
document.getElementById("fLinha");

const fEquipamento =
document.getElementById("fEquipamento");

const fCenario =
document.getElementById("fCenario");

const totalEncontrado =
document.getElementById("totalEncontrado");

// ======================================================
// TABELA
// ======================================================

const tbody =
document.querySelector(
"#tblChamados tbody"
);

// ======================================================
// MODAL
// ======================================================

const modalEditar =
document.getElementById(
"modalEditar"
);

const editId =
document.getElementById(
"editId"
);

const editChamado =
document.getElementById(
"editChamado"
);

const editMsisdn =
document.getElementById(
"editMsisdn"
);

const editEquipamento =
document.getElementById(
"editEquipamento"
);

const editCenario =
document.getElementById(
"editCenario"
);

const editObservacoes =
document.getElementById(
"editObservacoes"
);

// ======================================================
// UTIL
// ======================================================

function normalizarMsisdn(v){

    return v
        .replace(/\D/g,"")
        .slice(0,11);

}

function formatarData(timestamp){

    return new Date(timestamp)
        .toLocaleString(
            "pt-BR"
        );

}

function truncarTexto(
    texto,
    tamanho = 25
){

    if(!texto)
        return "";

    if(texto.length <= tamanho)
        return texto;

    return texto.substring(
        0,
        tamanho
    ) + "...";

}

function validarChamado(valor){

    if(!valor)
        return false;

    return valor
        .trim()
        .toUpperCase()
        .startsWith("INC-");

}
// ======================================================
// SPS v4 - Chamados
// Bloco 2 - Listas e Inicialização
// ======================================================

const coresAnalistas = [
    "#1f2937",
    "#374151",
    "#0f766e",
    "#14532d",
    "#7c2d12",
    "#4c1d95",
    "#7f1d1d",
    "#1e3a8a"
];

function obterCorAnalista(nome){

    if(!nome)
        return "#121218";

    let hash = 0;

    for(let i = 0; i < nome.length; i++){

        hash =
            nome.charCodeAt(i) +
            ((hash << 5) - hash);

    }

    hash =
        Math.abs(hash);

    return coresAnalistas[
        hash %
        coresAnalistas.length
    ];

}

// ======================================================
// DATA ATUAL
// ======================================================

function preencherDataAtual(){

    const agora =
        new Date();

    const local =
        new Date(
            agora.getTime() -
            agora.getTimezoneOffset() * 60000
        );

    inData.value =
        local
            .toISOString()
            .slice(0,16);

}

// ======================================================
// ANALISTA
// ======================================================

function preencherAnalista(){

    inAnalista.value =
        session?.nome ||
        session?.username ||
        "";

}

// ======================================================
// LISTAS FIREBASE
// ======================================================

async function carregarListas(){

    try{

        const snap =
            await dbRef
                .ref("app/listas")
                .once("value");

        const listas =
            snap.val() || {};

        const equipamentos =
            listas.equipamentos || [];

        const cenarios =
            listas.cenarios || [];

        preencherCombo(
            selEquip,
            equipamentos
        );

        preencherCombo(
            selCenario,
            cenarios
        );

        preencherComboFiltro(
            fEquipamento,
            equipamentos
        );

        preencherComboFiltro(
            fCenario,
            cenarios
        );

        preencherCombo(
            editEquipamento,
            equipamentos
        );

        preencherCombo(
            editCenario,
            cenarios
        );

    }
    catch(err){

        console.error(
            "Erro listas:",
            err
        );

        alert(
            "Erro ao carregar listas."
        );

    }

}

// ======================================================
// COMBOS
// ======================================================

function preencherCombo(
    combo,
    lista
){

    combo.innerHTML = "";

    const opcao =
        document.createElement(
            "option"
        );

    opcao.value = "";
    opcao.textContent =
        "(selecione)";

    combo.appendChild(
        opcao
    );

    lista.forEach(item => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            item;

        option.textContent =
            item;

        combo.appendChild(
            option
        );

    });

}

function preencherComboFiltro(
    combo,
    lista
){

    combo.innerHTML = "";

    const opcao =
        document.createElement(
            "option"
        );

    opcao.value = "";
    opcao.textContent =
        "Todos";

    combo.appendChild(
        opcao
    );

    lista.forEach(item => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            item;

        option.textContent =
            item;

        combo.appendChild(
            option
        );

    });

}

// ======================================================
// DATA FILTRO HOJE
// ======================================================

function aplicarFiltroHoje(){

    const agora = new Date();

    const hoje =
        agora.getFullYear() +
        "-" +
        String(
            agora.getMonth() + 1
        ).padStart(2,"0") +
        "-" +
        String(
            agora.getDate()
        ).padStart(2,"0");

    fDataIni.value = hoje;
    fDataFim.value = hoje;

}

// ======================================================
// BOTÃO HOJE
// ======================================================

document
.getElementById("btnHoje")
.addEventListener(
    "click",
    () => {

        aplicarFiltroHoje();

        aplicarFiltros();

    }
);

// ======================================================
// BOTÃO LIMPAR
// ======================================================

document
.getElementById("btnLimpar")
.addEventListener(
    "click",
    () => {

        fAnalista.value = "";
        fChamado.value = "";
        fLinha.value = "";

        fEquipamento.value = "";
        fCenario.value = "";

        aplicarFiltroHoje();

        aplicarFiltros();

    }
);

// ======================================================
// BOOT
// ======================================================

preencherAnalista();

preencherDataAtual();

aplicarFiltroHoje();

carregarListas();

// ======================================================
// SPS v4 - Chamados
// Bloco 3 - Cadastro e Salvamento
// ======================================================

// ======================================================
// MÁSCARA MSISDN
// ======================================================

inMsisdn.addEventListener(
    "input",
    () => {

        let v =
            inMsisdn.value
                .replace(/\D/g,"")
                .slice(0,11);

        if(v.length > 2){

            v =
                v.replace(
                    /^(\d{2})(\d)/,
                    "$1 $2"
                );

        }

        if(v.length > 8){

            v =
                v.replace(
                    /^(\d{2}) (\d{5})(\d)/,
                    "$1 $2-$3"
                );

        }

        inMsisdn.value = v;

    }
);

// ======================================================
// LIMPAR FORM
// ======================================================

function limparFormulario(){

    inChamado.value = "";

    inMsisdn.value = "";

    selEquip.value = "";

    selCenario.value = "";

    inObs.value = "";

    inChamadoId.value = "";

    preencherAnalista();

    preencherDataAtual();

}

// ======================================================
// CANCELAR
// ======================================================

document
.getElementById("btnCancelar")
.addEventListener(
    "click",
    limparFormulario
);

// ======================================================
// CRIAR PAYLOAD
// ======================================================

function criarPayload(){

    const chamado =
        inChamado.value
            .trim()
            .toUpperCase();

    if(!validarChamado(chamado)){

        alert(
            "O chamado deve iniciar com INC-"
        );

        inChamado.focus();

        return null;

    }

    const linha =
        normalizarMsisdn(
            inMsisdn.value
        );

    if(linha.length !== 11){

        alert(
            "MSISDN inválido."
        );

        inMsisdn.focus();

        return null;

    }

    const dataSelecionada =
        inData.value;

    const timestamp =
        new Date(
            dataSelecionada
        ).getTime();

    if(
        Number.isNaN(timestamp)
    ){

        alert(
            "Data inválida."
        );

        return null;

    }

    return {

        analista:
            inAnalista.value
                .trim(),

        chamado:
            chamado,

        linha:
            linha,

        equipamento:
            selEquip.value,

        cenario:
            selCenario.value,

        observacoes:
            inObs.value.trim(),

        createdAt:
            timestamp

    };

}

// ======================================================
// NOVO CHAMADO
// ======================================================

async function salvarNovo(){

    const payload =
        criarPayload();

    if(!payload)
        return;

    try{

        await dbRef
            .ref("app/chamados")
            .push(payload);

        limparFormulario();

        await carregarChamados();

        alert(
            "Chamado salvo."
        );

    }
    catch(err){

        console.error(err);

        alert(
            "Erro ao salvar."
        );

    }

}

// ======================================================
// ATUALIZAR CHAMADO
// ======================================================

async function atualizarChamado(){

    const id =
        inChamadoId.value;

    if(!id){

        await salvarNovo();

        return;

    }

    const payload =
        criarPayload();

    if(!payload)
        return;

    try{

        await dbRef
            .ref(
                "app/chamados/" + id
            )
            .update(payload);

        limparFormulario();

        await carregarChamados();

        alert(
            "Chamado atualizado."
        );

    }
    catch(err){

        console.error(err);

        alert(
            "Erro ao atualizar."
        );

    }

}

// ======================================================
// SUBMIT
// ======================================================

form.addEventListener(
    "submit",
    async e => {

        e.preventDefault();

        if(
            inChamadoId.value
        ){

            await atualizarChamado();

        }
        else{

            await salvarNovo();

        }

    }
);

// ======================================================
// PREENCHER FORM EDIÇÃO
// ======================================================

function carregarFormularioEdicao(
    chamado
){

    inChamadoId.value =
        chamado.id;

    inChamado.value =
        chamado.chamado;

    inMsisdn.value =
        chamado.linha;

    selEquip.value =
        chamado.equipamento || "";

    selCenario.value =
        chamado.cenario || "";

    inObs.value =
        chamado.observacoes || "";

    const local =
        new Date(
            chamado.createdAt -
            (
                new Date()
                .getTimezoneOffset()
                * 60000
            )
        );

    inData.value =
        local
            .toISOString()
            .slice(0,16);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
// ======================================================
// SPS v4 - Chamados
// Bloco 4 - Listagem e Pesquisa
// ======================================================

async function carregarChamados(){

    try{

        const snap =
            await dbRef
                .ref("app/chamados")
                .once("value");

        const dados =
            snap.val() || {};

        chamadosCache = [];

        Object.entries(dados)
        .forEach(([id,item]) => {

            chamadosCache.push({

                id,

                ...item

            });

        });

        aplicarFiltros();

    }
    catch(err){

        console.error(err);

        alert(
            "Erro ao carregar chamados."
        );

    }

}

// ======================================================
// FILTROS
// ======================================================

function aplicarFiltros(){

    let lista =
        [...chamadosCache];

    // ------------------------------------------
    // DATA INICIAL
    // ------------------------------------------

    if(fDataIni.value){

        const ini =
            new Date(
                fDataIni.value +
                "T00:00:00"
            ).getTime();

        lista =
            lista.filter(
                c =>
                c.createdAt >= ini
            );

    }

    // ------------------------------------------
    // DATA FINAL
    // ------------------------------------------

    if(fDataFim.value){

        const fim =
            new Date(
                fDataFim.value +
                "T23:59:59"
            ).getTime();

        lista =
            lista.filter(
                c =>
                c.createdAt <= fim
            );

    }

    // ------------------------------------------
    // ANALISTA
    // ------------------------------------------

    if(fAnalista.value){

        const texto =
            fAnalista.value
                .toLowerCase();

        lista =
            lista.filter(
                c =>
                (c.analista || "")
                .toLowerCase()
                .includes(texto)
            );

    }

    // ------------------------------------------
    // CHAMADO
    // ------------------------------------------

    if(fChamado.value){

        const texto =
            fChamado.value
                .toLowerCase();

        lista =
            lista.filter(
                c =>
                (c.chamado || "")
                .toLowerCase()
                .includes(texto)
            );

    }

    // ------------------------------------------
    // LINHA
    // ------------------------------------------

    if(fLinha.value){

        const texto =
            normalizarMsisdn(
                fLinha.value
            );

        lista =
            lista.filter(
                c =>
                (c.linha || "")
                .includes(texto)
            );

    }

    // ------------------------------------------
    // EQUIPAMENTO
    // ------------------------------------------

    if(fEquipamento.value){

        lista =
            lista.filter(
                c =>
                c.equipamento ===
                fEquipamento.value
            );

    }

    // ------------------------------------------
    // CENÁRIO
    // ------------------------------------------

    if(fCenario.value){

        lista =
            lista.filter(
                c =>
                c.cenario ===
                fCenario.value
            );

    }

    lista.sort(
        (a,b) =>
        b.createdAt -
        a.createdAt
    );

    renderizarTabela(
        lista
    );

}

// ======================================================
// BOTÃO PESQUISAR
// ======================================================

document
.getElementById(
    "btnPesquisar"
)
.addEventListener(
    "click",
    aplicarFiltros
);

// ======================================================
// TOTAL
// ======================================================

function atualizarTotal(qtd){

    totalEncontrado.textContent =
        "Total encontrado: " +
        qtd;

}

// ======================================================
// ADMIN
// ======================================================

function ehAdmin(){

    return (
        session &&
        session.admin === true
    );

}

// ======================================================
// OBS CURTA
// ======================================================

function observacaoCurta(texto){

    return truncarTexto(
        texto || "",
        30
    );

}

// ======================================================
// TABELA
// ======================================================

function renderizarTabela(lista){

    tbody.innerHTML = "";

    atualizarTotal(
        lista.length
    );

    const thAcoes =
        document.getElementById(
            "thAcoes"
        );

    if(thAcoes){

        thAcoes.style.display =
            ehAdmin()
                ? ""
                : "none";

    }

    lista.forEach(item => {

        const tr =
            document.createElement(
                "tr"
            );

        tr.style.background =
            obterCorAnalista(
                item.analista
            );

        let html = `
            <td>
                ${formatarData(
                    item.createdAt
                )}
            </td>

            <td>
                ${item.analista || ""}
            </td>

            <td>
                ${item.chamado || ""}
            </td>

            <td>
                ${item.linha || ""}
            </td>

            <td>
                ${item.equipamento || ""}
            </td>

            <td>
                ${item.cenario || ""}
            </td>

            <td
                title="${item.observacoes || ""}">
                ${observacaoCurta(
                    item.observacoes
                )}
            </td>
        `;

        if(ehAdmin()){

            html += `
                <td>

                    <button
                        onclick="abrirModalEdicao('${item.id}')">

                        ✏️

                    </button>

                    <button
                        onclick="excluirChamado('${item.id}')">

                        🗑️

                    </button>

                </td>
            `;

        }

        tr.innerHTML =
            html;

        tbody.appendChild(
            tr
        );

    });

}

// ======================================================
// EXCLUIR
// ======================================================

async function excluirChamado(id){

    const registro =
        chamadosCache.find(
            x => x.id === id
        );

    if(!registro)
        return;

    const confirmar =
        confirm(
            `Deseja excluir o chamado ${registro.chamado}?`
        );

    if(!confirmar)
        return;

    try{

        await dbRef
            .ref(
                "app/chamados/" + id
            )
            .remove();

        await carregarChamados();

    }
    catch(err){

        console.error(err);

        alert(
            "Erro ao excluir."
        );

    }

}

window.excluirChamado =
    excluirChamado;

// ======================================================
// CARREGAMENTO INICIAL
// ======================================================

carregarChamados();
// ======================================================
// SPS v4 - Chamados
// Bloco 5 - Modal e Edição
// ======================================================

function abrirModal(){

    modalEditar.style.display =
        "block";

}

function fecharModal(){

    modalEditar.style.display =
        "none";

}

// ======================================================
// ABRIR EDIÇÃO
// ======================================================

function abrirModalEdicao(id){

    const chamado =
        chamadosCache.find(
            item =>
            item.id === id
        );

    if(!chamado)
        return;

    editId.value =
        chamado.id;

    editChamado.value =
        chamado.chamado || "";

    editMsisdn.value =
        chamado.linha || "";

    editEquipamento.value =
        chamado.equipamento || "";

    editCenario.value =
        chamado.cenario || "";

    editObservacoes.value =
        chamado.observacoes || "";

    abrirModal();

}

window.abrirModalEdicao =
    abrirModalEdicao;

// ======================================================
// CANCELAR EDIÇÃO
// ======================================================

document
.getElementById(
    "btnCancelarEdicao"
)
.addEventListener(
    "click",
    fecharModal
);

// ======================================================
// SALVAR EDIÇÃO
// ======================================================

document
.getElementById(
    "btnSalvarEdicao"
)
.addEventListener(
    "click",
    async () => {

        const id =
            editId.value;

        if(!id)
            return;

        const chamado =
            editChamado.value
                .trim()
                .toUpperCase();

        if(
            !validarChamado(
                chamado
            )
        ){

            alert(
                "O chamado deve iniciar com INC-"
            );

            return;

        }

        const linha =
            normalizarMsisdn(
                editMsisdn.value
            );

        if(
            linha.length !== 11
        ){

            alert(
                "MSISDN inválido."
            );

            return;

        }

        try{

            const original =
                chamadosCache.find(
                    item =>
                    item.id === id
                );

            await dbRef
                .ref(
                    "app/chamados/" + id
                )
                .update({

                    chamado,

                    linha,

                    equipamento:
                        editEquipamento.value,

                    cenario:
                        editCenario.value,

                    observacoes:
                        editObservacoes.value
                            .trim(),

                    analista:
                        original?.analista || "",

                    createdAt:
                        original?.createdAt ||
                        Date.now()

                });

            fecharModal();

            await carregarChamados();

            alert(
                "Chamado atualizado."
            );

        }
        catch(err){

            console.error(err);

            alert(
                "Erro ao atualizar."
            );

        }

    }
);

// ======================================================
// FECHAR CLICANDO FORA
// ======================================================

window.addEventListener(
    "click",
    event => {

        if(
            event.target ===
            modalEditar
        ){

            fecharModal();

        }

    }
);

// ======================================================
// LOGOUT
// ======================================================

document
.getElementById(
    "logoutBtn"
)
.addEventListener(
    "click",
    () => {

        logout();

    }
);

// ======================================================
// AUTO PESQUISA
// ======================================================

[
    fAnalista,
    fChamado,
    fLinha,
    fEquipamento,
    fCenario,
    fDataIni,
    fDataFim
]
.forEach(campo => {

    campo.addEventListener(
        "change",
        aplicarFiltros
    );

    campo.addEventListener(
        "keyup",
        aplicarFiltros
    );

});

// ======================================================
// SPS v4 FINAL
// ======================================================

console.log(
    "SPS v4 carregado."
);
