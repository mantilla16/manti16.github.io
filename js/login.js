
/*
    Parte principal de la autenticacion: Consumiendo y almacenando la informacion para el logueo. 

    1. Tomamos lo que ingresa el usuario en el formulario y lo alamacenamos en las variables "usuario" y "clave".
    2. Validamos que esa informacion no venga vacia con un if y dentro del else manejamos un try catch porque usaremos un fetch para consumir el enpoint. 
    3. Enviamos una solicitud POST al enpoint mediante el uso de fetch, enviamos el usuario y clave que guardamos y validamos(primer punto). Esos datos lo enviamos en un JSON
       para eso usamos el JSON.stringify({variable1, variable2...})
    4. Validamos la respuesta que nos da el enpoint, 
        En el primer if validamos que se haya recibido una respuesta "ok" para el login y de ser asi almacenamos el response en una constante llamada result.
        En el segundo if validamos que venga el access_token ya que las consultas a los demas enpoint una vez dentro en la dash solicitan un acces_token. 
    5. Despues almacenamos las variables en el localStorage para usarlas en auth.js(Validamos que tipo de usuario se loguea), sb-admin-2.js(Validamos la vista del usuario de acuerdo a su tipo de rol)
    6. Redireccionamos si todo esta ok a la pagina del index.html.
*/

/*
    Nota: Podemos manejar la informacion del login de varias formas, todo depende de donde tomemos la informacion del logueo. En este caso viene desde un enpoint que ya tiene sus propias validaciones y nos devuelve cierta informacion como el rol, nombre de usuario, token... 
    por ejemoplo, si la info viniera de un array se tendria que recorrer el array en vez de hacer un fetch.
    Es importante almacenar la informacion en el cache para asi poder usarlo en cualquier parte del codigo, como informacion para hacer alguna condicion en el front o cosas asi. 
*/

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
