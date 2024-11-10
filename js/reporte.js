(function () {

    //Funcion buscar en la tabla

    document.getElementById("ftabla").addEventListener("input", onInputChange);

    function onInputChange(){
    let f1=document.getElementById("start_date").value;
    let f2=document.getElementById("end_date").value;
    let inputText = document.getElementById("ftabla").value.toString().toLowerCase();
    
    if(f1== "" && f2 ==""){
        Swal.fire({
            title:"Por favor, ingrese fecha de inicio y fin.",
            icon:"info"
        });
        inputText.disabled = true;

    }else{
            //Prueba
            let tbody = document.getElementById("tbody");
            let trow = tbody.getElementsByTagName("tr");
            for(let i=0; i < trow.length; i++){
                
                let textSearch = trow[i].textContent.toString().toLocaleLowerCase();

                if(textSearch.indexOf(inputText) === -1){
                    trow[i].style.visibility="collapse";
                }else{
                    trow[i].style.visibility="";
                }
            }
        }
    }
    //Fin funcion buscar en la tabla

    let currentPage = 1;
    let pageSize = 10; // Tamaño de página predeterminado
    let hasNextPage = true;
    let totalRecords = 0; // Variable para almacenar el número total de registros
    const authToken = localStorage.getItem('access_token');
    const baseurl = 'http://127.0.0.1:8000/';
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json' // Ajusta el tipo de contenido según sea necesario
    };
    // Función para hacer la primera petición
    function fetchDataFromApi(startDate, endDate, page, pageSize) {
        return fetch(`${baseurl}api/v1/listar-reportados/${startDate}/${endDate}/?page=${page}&page_size=${pageSize}`, {
            method: 'GET',
            headers: headers
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la API');
                }
                return response.json();
            })
            .then(data => {
                if (data.results.length === 0) {
                    Swal.fire({
                        title: "No hay registros",
                        text: "No se encontraron registros para las fechas seleccionadas.",
                        icon: "info"
                    });
                }
                return data;
            });
    }


    // Función para cargar los datos desde la API
    function loadData(page) {
        // Obtener las fechas de inicio y fin del input
        const startDate = $('#start_date').val();
        const endDate = $('#end_date').val();

        // Verificar que ambas fechas estén presentes
        if (!startDate || !endDate) {
            Swal.fire({
                title:"Por favor, ingrese fecha de inicio y fin.",
                icon:"info"
            });
            return;
        }

        // Verificar si hay una página siguiente disponible
        if (!hasNextPage && page > 1) {
            Swal.fire({
                title:"No hay más páginas disponibles.",
                icon:"info"
            });
            return;
        }

        if (startDate > endDate) {
            Swal.fire({
                title:"La fecha de fin no puede ser anterior a la fecha de inicio.",
                icon:"error"
            });
            return; // Detiene la ejecución si la fecha de fin es menor que la fecha de inicio
        }

        // Calcular el valor de pageSize para enviar a la API
        const size = pageSize === 'all' ? totalRecords : pageSize;

        fetchDataFromApi(startDate, endDate, page, size)
            .then(data => {
                // Guardar el número total de registros
                totalRecords = data.count;

                // Limpiar la tabla antes de agregar nuevos datos
                $('#dataTable tbody').empty();

                // Dentro de la función para cargar los datos en la tabla
                $.each(data.results, function(index, item) {
                    let varestado;
                    if(item.estado == true){
                        varestado ='Reportado';
                    }else{
                        varestado ='Reportado';
                    }
                    $('#dataTable tbody').append('<tr>' +
                        '<td>' + item.tipo_doc + '</td>' +
                        '<td>' + item.numero_doc + '</td>' +
                        '<td>' + item.documento_contrato + '</td>' +
                        '<td>' + item.numero_contrato + '</td>' +
                        '<td>' + item.producto + '</td>' +
                        '<td>' + item.cantidad + '</td>' +
                        '<td>' + item.fecha_prestacion + '</td>' +
                        '<td>' + item.diagnostico + '</td>' +
                        '<td>' + varestado + '</td>' +
                        '<td>' + item.descripcion + '</td>' +
                        '<td>' + item.fecha_registro + '</td>' +
                        '</tr>');
                });

                // Actualizar la variable hasNextPage
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



    // Función para cargar la página anterior
    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            loadData(currentPage);
        }
    }

    // Función para cargar la página siguiente
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

    //funcion para exportar a excel
    function exportarTablaAExcel() {
        // Obtener la tabla HTML
        const startDate = $('#start_date').val();
        const endDate = $('#end_date').val();

        // Verificar que ambas fechas estén presentes
        if (!startDate || !endDate) {
            Swal.fire({
                title:"Por favor, ingrese fecha de inicio y fin.",
                icon:"info"
            });
            return;
        }

        if (startDate > endDate) {
            Swal.fire({
                title:"La fecha de fin no puede ser anterior a la fecha de inicio.",
                icon:"error"
            });
            return; // Detiene la ejecución si la fecha de fin es menor que la fecha de inicio
        }
        if ($('#dataTable tbody tr').length === 0) {
            Swal.fire({
                title:"No hay datos para exportar.",
                icon:"info"
            });
        }else{
            var tabla = document.getElementById("dataTable");
            
            // Convertir la tabla HTML a un objeto de hoja de trabajo
            var wb = XLSX.utils.table_to_book(tabla, { sheet: "Sheet1" });
            
            // Exportar el libro a un archivo .xlsx
            XLSX.writeFile(wb, "Reportados.xlsx");
        }
        
    }

    // Función para manejar el cambio en el tamaño de la página
    $('#dataTable_length select').change(function() {
        pageSize = $(this).val();
        currentPage = 1; // Reiniciar a la primera página
        loadData(currentPage);
    });

    // Función para manejar la búsqueda por fechas
    $('#buscarBtn').click(function() {
        currentPage = 1; // Reiniciar a la primera página
        loadData(currentPage);
    });
    window.nextPage = nextPage;
    window.prevPage = prevPage;
    window.exportarTablaAExcel = exportarTablaAExcel;
})();

