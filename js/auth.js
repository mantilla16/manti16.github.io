// auth.js

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('access_token');
    const currentPage = window.location.pathname;

    if (!token && currentPage !== '/login.html') {
        // Si no hay token y la página actual no es la página de inicio de sesión, redirige al usuario al inicio de sesión
        window.location.href = 'login.html';
    }
});

var usuname = localStorage.getItem('usuario');
var variableContainer = document.getElementById("userDropdown");
variableContainer.innerHTML = "Bienvenido, "+usuname;





