(function() {
    document.getElementById("ftabla").addEventListener("input", onInputChange);

    function onInputChange() {
        // Aquí solo manejas la visibilidad de las filas según el texto de búsqueda
        let inputText = document.getElementById("ftabla").value.toString().toLowerCase();
        let tbody = document.getElementById("tbody");
        let trow = tbody.getElementsByTagName("tr");
        
        for (let i = 0; i < trow.length; i++) {
            let textSearch = trow[i].textContent.toString().toLocaleLowerCase();
            if (textSearch.indexOf(inputText) === -1) {
                trow[i].style.display = "none"; // Ocultar la fila si no coincide con la búsqueda
            } else {
                trow[i].style.display = ""; // Mostrar la fila si coincide con la búsqueda
            }
        }
    }

    let currentPage = 1;
    let pageSize = 10;
    let hasNextPage = true;
    let totalRecords = 0;
    const authToken = localStorage.getItem('access_token');
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };

    const baseurl = 'http://127.0.0.1:8000/';
    const basehosp = 'api/v1/consulta-hospitalario/';
    const baseambu = 'api/v1/consulta-ambulatorio/';
    const baseenp = 'api/v1/consulta/';

    function fetchDataFromApi(startDate, endDate, page, pageSize, tipoServicio) {
        let endpoint;
        switch (tipoServicio) {
            case '1': // Ambulatorio
                endpoint = `${baseurl}${baseambu}${startDate}/${endDate}/?page=${page}&page_size=${pageSize}`;
                break;
            case '2': // Hospitalario
                endpoint = `${baseurl}${basehosp}${startDate}/${endDate}/?page=${page}&page_size=${pageSize}`;
                break;
            default: // No seleccionado o cualquier otro valor
                endpoint = `${baseurl}${baseenp}${startDate}/${endDate}/?page=${page}&page_size=${pageSize}`;
        }

        return fetch(endpoint, {
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

    function sendToEndpoint1(record) {
        return fetch('https://genesis.cajacopieps.com/api/api_inserta_pgp_prueba.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                function: record.function,
                tercero: record.tercero,
                tipo_doc: record.tipo_doc,
                numero_doc: record.numero_doc,
                documento_contrato: record.documento_contrato,
                numero_contrato: record.numero_contrato,
                producto: record.producto,
                cantidad: record.cantidad,
                fecha_prestacion: record.fecha_prestacion,
                ambito: record.ambito,
                diagnostico: record.diagnostico
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del primer endpoint');
            }
            return response.json();
        });
    }

    function sendDataToEndpoint2(data) {
        return fetch(`${baseurl}api/v1/insertar_reportado/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del segundo endpoint');
            }
            return response.json();
        });
    }

    function updateDataInEndpoint2(cita, descripcion) {
        return fetch(`${baseurl}api/v1/listar-reportados/`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ cita: cita, descripcion: descripcion })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del segundo endpoint (PUT)');
            }
            return response.json();
        });
    }

    function validarExistenciaCita(cita) {
        return fetch(`${baseurl}api/v1/consulta-por-cita/${cita}/`, {
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
            return data.cita_existe; // Devolver el valor de cita_existe
        });
    }

    
    function enviarReporte() {
        const selectedRecords = [];
        $('#dataTable tbody tr').each(function() {
            const checkbox = $(this).find('input[type="checkbox"]');
            if (checkbox.is(':checked')) {
                const record = {
                    tipo_doc: $(this).find('td:eq(1)').text(),
                    numero_doc: $(this).find('td:eq(2)').text(),
                    documento_contrato: $(this).find('td:eq(3)').text(),
                    numero_contrato: $(this).find('td:eq(4)').text(),
                    producto: $(this).find('td:eq(5)').text(),
                    cantidad: $(this).find('td:eq(6)').text(),
                    fecha_prestacion: $(this).find('td:eq(7)').text(),
                    ambito: $(this).find('td:eq(8)').text(),
                    diagnostico: $(this).find('td:eq(9)').text(), 
                    cita: $(this).find('input.cita').val(),
                    tercero: $(this).find('input.tercero').val(),
                    function: $(this).find('input.function').val()
                };
                selectedRecords.push(record);
            }
        });

        if (selectedRecords.length === 0) {
            Swal.fire({
                title: "Por favor, seleccione al menos un registro para enviar.",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: 'Enviando reporte...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let count0 = 0;
        let count1 = 0;
        const results = [];

        const promises = selectedRecords.map(record => {
            return sendToEndpoint1(record)
            .then(response => {
                let estado = response.Codigo === 1 ? 0 : 1;
                let descripcion = response.Nombre;
                results.push({ cita: record.cita, estado: estado, descripcion: descripcion });
                if (estado === 0) {
                    count0++;
                } else {
                    count1++;
                }
            })
            .catch(error => {
                Swal.fire({
                    title: "Error al enviar informacion a Genesis",
                    icon: "error"
                });
                results.push({ cita: record.cita, estado: 0, descripcion: descripcion });
            });
        });

        Promise.all(promises)
        .then(() => {
            const citasPromises = results.map(result => {
                return validarExistenciaCita(result.cita)
                .then(existe => {
                    if (existe) {
                        return updateDataInEndpoint2(result.cita, result.descripcion);
                    } else {
                        return sendDataToEndpoint2([result]);
                    }
                });
            });
            return Promise.all(citasPromises);
        })
        .then(responses => {
            Swal.fire({
                title: "Datos enviados",
                text: `Reportes sin exito: ${count0}\n | Reportes con exito: ${count1}`,
                icon: "success"
            });
        })
        .catch(error => {
            Swal.fire({
                title: "Error al enviar datos",
                text: error.message,
                icon: "error"
            });
        });
    }

    function loadData(page) {
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();
        const tipoServicio = $('select[name="tiposervicio"]').val();

        if (!startDate || !endDate) {
            Swal.fire({
                title: "Por favor, ingrese fecha de inicio y fin.",
                icon: "info"
            });
            return;
        }

        if (startDate > endDate) {
            Swal.fire({
                title: "La fecha de fin no puede ser anterior a la fecha de inicio.",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: 'Buscando registros...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const size = pageSize === 'all' ? totalRecords : pageSize;

        fetchDataFromApi(startDate, endDate, page, size, tipoServicio)
        .then(data => {
            totalRecords = data.count;
            $('#dataTable tbody').empty();

            $.each(data.results, function(index, item) {
                $('#dataTable tbody').append(`
                    <tr>
                        <td><input type="checkbox" aria-label="Checkbox for following text input" onchange="handleCheckboxChange(this)"> ${index + 1}</td>
                        <td>${item.tipo_doc}</td>
                        <td>${item.numero_doc}</td>
                        <td>${item.documento_contrato}</td>
                        <td>${item.numero_contrato}</td>
                        <td>${item.producto}</td>
                        <td>${item.cantidad}</td>
                        <td>${item.fecha_prestacion}</td>
                        <td>${item.ambito}</td>
                        <td>${item.diagnostico}</td>
                    </tr>`
                );
            });

            hasNextPage = data.next !== null;
            Swal.close();
        })
        .catch(error => {
            Swal.fire({
                title: "Error al cargar los datos",
                text: error.message,
                icon: "error"
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
                title: "No hay más páginas disponibles.",
                icon: "info"
            });
        }
    }

    $('#dataTable_length select').change(function() {
        pageSize = $(this).val();
        currentPage = 1;
        // loadData(currentPage);
    });

    $('#buscarBtn').click(function() {
        currentPage = 1;
        loadData(currentPage);
    });

    $('#enviarReporteBtn').click(function() {
        enviarReporte();
    });

    window.checkAll = function(master) {
        var checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = master.checked;
        });
        handleCheckboxChange();
    };

    window.handleCheckboxChange = function() {
        const masterCheckbox = document.querySelector('#selectall');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        masterCheckbox.checked = allChecked;
    };

    window.nextPage = nextPage;
    window.prevPage = prevPage;

})();

