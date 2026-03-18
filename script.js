
document.addEventListener("DOMContentLoaded", function () {


  if (document.getElementById("formHistoria")) {

    const historiaSalva = localStorage.getItem("historiaGrupo");

    if (historiaSalva) {
      document.getElementById("historiaTexto").innerText = historiaSalva;
      document.getElementById("historiaInput").value = historiaSalva;
    }

    document.getElementById("formHistoria").addEventListener("submit", function(e) {
      e.preventDefault();

      const input = document.getElementById("historiaInput");
      const erro = document.getElementById("erroHistoria");

      const texto = input.value.trim();

      if (!texto) {
        erro.textContent = "Digite a história antes de salvar.";
        input.classList.add("input-error");
        return;
      }

      erro.textContent = "";
      input.classList.remove("input-error");

      localStorage.setItem("historiaGrupo", texto);
      document.getElementById("historiaTexto").innerText = texto;

      alert("História salva com sucesso!");
    });

    window.limparHistoria = function () {
      if (confirm("Tem certeza que deseja apagar a história?")) {
        localStorage.removeItem("historiaGrupo");

        document.getElementById("historiaTexto").innerText = "A história ainda não foi escrita.";
        document.getElementById("historiaInput").value = "";
      }
    };
  }



  if (document.getElementById("formInvest")) {

    let investimentos = JSON.parse(localStorage.getItem("Investimentos") || "[]");
    let chart;
    let editIndex = null;

    function formatBRL(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
    }

    function atualizarResumo() {
      const total = investimentos.reduce((s, it) => s + Number(it.valor || 0), 0);
      document.getElementById("totalInvest").innerText = formatBRL(total);
    }

    function renderInvestimentos() {
      const ul = document.getElementById("listaInvestimentos");
      ul.innerHTML = "";

      investimentos.forEach((it, idx) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <strong>${it.nome}</strong> — ${formatBRL(it.valor)}
          <div class="flex-row">
            <button onclick="abrirModalInvest(${idx})">Editar</button>
            <button onclick="removerInvestimento(${idx})">Remover</button>
          </div>
        `;

        ul.appendChild(li);
      });

      atualizarResumo();
      atualizarGrafico();
    }

    document.getElementById("formInvest").addEventListener("submit", function(e) {
      e.preventDefault();

      const nomeInput = document.getElementById("nomeInvest");
      const valorInput = document.getElementById("valorInvest");
      const erro = document.getElementById("erroInvest");

      const nome = nomeInput.value.trim();
      const valor = parseFloat(valorInput.value);

      if (!nome || isNaN(valor) || valor <= 0) {
        erro.textContent = "Preencha nome e valor válido.";
        nomeInput.classList.add("input-error");
        valorInput.classList.add("input-error");
        return;
      }

      erro.textContent = "";
      nomeInput.classList.remove("input-error");
      valorInput.classList.remove("input-error");

      investimentos.push({ nome, valor });
      localStorage.setItem("Investimentos", JSON.stringify(investimentos));

      nomeInput.value = "";
      valorInput.value = "";

      renderInvestimentos();
    });

    window.removerInvestimento = function(i) {
      if (!confirm("Remover este investimento?")) return;

      investimentos.splice(i, 1);
      localStorage.setItem("Investimentos", JSON.stringify(investimentos));
      renderInvestimentos();
    };

    window.abrirModalInvest = function(i) {
      editIndex = i;

      document.getElementById("modalInvest").style.display = "flex";
      document.getElementById("editNome").value = investimentos[i].nome;
      document.getElementById("editValor").value = investimentos[i].valor;
    };

    window.fecharModalInvest = function() {
      document.getElementById("modalInvest").style.display = "none";
    };

    window.salvarEdicao = function() {
      const nome = document.getElementById("editNome").value.trim();
      const valor = parseFloat(document.getElementById("editValor").value);

      if (!nome || isNaN(valor) || valor <= 0) {
        alert("Preencha nome e valor válido");
        return;
      }

      investimentos[editIndex] = { nome, valor };
      localStorage.setItem("Investimentos", JSON.stringify(investimentos));

      fecharModalInvest();
      renderInvestimentos();
    };

    window.limparInvestimentos = function() {
      if (!confirm("Apagar todos os investimentos?")) return;

      investimentos = [];
      localStorage.setItem("Investimentos", JSON.stringify(investimentos));
      renderInvestimentos();
    };

    function atualizarGrafico() {
      const canvas = document.getElementById("grafico");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      const labels = investimentos.map((it, i) => `${i + 1}. ${it.nome}`);
      const data = investimentos.map(it => it.valor);

      if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
        return;
      }

      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Investimentos (R$)",
            data,
            backgroundColor: "#c0392b"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    renderInvestimentos();
  }
  if (document.getElementById("formMembro")) {

  let membros = JSON.parse(localStorage.getItem("membros") || "[]");

  function salvarMembros() {
    localStorage.setItem("membros", JSON.stringify(membros));
  }

  function renderMembros() {
    const container = document.getElementById("listaMembros");
    container.innerHTML = "";

    membros.forEach((m, i) => {
      const div = document.createElement("div");
      div.classList.add("membro");

      div.innerHTML = `
        ${m.foto ? `<img src="${m.foto}" alt="Foto de ${m.nome}">` : ""}
        <h3>${m.nome}</h3>
        <p>${m.cargo}</p>
        <button onclick="removerMembro(${i})">Remover</button>
      `;

      container.appendChild(div);
    });
  }

  document.getElementById("formMembro").addEventListener("submit", function(e) {
    e.preventDefault();

    const nomeInput = document.getElementById("nomeMembro");
    const cargoInput = document.getElementById("cargoMembro");
    const fileInput = document.getElementById("fotoMembro");
    const erro = document.getElementById("erroMembro");

    const nome = nomeInput.value.trim();
    const cargo = cargoInput.value.trim();
    const file = fileInput.files[0];

    if (!nome || !cargo) {
      erro.textContent = "Preencha nome e cargo!";
      nomeInput.classList.add("input-error");
      cargoInput.classList.add("input-error");
      return;
    }

    erro.textContent = "";
    nomeInput.classList.remove("input-error");
    cargoInput.classList.remove("input-error");

    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        membros.push({ nome, cargo, foto: e.target.result });
        salvarMembros();
        renderMembros();
      };
      reader.readAsDataURL(file);
    } else {
      membros.push({ nome, cargo, foto: null });
      salvarMembros();
      renderMembros();
    }

    nomeInput.value = "";
    cargoInput.value = "";
    fileInput.value = "";
  });

  window.removerMembro = function(i) {
    membros.splice(i, 1);
    salvarMembros();
    renderMembros();
  };

  window.limparMembros = function() {
    if (confirm("Deseja apagar todos os membros?")) {
      membros = [];
      salvarMembros();
      renderMembros();
    }
  };

  renderMembros();
}

 if (document.getElementById("formRecado")) {

  let recados = JSON.parse(localStorage.getItem("recados") || "[]");

  function salvarRecados() {
    localStorage.setItem("recados", JSON.stringify(recados));
  }

  function renderRecados() {
    const ul = document.getElementById("listaRecados");
    ul.innerHTML = "";

    recados.slice().reverse().forEach((r) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${r.autor}</strong>
        <span class="small-muted">(${r.data})</span>
        <div style="margin-top:6px">${r.texto}</div>
      `;

      ul.appendChild(li);
    });
  }

  document.getElementById("formRecado").addEventListener("submit", function(e) {
    e.preventDefault();

    const autorInput = document.getElementById("autorRecado");
    const textoInput = document.getElementById("textoRecado");
    const erro = document.getElementById("erroRecado");

    const autor = autorInput.value.trim() || "Anônimo";
    const texto = textoInput.value.trim();

    if (!texto) {
      erro.textContent = "Digite o recado!";
      textoInput.classList.add("input-error");
      return;
    }

    erro.textContent = "";
    textoInput.classList.remove("input-error");

    recados.push({
      autor,
      texto,
      data: new Date().toLocaleString()
    });

    salvarRecados();
    renderRecados();

    autorInput.value = "";
    textoInput.value = "";
  });

  window.limparRecados = function() {
    if (!confirm("Apagar todos os recados?")) return;

    recados = [];
    localStorage.removeItem("recados");
    renderRecados();
  };

  // ATUALIZA ENTRE ABAS 🔥
  window.addEventListener("storage", (e) => {
    if (e.key === "recados") {
      recados = JSON.parse(localStorage.getItem("recados") || "[]");
      renderRecados();
    }
  });

  renderRecados();
}

});
