document.addEventListener('DOMContentLoaded', function () {
  const btnListo = document.querySelector('.listo');
  const mensajeError = document.getElementById('mensaje-error');
  const preview = document.getElementById("preview-icono");
  const inputFile = document.getElementById("input-imagen");
  const iconoSelect = document.getElementById("icono-select");
  const menu = document.getElementById("menu-seleccion");

  let imagenBase64 = null;
  let iconoSeleccionado = "👥";

  if (preview && menu) {
    preview.addEventListener("click", () => {
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
  }

  if (iconoSelect) {
    iconoSelect.addEventListener("change", () => {
      if (iconoSelect.value) {
        iconoSeleccionado = iconoSelect.value;
        imagenBase64 = null;
        preview.innerHTML = iconoSeleccionado;
      }
    });
  }

  if (inputFile) {
    inputFile.addEventListener("change", () => {
      const file = inputFile.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagenBase64 = e.target.result;
          iconoSeleccionado = null;
          preview.innerHTML = `<img src="${imagenBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" />`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const seleccion = JSON.parse(localStorage.getItem("seleccionGrupo"));
  if (seleccion) {
    if (seleccion.imagen) {
      imagenBase64 = seleccion.imagen;
      iconoSeleccionado = null;
      preview.innerHTML = `<img src="${imagenBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" />`;
    } else if (seleccion.icono) {
      iconoSeleccionado = seleccion.icono;
      imagenBase64 = null;
      preview.innerHTML = iconoSeleccionado;
    }
    localStorage.removeItem("seleccionGrupo");
  }

  
  btnListo.addEventListener('click', function (e) {
  e.preventDefault();

  const nombreGrupo = document.getElementById('nombre-grupo').value.trim();
  const correo = localStorage.getItem('usuarioActivo');
  const keyGrupos = 'grupos_' + correo;
  const grupos = JSON.parse(localStorage.getItem(keyGrupos)) || [];

  if (!nombreGrupo) {
    mensajeError.textContent = "Por favor ingresa un nombre para el grupo.";
    return;
  }

  const grupoExistente = grupos.find(g => g.nombre.toLowerCase() === nombreGrupo.toLowerCase());
  if (grupoExistente) {
    mensajeError.textContent = "Ya existe un grupo con ese nombre.";
    return;
  }

  const nuevoGrupo = {
    id: Date.now(),
    nombre: nombreGrupo,
    icono: iconoSeleccionado,
    imagen: imagenBase64
  };

  grupos.push(nuevoGrupo);
  localStorage.setItem(keyGrupos, JSON.stringify(grupos));
  window.location.href = "grupos.html";
});

    });
  
