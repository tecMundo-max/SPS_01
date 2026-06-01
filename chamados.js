// SysSpsHjr – Chamados
// Versão: v2.1.8
// CORREÇÃO FINAL: analista explicitamente enviado ao Firebase

const session = requireAuth();
const dbRef = firebase.database();

/* ===== CAMPOS ===== */
const form = document.getElementById("formChamado");
const inAnalista = document.getElementById("analista");
const inChamado = document.getElementById("chamado");
const inMsisdn = document.getElementById("msisdn");
const selEquip = document.getElementById("equipamentoSelect");
const selCen = document.getElementById("cenarioSelect");
const inObs = document.getElementById("observacoes");
const tbody = document.querySelector("#tblChamados tbody");

function validarChamado(valor) {
  if (!valor) return false;

  // normaliza
  const v = valor.trim().toUpperCase();

  // regra do original
 // return v.startsWith("PDST-");
  return v.startsWith("INC-");
}



/* ===== INICIALIZA ANALISTA (APENAS PARA UI) ===== */
inAnalista.value = session?.username || ""; 
// OBS: apenas preenche a tela. NÃO usamos session para salvar.

/* ===== MSISDN (máscara + normalização) ===== */
inMsisdn.addEventListener("input", () => {
  let v = inMsisdn.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1 $2");
  if (v.length > 8) v = v.replace(/^(\d{2}) (\d{5})(\d)/, "$1 $2-$3");
  inMsisdn.value = v;
});

function normalizarMsisdn(v) {
  return v.replace(/\D/g, "").slice(0, 11);
}

/* ===== CARREGAR LISTAS ===== */
async function carregarListas() {
  const eqSnap = await dbRef.ref("app/listas/equipamentos").once("value");
  const cenSnap = await dbRef.ref("app/listas/cenarios").once("value");

  selEquip.innerHTML = `<option value="">(selecione)</option>`;
  selCen.innerHTML = `<option value="">(selecione)</option>`;

  (eqSnap.val() || []).forEach(e => {
    selEquip.innerHTML += `<option value="${e}">${e}</option>`;
  });

  (cenSnap.val() || []).forEach(c => {
    selCen.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

/* ===== SALVAR CHAMADO (PONTO CRÍTICO) ===== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 🔥 ESTE É O PONTO QUE FALTAVA
  const analista = inAnalista.value.trim();
  
const chamadoRaw = inChamado.value;
const chamado = chamadoRaw.trim().toUpperCase();

if (!validarChamado(chamado)) {
  alert("O chamado deve começar com INC-");
  inChamado.focus();
  return;
}

  const linha = normalizarMsisdn(inMsisdn.value);

  if (!analista || !chamado || linha.length !== 11) {
    alert("Preencha Analista, Chamado e MSISDN corretamente");
    return;
  }

  // 🔥 PAYLOAD EXPLÍCITO
  const payload = {
    analista: analista,   // <<< AGORA SIM É ENVIADO
    chamado: chamado,
    linha: linha,
    equipamento: selEquip.value,
    cenario: selCen.value,
    observacoes: inObs.value.trim(),
    createdAt: Date.now(),
    deleted: false
  };

  try {
    await dbRef.ref("app/chamados").push(payload);

    form.reset();

    // mantém o analista após reset (igual ao original)
    inAnalista.value = analista;

    carregarChamados();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao salvar chamado");
  }
});

/* ===== LISTAR CHAMADOS ===== */
async function carregarChamados() {
  tbody.innerHTML = "";

  const snap = await dbRef.ref("app/chamados").limitToLast(100).once("value");
  const dados = snap.val();
  if (!dados) return;

  Object.values(dados)
    .filter(c => !c.deleted)
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td>${new Date(c.createdAt).toLocaleString()}</td>
          <td>${c.analista}</td>
          <td>${c.chamado}</td>
          <td>${c.linha}</td>
          <td>${c.equipamento || "-"}</td>
          <td>${c.cenario || "-"}</td>
        </tr>
      `;
    });
}

/* ===== LOGOUT ===== */
document.getElementById("logoutBtn").onclick = () => logout();

/* ===== BOOT ===== */
carregarListas();
carregarChamados();
