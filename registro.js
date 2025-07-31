document.getElementById('form-registro').addEventListener('submit', function (e) {
  e.preventDefault();

  const correo = document.getElementById('registro-correo').value.trim();
  const password = document.getElementById('registro-password').value;
  const error = document.getElementById('registro-error');

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const existe = usuarios.find(u => u.correo === correo);
  if (existe) {
    error.textContent = 'Ya existe un usuario con ese correo.';
    return;
  }

  usuarios.push({ correo, password });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioActivo', correo);

  window.location.href = 'grupos.html';
});
