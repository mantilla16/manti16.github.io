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
        return fetch(`${baseurl}api/v1/servicioxambito/?page=${page}&page_size=${pageSize}`, {
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
                        title: "No hay resultados para mostrar.",
                        icon: "info"
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
                                <td>${item.CodigoRef}</td>
                                <td>${item.tipo}</td>
                                <td>${item.ambito}</td>
                                <td>${varestado}</td>
                                <td><button class="btn btn-primary btn-sm edit-btn" data-id="${item.id}" data-codigo="${item.CodigoRef}" data-tipo="${item.tipo}" data-ambito="${item.ambito}" data-estado="${item.estado}" data-toggle="modal" data-target="#editarModal" title="Editar"><i class="fas fa-edit"></i></button></td>
                            </tr>`
                        );
                    });
                }


                hasNextPage = data.next !== null;
            })
            .catch(error => {
                Swal.fire({
                    title:"Error al cargar los datos",
                    text: error.message,
                    icon:"error"
                });
            });
    }


        // Manejar el cambio en el campo de tipo para el formulario crear
        $('#createtipo').change(function () {
            const selectedOption = $(this).val();
            let ambitoValue = '';
            switch (selectedOption) {
                case 'AMBULATORIO':
                    ambitoValue = 1;
                    break;
                case 'HOSPITALARIO':
                    ambitoValue = 2;
                    break;
                case 'URGENCIAS':
                    ambitoValue = 3;
                    break;
                default:
                    ambitoValue = '';
            }
            $('#createfAmbito').val(ambitoValue);
        });

    //Evento para crear el ambito
    document.getElementById('createAmbito').addEventListener('click', async function() {
        const codigo_referencia = document.getElementById('createCodref').value;
        const tipo = document.getElementById('createtipo').value;
        const ambito = document.getElementById('createfAmbito').value;
        const estado = true;
        const Token = localStorage.getItem('access_token');
        if (codigo_referencia.trim() === '' || tipo.trim() === '' || ambito.trim() === '') {
            Swal.fire({
                title:"Todos los campos deben estar llenos.",
                icon:"error"
            });
        } else {
            const data = {
                CodigoRef: codigo_referencia,
                tipo: tipo,
                ambito: ambito,
                estado: estado
            };    
            try {    
                const response = await fetch(`${baseurl}api/v1/servicioxambito/create/`, {
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
                        title:"Usuario creado exitosamente!.",
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

            // Manejar el cambio en el campo de tipo para el formulario crear
            $('#editTipo').change(function () {
                const selectedOption = $(this).val();
                let ambitoValue = '';
                switch (selectedOption) {
                    case 'AMBULATORIO':
                        ambitoValue = 1;
                        break;
                    case 'HOSPITALARIO':
                        ambitoValue = 2;
                        break;
                    case 'URGENCIAS':
                        ambitoValue = 3;
                        break;
                    default:
                        ambitoValue = '';
                }
                $('#editAmbito').val(ambitoValue);
            });

        // Evento para cargar datos del usuario en el modal de edición
        $(document).on('click', '.edit-btn', function() {
            const id = $(this).data('id');
            const codRef = $(this).data('codigo');
            const tipo = $(this).data('tipo');
            const ambito = $(this).data('ambito');
            const estado = $(this).data('estado');
    
            $('#editAmbitoId').val(id);
            $('#editCodref').val(codRef);
            $('#editTipo').val(tipo);
            $('#editAmbito').val(ambito);
            $('#editEstado').val(estado ? 'Activo' : 'Inactivo');
        });

            // Evento para actualizar el usuario
    document.getElementById('saveEditAmbito').addEventListener('click', async function() {
        const id = document.getElementById('editAmbitoId').value;
        const codigo_referencia = document.getElementById('editCodref').value;
        const tipo = document.getElementById('editTipo').value;
        const ambito = document.getElementById('editAmbito').value;
        const estado = document.getElementById('editEstado').value;
        const Token = localStorage.getItem('access_token');
        if(codigo_referencia.trim()== '' || tipo.trim()== '' || ambito.trim()== '' || estado.trim()== ''){
            Swal.fire({
                title:"Todos los campos deben estar llenos.",
                icon:"error"
            });
        }else{

        
            const data = {
                CodigoRef: codigo_referencia,
                tipo: tipo,
                ambito: ambito,
                estado: estado
            };
            try {
                const response = await fetch(`${baseurl}api/v1/servicioxambito/${id}/update/`, {
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

    window.nextPage = nextPage;
    window.prevPage = prevPage;
    loadData(currentPage);

})();
