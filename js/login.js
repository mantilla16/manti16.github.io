

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;
    if (usuario.trim() === '' || clave.trim() === '' ){
        Swal.fire({
            title:"Todos los campos deben estar llenos.",
            icon:"error"
        });
    }else{
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/usuarios/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, clave })
            });
            if (!response.ok) {
                throw new Error('Failed to log in');
            }

            const result = await response.json();

            if (!result.access_token) {
                throw new Error('Token not found in response');
            }

            // Configura la fecha de expiración del token a 30 días en el futuro
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            
            // Guarda el token en el localStorage junto con su fecha de expiración
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('rol', result.rol);  // Guardamos el rol
            localStorage.setItem('usuario', usuario);  // Guardamos el usuario           
            localStorage.setItem('token_expiration', expirationDate.getTime());
            window.location.href = 'index.html';
        } catch (error) {
            document.getElementById('error-message').textContent = 'Inicio de sesion fallido.';
            document.getElementById('error-message').style.display = 'block';
        }
    }
});
