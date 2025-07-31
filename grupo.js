document.addEventListener('DOMContentLoaded', function () {
  // --- OBTENER DATOS DEL GRUPO ---
  const urlParams = new URLSearchParams(window.location.search);
  const grupoId = parseInt(urlParams.get('id'), 10);
  const correo = localStorage.getItem('usuarioActivo');
  const keyGrupos = 'grupos_' + correo;
  const grupos = JSON.parse(localStorage.getItem(keyGrupos)) || [];

  const grupo = grupos.find(g => g.id === grupoId);
  if (!grupo) {
    alert('Grupo no encontrado');
    return;
  }
  document.getElementById('nombre-grupo').textContent = grupo.nombre;
  const avatar = document.getElementById('grupo-avatar');
if (grupo.imagen) {
  avatar.innerHTML = `<img src="${grupo.imagen}" alt="Imagen del grupo" />`;
} else if (grupo.icono) {
  avatar.textContent = grupo.icono;
} else {
  avatar.textContent = "👥"; // ícono por defecto
}


  // --- FUNCIONALIDAD MIEMBROS ---
  const btnAnadirMiembro = document.getElementById('btn-anadir');
  const contenidoFormulario = document.getElementById('formulario-miembro');
  const closeMiembro = document.getElementById('cerrar-miembro');
  const formMiembro = document.getElementById('form-miembro');
  const errorDuplicado = document.getElementById('error-duplicado');

  btnAnadirMiembro.addEventListener('click', () => contenidoFormulario.style.display = 'block');
  closeMiembro.addEventListener('click', () => contenidoFormulario.style.display = 'none');

  formMiembro.addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-miembro').value.trim();
    const correo = document.getElementById('correo-miembro').value.trim();
        if (!nombre) {
      alert('El nombre es obligatorio');
      return;
    }
    const correoExiste = correo && grupo.miembros && grupo.miembros.some(m => m.correo && m.correo.toLowerCase() === correo.toLowerCase());
    if (correoExiste) {
      errorDuplicado.textContent = '¡El correo ya pertenece a otro miembro!';
      errorDuplicado.style.display = 'block';
      return;
    }
    const miembroExiste = grupo.miembros && grupo.miembros.some(m => m.nombre === nombre && m.correo === correo);
    if (miembroExiste) {
      errorDuplicado.textContent = '¡El miembro ya existe!';
      errorDuplicado.style.display = 'block';
      return;
    }
    errorDuplicado.style.display = 'none';
    const nuevoMiembro = { nombre, correo };
    if (!grupo.miembros) grupo.miembros = [];
    grupo.miembros.push(nuevoMiembro);
    guardarGrupos();
    renderizarMiembros();
    formMiembro.reset();
    contenidoFormulario.style.display = 'none';
  });

  const btnEliminarGrupo = document.getElementById('eliminar-grupo');
