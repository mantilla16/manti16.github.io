// auth.js
/*
    Parte de validacion del usuario logueado: Validando que tenga el access_token.

    En este archivo manejamos que se haya almacenado el access_token de manera correcta, esto es porque el resto de enpoint solicitan un access_token
    para validar que la peticion sea hecha por un usario logueado y no permita una ejecucion de manera libre. 

    Este access_token tiene una durarcion de 30 dias(tiempo asignado en el login.js) o hasta que el usuario haga logout(limpieza del localStorage en sb-admin-2.js)

    1. Consultamos en el local storage con la funcion getItem('nombre_variable') la cual nos permite extraer la informacion alamacenada en cache.(Asignado en el archivo login.js)
    2. Guardamos la url de pagina en la que estamos actualmente, en este caso seria en el login.html. 
    3. Si no existe el token en el localStorage y si no estamos en la ruta de login.html redireccionamos de manera obligatoria a login.html
        De esta manera nos aseguramos que ningun usuario que este logueado pueda entrar a una pagina si conoce alguna extencion en la url, ejemplo, esto evita que un usuario ingrese
        en la url algo asi: http://pagina.com//index.html si pone esta ruta y no esta logueado automaticamente lo regresamos al login. 
    4. Lo ultimo es solamente para mostar en el index.html el nombre del usuario que se logueo, por ejemplo una etiqueta que dira Bienvenido, nombre_usuario.
        El nombre del usuario lo almacenamos primeramente en el archivo login.js y aca en auth.js lo consultamos en la localStorage.  
*/


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





