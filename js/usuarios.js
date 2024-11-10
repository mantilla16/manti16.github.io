(function() {
    document.getElementById("ftabla").addEventListener("input", onInputChange);

    function onInputChange(){
        let inputText = document.getElementById("ftabla").value.toString().toLowerCase();
        let tbody = document.getElementById("tbody");
        let trow = tbody.getElementsByTagName("tr");
        for(let i = 0; i < trow.length; i++){
            let textSearch = trow[i].textContent.toString().toLocaleLowerCase();
            if(textSearch.indexOf(inputText) === -1){
                trow[i].style.display = "none";
            } else {
                trow[i].style.display = "";
            }
        }
    }

    let currentPage = 1;
    let pageSize = 10; // Tamaño de página predeterminado
    let hasNextPage = true;
    let totalRecords = 0; // Variable para almacenar el número total de registros
    const authToken = localStorage.getItem('access_token');
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json' // Ajusta el tipo de contenido según sea necesario
    };

    const baseurl ='http://127.0.0.1:8000/';

    // Función para hacer la primera petición
    function fetchDataFromApi(page, pageSize) {
        return fetch(`${baseurl}api/v1/usuarios/?page=${page}&page_size=${pageSize}`, {
            method: 'GET',
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            return response.json();
        });
    }

    document.getElementById('createUser').addEventListener('click', async function() {
        const nombreLargo = document.getElementById('nombrelargo').value;
        const usuario = document.getElementById('usuarioname').value;
        const clave = document.getElementById('clave').value;
        const rol = document.getElementById('selectRol').value;
        const estado = true;
        const Token = localStorage.getItem('access_token');

        if (nombreLargo.trim() === '' || usuario.trim() === '' || clave.trim() === '' || rol.trim() === '') {
            Swal.fire({
                title:"Todos los campos deben estar llenos.",
                icon:"error"
            });
        }else{
            const data = {
                nombre_largo: nombreLargo,
                usuario: usuario,
                clave: clave,
                rol: rol,
                estado: estado
            };
            try {    
                const response = await fetch(`${baseurl}api/v1/usuarios/create/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Token}`
                    },
                    body: JSON.stringify(data)
                });
        
                if (response.ok) {
                    const result = await response.json();
                    Swal.fire({
                        title:"Usuario creado exitosamente!",
                        icon:"success"
                    });
                    loadData(currentPage); // Recargar la tabla de usuarios
                } else {
                    const errorResult = await response.json();
                    Swal.fire({
                        title:"Error al crear el usuario.",
                        text: errorResult,
                        icon:"error"
                    });
                }
            } catch (error) {
                Swal.fire({
                    title:"Error en la solicitud.",
                    text: error,
                    icon:"error"
                });
            }
        }
    });
    
    function loadData(page) {
        if (!hasNextPage && page > 1) {
            return;
        }

        const size = pageSize === 'all' ? totalRecords : pageSize;

        fetchDataFromApi(page, size)
            .then(data => {
                totalRecords = data.count;
                $('#tbody').empty();

                if (data.results.length === 0) {
                    Swal.fire({
                        title:"No hay resultados para mostrar.",
                        icon:"info"
                    });
                } else {
                    $.each(data.results, function(index, item) {
                        let varestado;
                        if(item.estado == true){
                            varestado ='Activo';
                        }else{
                            varestado ='Inactivo';
                        }
                        $('#tbody').append(`
                            <tr>
                                <td>${item.nombre_largo}</td>
                                <td>${item.usuario}</td>
                                <td>${item.rol}</td>
                                <td>${varestado}</td>
                                <td><button class="btn btn-primary btn-sm edit-btn" data-id="${item.id}" data-nombre="${item.nombre_largo}" data-usuario="${item.usuario}" data-rol="${item.rol}" data-estado="${item.estado}" data-toggle="modal" data-target="#editarModal" title="Editar"><i class="fas fa-edit"></i></button></td>
                            </tr>`
                        );
                    });
                }

                hasNextPage = data.next !== null;
            })
            .catch(error => {
                Swal.fire({
                    title:"Error al cargar los datos.",
                    text: error,
                    icon:"error"
                });
            });
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            loadData(currentPage);
        }
    }

    function nextPage() {
        if (hasNextPage) {
            currentPage++;
            loadData(currentPage);
        } else {
            Swal.fire({
                title:"No hay más páginas disponibles.",
                icon:"info"
            });
        }
    }

    // Evento para cargar datos del usuario en el modal de edición
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        const nombre = $(this).data('nombre');
        const usuario = $(this).data('usuario');
        const rol = $(this).data('rol');
        const estado = $(this).data('estado');

        $('#editUserId').val(id);
        $('#editNombreLargo').val(nombre);
        $('#editUsuarioName').val(usuario);
        $('#editRol').val(rol);
        $('#editEstado').val(estado ? 'Activo' : 'Inactivo');
    });

    // Evento para actualizar el usuario
    document.getElementById('saveEditUser').addEventListener('click', async function() {
        const id = document.getElementById('editUserId').value;
        const nombreLargo = document.getElementById('editNombreLargo').value;
        const usuario = document.getElementById('editUsuarioName').value;
        const clave = document.getElementById('editclave').value;
        const rol = document.getElementById('editRol').value;
        const estado = document.getElementById('editEstado').value === 'Activo';
        const Token = localStorage.getItem('access_token');
        console.log(rol);
        if (nombreLargo.trim() === '' || usuario.trim() === '' || clave.trim() === '' || rol.trim() === '') {
            Swal.fire({
                title:"Todos los campos deben estar llenos.",
                icon:"error"
            });
        }else{
            const data = {
                nombre_largo: nombreLargo,
                usuario: usuario,
                clave: clave,
                rol: rol,
                estado: estado
            };
            try {
                const response = await fetch(`${baseurl}api/v1/usuarios/${id}/update/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Token}`
                    },
                    body: JSON.stringify(data)
                });
    
                if (response.ok) {
                    const result = await response.json();
                    Swal.fire({
                        title:"Usuario actualizado exitosamente!",
                        icon:"success"
                    });
                    loadData(currentPage); // Recargar la tabla de usuarios
                } else {
                    const errorResult = await response.json();
                    Swal.fire({
                        title:"Error al editar el usuario.",
                        text: errorResult,
                        icon:"error"
                    });
                }
            } catch (error) {
                Swal.fire({
                    title:"Error en la solicitud.",
                    text: error,
                    icon:"error"
                });
            }
        }
    });

    window.nextPage = nextPage;
    window.prevPage = prevPage;
    loadData(currentPage);
})();