if (btnEliminarGrupo) {
  btnEliminarGrupo.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
      const gruposActualizados = grupos.filter(g => g.id !== grupoId);
      localStorage.setItem(keyGrupos, JSON.stringify(gruposActualizados));
      localStorage.removeItem('pagosRealizados_' + grupoId);
      window.location.href = 'grupos.html';
    }
  });
}


  document.getElementById('toggle-miembros').addEventListener('click', () => {
    const lista = document.getElementById('lista-miembros');
    lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
  });

  function renderizarMiembros() {
    const ul = document.getElementById('miembros-ul');
    ul.innerHTML = '';
    if (grupo.miembros) {
      grupo.miembros.forEach((m, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${m.nombre} (${m.correo || 'sin correo'})</span>
          <button class="editar-miembro" data-index="${i}">✏️</button>
          <button class="eliminar-miembro" data-index="${i}">🗑️</button>
        `;
        ul.appendChild(li);
      });
    }
  }

  document.getElementById('miembros-ul').addEventListener('click', (e) => {
    const idx = e.target.getAttribute('data-index');
    if (e.target.classList.contains('editar-miembro')) {
      const m = grupo.miembros[idx];
      const nuevoNombre = prompt('Nuevo nombre:', m.nombre);
      if (nuevoNombre) {
        m.nombre = nuevoNombre.trim();
        m.correo = prompt('Nuevo correo:', m.correo || '').trim();
        guardarGrupos();
        renderizarMiembros();
      }
    }
    if (e.target.classList.contains('eliminar-miembro')) {
      if (confirm('¿Seguro que deseas eliminar este miembro?')) {
        grupo.miembros.splice(idx, 1);
        guardarGrupos();
        renderizarMiembros();
      }
    }
  });

function guardarGrupos() {
  const idxG = grupos.findIndex(g => g.id === grupoId);
  grupos[idxG] = grupo;
  localStorage.setItem(keyGrupos, JSON.stringify(grupos)); // ✅ guarda por usuario
}


  // ---- FUNCIONALIDAD GASTOS ----
  let editingGastoIndex = null;
  const btnAnadirGasto     = document.getElementById('btn-anadir-gasto');
  const modalGasto         = document.getElementById('modal-gasto');
  const closeGasto         = document.getElementById('cerrar-modal');
  const botonDividir       = document.getElementById('boton-dividir');
  const detalleDividir     = document.getElementById('detalle-dividir');
  const participantesDiv   = document.getElementById('participantes-checkboxes');
  const guardarGastoBtn    = document.getElementById('guardar-gasto');
  const ulGastos           = document.getElementById('gastos-ul');

  btnAnadirGasto.addEventListener('click', () => {
  if (!grupo.miembros || grupo.miembros.length === 0) {
  const alerta = document.getElementById('alerta-miembros');
  if (alerta) {
    alerta.style.display = 'block';
    alerta.style.animation = 'none'; // reinicia animación si se repite
    alerta.offsetHeight; // fuerza repaint
    alerta.style.animation = '';
    alerta.classList.add('alerta-visual');

    setTimeout(() => {
      alerta.style.display = 'none';
    }, 3000);
  }
  return;
}


  // Si hay miembros, continúa con lo normal
  editingGastoIndex = null;
  resetModalGasto();
  modalGasto.style.display = 'block';
});

  closeGasto.addEventListener('click', () => modalGasto.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modalGasto) modalGasto.style.display = 'none'; });

  botonDividir.addEventListener('click', function (e) {
    e.preventDefault();
    participantesDiv.innerHTML = '';
    let html = '<label>Pagado por:</label><select id="pagado-por">';
    html += `<option value="Tú">Tú</option>`;
    grupo.miembros.forEach(m => {
      html += `<option value="${m.nombre}">${m.nombre}</option>`;
    });
    html += '</select><hr>';
    participantesDiv.innerHTML = html;
    grupo.miembros.forEach(m => {
      const chkId = 'chk-' + m.nombre.replace(/\s+/g, '');
      participantesDiv.insertAdjacentHTML('beforeend',
        `<label><input type="checkbox" id="${chkId}" value="${m.nombre}" checked> ${m.nombre}</label><br>`
      );
    });
    detalleDividir.style.display = 'block';
  });

  guardarGastoBtn.addEventListener('click', function () {
    const desc = document.getElementById('descripcion-gasto').value.trim();
    const monto = parseFloat(document.getElementById('monto-gasto').value);
    if (!desc || isNaN(monto) || monto <= 0) {
      alert('Por favor, completa los campos correctamente.');
      return;
    }
    const pagadorSel = document.getElementById('pagado-por');
    const pagadoPor = pagadorSel ? pagadorSel.value : 'Tú';
    const seleccion = Array.from(participantesDiv.querySelectorAll('input[type=checkbox]'))
                           .filter(ch => ch.checked)
                           .map(ch => ch.value);
    const cuota = monto / (seleccion.length || 1);
    const nuevoG = { descripcion: desc, monto, pagadoPor, participantes: seleccion, share: cuota };
    if (!grupo.gastos) grupo.gastos = [];
    if (editingGastoIndex === null) grupo.gastos.push(nuevoG);
    else {
      grupo.gastos[editingGastoIndex] = nuevoG;
      editingGastoIndex = null;
    }
    guardarGrupos();
    modalGasto.style.display = 'none';
    resetModalGasto();
    renderizarGastos();
  });

  ulGastos.addEventListener('click', function (e) {
    const idx = e.target.dataset.idx;
    if (!idx) return;
    if (e.target.classList.contains('toggle-detalle')) {
      const det = document.getElementById('detalle-' + idx);
      det.style.display = det.style.display === 'none' ? 'block' : 'none';
    }
    if (e.target.classList.contains('eliminar-gasto')) {
      if (confirm('¿Seguro que deseas eliminar este gasto?')) {
        grupo.gastos.splice(idx, 1);
        guardarGrupos();
        renderizarGastos();
      }
    }
    if (e.target.classList.contains('editar-gasto')) {
      editingGastoIndex = parseInt(idx, 10);
      const g = grupo.gastos[editingGastoIndex];
      document.getElementById('descripcion-gasto').value = g.descripcion;
      document.getElementById('monto-gasto').value = g.monto;
      botonDividir.click();
      document.getElementById('pagado-por').value = g.pagadoPor;
      participantesDiv.querySelectorAll('input[type=checkbox]').forEach(ch => {
        ch.checked = g.participantes.includes(ch.value);
      });
      modalGasto.style.display = 'block';
    }
  });

  // --- ACTUALIZACIÓN: renderizarGastos con faltantes individuales
  function renderizarGastos() {
    const ul = document.getElementById('gastos-ul');
    ul.innerHTML = '';
    let pagosRealizados = JSON.parse(localStorage.getItem('pagosRealizados_' + grupoId)) || [];
    if (grupo.gastos && grupo.gastos.length) {
      grupo.gastos.forEach((g, idx) => {
        const li = document.createElement('li');
        li.className = 'gasto-item';
        // Calcula faltantes por miembro
        let faltantes = "";
        g.participantes.forEach(nombre => {
          if (nombre !== g.pagadoPor) {
            // Suma pagos realizados por este deudor y gasto
            let pagado = pagosRealizados
              .filter(p => p.gastoDescripcion === g.descripcion && p.deudor === nombre && p.acreedor === g.pagadoPor)
              .reduce((acum, p) => acum + p.monto, 0);
            let resta = Math.max(0, g.share - pagado);
            faltantes += `<div style="margin-left:1em;">- ${nombre}: $${resta.toFixed(2)}</div>`;
          }
        });
        li.innerHTML = `
          <div class="gasto-resumen">
            ${g.descripcion}: $${g.monto.toFixed(2)}
            <button class="toggle-detalle" data-idx="${idx}">➕</button>
            <button class="editar-gasto" data-idx="${idx}">✏️</button>
            <button class="eliminar-gasto" data-idx="${idx}">🗑️</button>
          </div>
          <div class="gasto-detalle" id="detalle-${idx}" style="display:none; margin-left:1em;">
            <p><strong>Pagado por:</strong> ${g.pagadoPor}</p>
            <p><strong>Participantes:</strong> ${g.participantes.join(', ')}</p>
            <p><strong>Cada uno le debe:</strong> $${g.share.toFixed(2)} a ${g.pagadoPor}</p>
            <div><strong>Faltante por miembro:</strong></div>
            ${faltantes}
          </div>
        `;
        ul.appendChild(li);
      });
    } else {
      ul.innerHTML = '<li style="color:gray;">Aún no hay gastos.</li>';
    }
  }

  function resetModalGasto() {
    document.getElementById('descripcion-gasto').value = '';
    document.getElementById('monto-gasto').value = '';
    detalleDividir.style.display = 'none';
    participantesDiv.innerHTML = '';
  }

  renderizarMiembros();
  renderizarGastos();

  // ---- LIQUIDAR GASTOS ----
  const btnLiquidar = document.getElementById('btn-liquidar-gasto');
  const modalLiquidar = document.getElementById('modal-liquidar');
  const closeLiquidar = document.getElementById('cerrar-liquidar');
  const liquidacionesUl = document.getElementById('liquidaciones-ul');
  let currentDebts = [];

  // Abrir modal de liquidar
  btnLiquidar.addEventListener('click', () => {
  // Siempre recarga pagos desde localStorage al abrir el modal
  let pagosRealizados = JSON.parse(localStorage.getItem('pagosRealizados_' + grupoId)) || [];
  currentDebts = [];
  (grupo.gastos || []).forEach(g => {
    g.participantes.forEach(p => {
      if (p !== g.pagadoPor) {
        // Suma pagos ya realizados para este gasto, deudor y acreedor
        let pagado = pagosRealizados
          .filter(q => q.gastoDescripcion === g.descripcion && q.deudor === p && q.acreedor === g.pagadoPor)
          .reduce((a, q) => a + q.monto, 0);
        let faltante = g.share - pagado;
        if (faltante > 0.009) {
          currentDebts.push({
            deudor: p,
            acreedor: g.pagadoPor,
            monto: faltante,
            gastoDescripcion: g.descripcion
          });
        }
      }
    });
  });
  renderizarDeudas();
  modalLiquidar.style.display = 'block';
});


  // Cerrar modal liquidar
  closeLiquidar.addEventListener('click', () => modalLiquidar.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modalLiquidar) modalLiquidar.style.display = 'none';
  });

  // =========== MODAL DE PAGO DE DEUDA =============
  let deudaActual = null;
  let idxActual = null;

  const modalPago = document.getElementById('modal-pago');
  const cerrarPago = document.getElementById('cerrar-pago');
  const pagoTitulo = document.getElementById('pago-titulo');
  const pagoDescripcion = document.getElementById('pago-descripcion');
  const inputCantidadPago = document.getElementById('input-cantidad-pago');
  const confirmarPago = document.getElementById('confirmar-pago');

  liquidacionesUl.addEventListener('click', function(e) {
    if (e.target.classList.contains('liquidar-btn')) {
      idxActual = parseInt(e.target.dataset.idx, 10);
      deudaActual = currentDebts[idxActual];
      if (!deudaActual) return;
      pagoTitulo.textContent = 'Pagar deuda';
      pagoDescripcion.textContent = `${deudaActual.deudor} le debe a ${deudaActual.acreedor}`;
      inputCantidadPago.value = deudaActual.monto.toFixed(2);
      inputCantidadPago.max = deudaActual.monto.toFixed(2);
      modalPago.style.display = 'block';
    }
  });

  cerrarPago.addEventListener('click', () => {
    modalPago.style.display = 'none';
    deudaActual = null;
    idxActual = null;
  });
  window.addEventListener('click', (e) => {
    if (e.target === modalPago) {
      modalPago.style.display = 'none';
      deudaActual = null;
      idxActual = null;
    }
  });

  // SOLO UN HANDLER de confirmación de pago, para evitar duplicados
  confirmarPago.addEventListener('click', () => {
    const cantidad = parseFloat(inputCantidadPago.value);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Introduce un monto válido.');
      return;
    }
    if (cantidad > deudaActual.monto + 0.01) {
      alert('No puedes pagar más de lo que debes.');
      return;
    }

    // Guardar el pago en localStorage, ahora con fecha/hora
    let pagosRealizados = JSON.parse(localStorage.getItem('pagosRealizados_' + grupoId)) || [];
    pagosRealizados.push({
      deudor: deudaActual.deudor,
      acreedor: deudaActual.acreedor,
      monto: cantidad,
      gastoDescripcion: deudaActual.gastoDescripcion || "",
      fecha: new Date().toLocaleString("es-MX")
    });
    localStorage.setItem('pagosRealizados_' + grupoId, JSON.stringify(pagosRealizados));

    modalPago.style.display = 'none';
    deudaActual = null;
    idxActual = null;

    // Recalcula todas las deudas con los pagos registrados
    currentDebts = [];
    (grupo.gastos || []).forEach(g => {
      g.participantes.forEach(p => {
        if (p !== g.pagadoPor) {
          let pagado = pagosRealizados
            .filter(q => q.gastoDescripcion === g.descripcion && q.deudor === p && q.acreedor === g.pagadoPor)
            .reduce((a, q) => a + q.monto, 0);
          let faltante = g.share - pagado;
          if (faltante > 0.009) {
            currentDebts.push({
              deudor: p,
              acreedor: g.pagadoPor,
              monto: faltante,
              gastoDescripcion: g.descripcion
            });
          }
        }
      });
    });

    renderizarDeudas();
    renderizarGastos();
    renderizarHistorialPagos(); // Actualiza historial tras cada pago
  });

  function renderizarDeudas() {
    liquidacionesUl.innerHTML = '';
    currentDebts.forEach((d, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${d.deudor} le debe $${d.monto.toFixed(2)} a ${d.acreedor}
        <button class="liquidar-btn" data-idx="${i}">Pagar</button>
      `;
      liquidacionesUl.appendChild(li);
    });
    if (currentDebts.length === 0) {
      liquidacionesUl.innerHTML = '<li style="color:gray;">¡No hay deudas pendientes!</li>';
    }
  }

  // ----- HISTORIAL DE PAGOS EN MODAL -----
  const btnHistorial = document.getElementById('btn-historial-pagos');
  const modalHistorial = document.getElementById('modal-historial');
  const cerrarHistorial = document.getElementById('cerrar-historial');
  const historialUl = document.getElementById('historial-ul');
  const btnLimpiarHistorial = document.getElementById('limpiar-historial');

 function renderizarHistorialPagos() {
  let pagosRealizados = JSON.parse(localStorage.getItem('pagosRealizados_' + grupoId)) || [];
  if (!historialUl) return;

  const filtro = document.getElementById('buscador-historial')?.value?.toLowerCase() || "";

  const pagosFiltrados = pagosRealizados.filter(p =>
    p.deudor.toLowerCase().includes(filtro) // ← Solo compara con el pagador
  );

  historialUl.innerHTML = '';

  if (pagosFiltrados.length === 0) {
    historialUl.innerHTML = '<li style="color:gray;">No se encontraron pagos.</li>';
    return;
  }

  pagosFiltrados.forEach(pago => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>
        <strong>${pago.deudor}</strong> pagó <strong>$${pago.monto.toFixed(2)}</strong> a <strong>${pago.acreedor}</strong>
        ${pago.gastoDescripcion ? `por <em>${pago.gastoDescripcion}</em>` : ""}
        <br>
        <small style="color:#888;">${pago.fecha ? pago.fecha : ''}</small>
      </span>
    `;
    historialUl.appendChild(li);
  });
}
const buscadorHistorial = document.getElementById('buscador-historial');
if (buscadorHistorial) {
  buscadorHistorial.addEventListener('input', renderizarHistorialPagos);
}


  btnHistorial.addEventListener('click', () => {
    renderizarHistorialPagos();
    modalHistorial.style.display = 'block';
  });
  cerrarHistorial.addEventListener('click', () => {
    modalHistorial.style.display = 'none';
  });
  window.addEventListener('click', e => {
    if (e.target === modalHistorial) modalHistorial.style.display = 'none';
  });

  // BOTÓN LIMPIAR HISTORIAL
  if (btnLimpiarHistorial) {
    btnLimpiarHistorial.addEventListener('click', () => {
      if(confirm('¿Seguro que quieres borrar TODO el historial de pagos?')) {
        localStorage.removeItem('pagosRealizados_' + grupoId);
        renderizarHistorialPagos();
      }
    });
  }

});
