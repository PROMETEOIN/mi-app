document.getElementById('form-login').addEventListener('submit', function (e) {
  e.preventDefault();

  const correo = document.getElementById('login-correo').value.trim();
  const password = document.getElementById('login-password').value;
  const error = document.getElementById('login-error');

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuario = usuarios.find(u => u.correo === correo && u.password === password);

  if (!usuario) {
    error.textContent = 'Credenciales inválidas.';
    return;
  }

  localStorage.setItem('usuarioActivo', correo);
  window.location.href = 'grupos.html';
});
