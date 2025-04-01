// Constantes del sistema
const VELOCIDAD_MAXIMA_CAMINATA = 7 / 3.6; // m/s
const VELOCIDAD_MAXIMA_NATACION = 1.72; // m/s
const VELOCIDAD_MAXIMA_CICLISMO = 45 / 3.6; // m/s

// Variables de estado
let ListaParticipantes = JSON.parse(localStorage.getItem('participantes')) || [];
let intervaloSimulacion;
let relojVirtual;
let progressChart;
let intervaloReloj;

// Funciones de navegación
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('section').forEach(seccion => {
        seccion.classList.add('seccion-oculta');
        seccion.classList.remove('seccion-activa');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.remove('seccion-oculta');
    document.getElementById(seccionId).classList.add('seccion-activa');
    
    // Actualizar navegación activa
    document.querySelectorAll('.navigation a').forEach(enlace => {
        enlace.classList.remove('active');
    });
    document.getElementById(`nav-${seccionId}`).classList.add('active');
    
    // Actualizar contenido según la sección
    if (seccionId === 'asistencia') {
        actualizarListaAsistentes();
    } else if (seccionId === 'competencia') {
        inicializarCompetencia();
    }
}

// Función para registrar participantes
function registrarParticipante() {
    const cedula = parseInt(document.getElementById('cedula').value);
    const nombre = document.getElementById('nombre').value.trim();
    const municipio = document.getElementById('municipio').value.trim();
    const edad = parseInt(document.getElementById('edad').value);

    // Limpiar mensajes de error previos
    document.getElementById('mensajeCedula').textContent = '';
    document.getElementById('mensajeEdad').textContent = '';
    document.getElementById('mensajeCampos').textContent = '';

    // Validar que todos los campos están completos
    if (!nombre || !municipio || !cedula || !edad) {
        mostrarNotificacion('Por favor, complete todos los campos.', 'error');
        document.getElementById('mensajeCampos').textContent = 'Por favor, complete todos los campos.';
        return;
    }

    // Validar si la cédula es menor que 1
    if (cedula < 1) {
        mostrarNotificacion('Cédula inválida', 'error');
        document.getElementById('mensajeCedula').textContent = 'Cédula Inválida';
        return;
    }

    // Validar si la cédula ya está registrada
    if (ListaParticipantes.some(participante => participante.cedula === cedula)) {
        mostrarNotificacion('Ya existe un participante con esa cédula.', 'error');
        document.getElementById('mensajeCedula').textContent = 'Ya existe un participante con esa cédula.';
        return;
    }

    // Validar que la edad sea mayor o igual a 15
    if (edad < 15) {
        mostrarNotificacion('Solo te puedes registrar si eres mayor de 14 años', 'error');
        document.getElementById('mensajeEdad').textContent = 'Solo te puedes registrar si eres mayor de 14 años';
        return;
    }

    // Si todo es válido, crear el participante
    const participante = {
        cedula, 
        nombre, 
        municipio, 
        edad, 
        estado: "Pendiente", 
        asistio: false
    };

    ListaParticipantes.push(participante);
    localStorage.setItem('participantes', JSON.stringify(ListaParticipantes));
    mostrarNotificacion('Participante registrado con éxito', 'exito');
    
    // Limpiar formulario
    document.getElementById('nombre').value = '';
    document.getElementById('cedula').value = '';
    document.getElementById('municipio').value = '';
    document.getElementById('edad').value = '';
}

// Función para eliminar participante por cédula
function eliminarParticipante() {
    const cedula = parseInt(document.getElementById('cedula').value);
    
    if (!cedula || cedula < 1) {
        mostrarNotificacion("Ingrese una cédula válida para eliminar", "error");
        document.getElementById('mensajeCedula').textContent = 'Ingrese una cédula válida para eliminar';
        return;
    }
    
    const indice = ListaParticipantes.findIndex(p => p.cedula === cedula);
    
    if (indice === -1) {
        mostrarNotificacion("No se encontró un participante con esa cédula", "error");
        document.getElementById('mensajeCedula').textContent = 'No se encontró un participante con esa cédula';
        return;
    }
    
    // Confirmar eliminación
    if (confirm(`¿Está seguro que desea eliminar al participante ${ListaParticipantes[indice].nombre} (C.I. ${cedula})?`)) {
        ListaParticipantes.splice(indice, 1);
        localStorage.setItem('participantes', JSON.stringify(ListaParticipantes));
        mostrarNotificacion("Participante eliminado con éxito", "exito");
        actualizarListaRegistrados();
        document.getElementById('cedula').value = '';
    }
}

// Función para eliminar participante desde la tabla
function eliminarParticipanteDesdeTabla(cedula) {
    const indice = ListaParticipantes.findIndex(p => p.cedula === cedula);
    
    if (indice === -1) {
        mostrarNotificacion("No se encontró el participante", "error");
        return;
    }
    
    const participante = ListaParticipantes[indice];
    
    if (confirm(`¿Está seguro que desea eliminar permanentemente a ${participante.nombre} (C.I. ${participante.cedula})?`)) {
        ListaParticipantes.splice(indice, 1);
        localStorage.setItem('participantes', JSON.stringify(ListaParticipantes));
        mostrarNotificacion(`Participante ${participante.nombre} eliminado`, "exito");
        actualizarListaRegistrados();
        
        // Si estamos en la sección de asistencia, actualizarla también
        if (document.getElementById('asistencia').classList.contains('seccion-activa')) {
            actualizarListaAsistentes();
        }
    }
}

// Función para actualizar la lista de participantes registrados
function actualizarListaRegistrados() {
    const tbody = document.getElementById('listaRegistrados');
    tbody.innerHTML = '';
    
    ListaParticipantes.forEach(participante => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${participante.cedula}</td>
            <td>${participante.nombre}</td>
            <td>${participante.municipio}</td>
            <td>${participante.edad}</td>
            <td>
                <button onclick="eliminarParticipanteDesdeTabla(${participante.cedula})" class="btn-accion btn-accion-eliminar">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para buscar en participantes registrados
function searchRegistered() {
    const input = document.getElementById('searchRegistered');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('tablaRegistrados');
    const tr = table.getElementsByTagName('tr');
    
    for (let i = 1; i < tr.length; i++) {
        const tdCedula = tr[i].getElementsByTagName('td')[0];
        const tdNombre = tr[i].getElementsByTagName('td')[1];
        const tdMunicipio = tr[i].getElementsByTagName('td')[2];
        
        if (tdCedula || tdNombre || tdMunicipio) {
            const txtValueCedula = tdCedula.textContent || tdCedula.innerText;
            const txtValueNombre = tdNombre.textContent || tdNombre.innerText;
            const txtValueMunicipio = tdMunicipio.textContent || tdMunicipio.innerText;
            
            if (txtValueCedula.toUpperCase().indexOf(filter) > -1 || 
                txtValueNombre.toUpperCase().indexOf(filter) > -1 || 
                txtValueMunicipio.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = '';
            } else {
                tr[i].style.display = 'none';
            }
        }
    }
}

// Función para confirmar asistencia
function confirmarAsistencia() {
    const fechaEvento = document.getElementById("fechaEvento").value;
    const horaInicio = document.getElementById("horaInicio").value;
    
    if (!fechaEvento || !horaInicio) {
        mostrarNotificacion("Por favor, ingrese la fecha y hora de inicio", "error");
        return;
    }
    
    if (ListaParticipantes.length === 0) {
        mostrarNotificacion("No hay participantes registrados", "error");
        return;
    }
    
    const checkboxes = document.querySelectorAll("#listaAsistentes input[type='checkbox']:checked");
    if (checkboxes.length === 0) {
        mostrarNotificacion("Seleccione al menos un participante", "error");
        return;
    }
    
    // Guardar la fecha y hora de inicio en localStorage
    localStorage.setItem('fechaEvento', fechaEvento);
    localStorage.setItem('horaInicioCompetencia', horaInicio);
    
    ListaParticipantes.forEach((participante, index) => {
        const checkbox = document.getElementById(`asistente-${index}`);
        if (checkbox && checkbox.checked) {
            participante.asistio = true;
            participante.estado = "Compitiendo";
        }
    });
    
    localStorage.setItem('participantes', JSON.stringify(ListaParticipantes));
    mostrarNotificacion("Asistencia confirmada correctamente", "exito");
    mostrarSeccion('competencia');
}

// Funciones auxiliares de asistencia
function checkAll() {
    const items = document.querySelectorAll("#listaAsistentes input[type='checkbox']");
    items.forEach(item => item.checked = true);
    mostrarNotificacion("Todos los participantes seleccionados", "info");
}

function uncheckAll() {
    const items = document.querySelectorAll("#listaAsistentes input[type='checkbox']");
    items.forEach(item => item.checked = false);
    mostrarNotificacion("Selección limpiada", "info");
}

function searchParticipants() {
    const searchTerm = document.getElementById('searchParticipant').value.toLowerCase();
    const items = document.querySelectorAll("#listaAsistentes li");
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Actualizar lista de asistentes
function actualizarListaAsistentes() {
    const lista = document.getElementById("listaAsistentes");
    lista.innerHTML = "";
    
    ListaParticipantes.forEach((participante, index) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <label>
                <input type="checkbox" id="asistente-${index}" data-cedula="${participante.cedula}" />
                <span class="participant-info">
                    <span class="participant-cedula">${participante.cedula}</span> - 
                    <span class="participant-name">${participante.nombre}</span> - 
                    <span class="participant-municipio">${participante.municipio}</span> - 
                    <span class="participant-age">${participante.edad} años</span>
                </span>
            </label>
        `;
        lista.appendChild(item);
    });
}

// Funciones de competencia
function inicializarCompetencia() {
    // Inicializar gráfico
    inicializarGrafico();
    
    // Obtener fecha y hora de inicio desde localStorage
    const fechaEvento = localStorage.getItem('fechaEvento') || '2025-10-15';
    const horaInicio = localStorage.getItem('horaInicioCompetencia') || '08:00:00';
    
    // Configurar reloj virtual
    const [year, month, day] = fechaEvento.split('-');
    const [hours, minutes, seconds] = horaInicio.split(':');
    
    relojVirtual = new Date(year, month - 1, day, hours, minutes, seconds);
    
    // Inicializar participantes para competencia
    ListaParticipantes = ListaParticipantes.map(participante => {
        if (participante.asistio && participante.estado === "Compitiendo") {
            return {
                ...participante,
                disciplina: "Caminata",
                distanciaRecorrida: 0, 
                distanciaRecorridaTotal: 0,
                tiempoIteracionesCaminata: 0, 
                tiempoIteracionesNatacion: 0, 
                tiempoIteracionesCiclismo: 0,
                inicioCaminata: null, 
                finCaminata: null, 
                inicioNatacion: null, 
                finNatacion: null, 
                inicioCiclismo: null, 
                finCiclismo: null,
                tiempoTotal: "00Hr : 00Min : 00Seg",
                velocidadCaminata: VELOCIDAD_MAXIMA_CAMINATA * (0.7 + Math.random() * 0.6),
                velocidadNatacion: VELOCIDAD_MAXIMA_NATACION * (0.7 + Math.random() * 0.6),
                velocidadCiclismo: VELOCIDAD_MAXIMA_CICLISMO * (0.7 + Math.random() * 0.6)
            };
        }
        return participante;
    });
    
    // Iniciar reloj virtual
    iniciarRelojVirtual();
    actualizarTabla();
    actualizarContadores();
    actualizarGrafico(); // Asegurar que el gráfico se actualice al inicio
}

// Iniciar simulación
function iniciarSimulacion() {
    if (intervaloSimulacion) {
        clearInterval(intervaloSimulacion);
    }
    
    // Efecto visual al iniciar
    document.getElementById('iniciarSimulacion').classList.add('pulse');
    document.getElementById('iniciarSimulacion').innerHTML = '<i class="bi bi-pause"></i> Pausar Competencia';
    document.getElementById('iniciarSimulacion').onclick = pausarSimulacion;
    
    // Reiniciar tiempos con animación
    const horaActual = new Date(relojVirtual);
    ListaParticipantes = ListaParticipantes.map((participante, index) => {
        if (participante.asistio && participante.estado === "Compitiendo") {
            // Efecto visual para cada participante
            setTimeout(() => {
                const row = document.querySelector(`#tablaParticipantes tr:nth-child(${index + 1})`);
                if (row) {
                    row.classList.add('highlight');
                    setTimeout(() => row.classList.remove('highlight'), 1000);
                }
            }, index * 50);
            
            return {
                ...participante,
                distanciaRecorrida: 0,
                distanciaRecorridaTotal: 0,
                tiempoIteracionesCaminata: 0,
                tiempoIteracionesNatacion: 0,
                tiempoIteracionesCiclismo: 0,
                inicioCaminata: new Date(horaActual),
                finCaminata: null,
                inicioNatacion: null,
                finNatacion: null,
                inicioCiclismo: null,
                finCiclismo: null,
                tiempoTotal: "00Hr : 00Min : 00Seg"
            };
        }
        return participante;
    });
    
    // Mejorar la velocidad de la simulación
    intervaloSimulacion = setInterval(() => {
        // Actualizar progreso con variabilidad
        ListaParticipantes.forEach((participante, index) => {
            // Añadir un pequeño retraso para efecto visual
            setTimeout(() => {
                actualizarProgreso(participante);
                if (index % 5 === 0) actualizarGrafico();
            }, index % 10);
        });
        
        actualizarTabla();
        relojVirtual.setSeconds(relojVirtual.getSeconds() + 1);
        actualizarRelojVirtual();
        verificarFinalizacion();
    }, 50); // Intervalo más rápido para mejor fluidez
    
    mostrarNotificacion("¡Competencia iniciada! Buena suerte a todos los participantes", "exito");
}

// Pausar simulación
function pausarSimulacion() {
    clearInterval(intervaloSimulacion);
    document.getElementById('iniciarSimulacion').innerHTML = '<i class="bi bi-play"></i> Reanudar Competencia';
    document.getElementById('iniciarSimulacion').onclick = iniciarSimulacion;
    mostrarNotificacion("Competencia pausada", "advertencia");
}

// Actualizar progreso de participantes
function actualizarProgreso(participante) {
    if (!participante.asistio || participante.estado === "Descalificado" || participante.estado === "Finalizado") return;

    let velocidad;
    let distanciaObjetivo;

    switch (participante.disciplina) {
        case "Caminata":
            velocidad = participante.velocidadCaminata;
            distanciaObjetivo = 10 * 1000; // 10 km en metros
            participante.tiempoIteracionesCaminata += 1;
            break;
        case "Natación":
            velocidad = participante.velocidadNatacion;
            distanciaObjetivo = 10 * 1000; // 10 km en metros
            participante.tiempoIteracionesNatacion += 1;
            break;
        case "Ciclismo":
            velocidad = participante.velocidadCiclismo;
            distanciaObjetivo = 30 * 1000; // 30 km en metros
            participante.tiempoIteracionesCiclismo += 1;
            break;
    }

    const distanciaAvance = velocidad * Math.random();

    if (distanciaAvance <= 0.0001) {
        participante.estado = "Descalificado";
        mostrarNotificacion(`${participante.nombre} ha sido descalificado`, "error");
        return;
    }

    participante.distanciaRecorrida += distanciaAvance;
    participante.distanciaRecorridaTotal += distanciaAvance;

    if (participante.distanciaRecorrida >= distanciaObjetivo) {
        const horaActual = new Date(relojVirtual);
        
        switch (participante.disciplina) {
            case "Caminata":
                participante.finCaminata = new Date(horaActual);
                participante.inicioNatacion = new Date(horaActual);
                participante.distanciaRecorrida = 0;
                participante.disciplina = "Natación";
                actualizarTiempoTotal(participante);
                mostrarNotificacion(`${participante.nombre} ha completado la caminata`, "info");
                break;

            case "Natación":
                participante.finNatacion = new Date(horaActual);
                participante.inicioCiclismo = new Date(horaActual);
                participante.distanciaRecorrida = 0;
                participante.disciplina = "Ciclismo";
                actualizarTiempoTotal(participante);
                mostrarNotificacion(`${participante.nombre} ha completado la natación`, "info");
                break;

            case "Ciclismo":
                participante.finCiclismo = new Date(horaActual);
                participante.estado = "Finalizado";
                actualizarTiempoTotal(participante);
                mostrarNotificacion(`${participante.nombre} ha completado la competencia!`, "exito");
                break;
        }
    }
}

// Actualizar tiempo total del participante
function actualizarTiempoTotal(participante) {
    const totalSegundos = participante.tiempoIteracionesCaminata + 
                         participante.tiempoIteracionesNatacion + 
                         participante.tiempoIteracionesCiclismo;
    
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    
    participante.tiempoTotal = `${horas}Hr : ${minutos}Min : ${segundos}Seg`;
}

// Actualizar tabla de participantes
function actualizarTabla() {
    const tbody = document.getElementById('tablaParticipantes');
    tbody.innerHTML = "";

    const participantesConfirmados = ListaParticipantes.filter(participante => participante.asistio);

    participantesConfirmados.sort((a, b) => {
        // Descalificado debe ir al final
        if (a.estado === "Descalificado" && b.estado !== "Descalificado") return 1;
        if (b.estado === "Descalificado" && a.estado !== "Descalificado") return -1;

        // Ordenar por estado de finalización
        if (a.estado === "Finalizado" && b.estado !== "Finalizado") return -1;
        if (b.estado === "Finalizado" && a.estado !== "Finalizado") return 1;

        // Ordenar por rendimiento (distancia / tiempo)
        const ratioA = a.distanciaRecorridaTotal / (a.tiempoIteracionesCaminata + a.tiempoIteracionesNatacion + a.tiempoIteracionesCiclismo);
        const ratioB = b.distanciaRecorridaTotal / (b.tiempoIteracionesCaminata + b.tiempoIteracionesNatacion + b.tiempoIteracionesCiclismo);
        
        return ratioB - ratioA;
    });

    participantesConfirmados.forEach((participante, index) => {
        const row = document.createElement('tr');
        
        // Clases de medalla
        if (index === 0 && participante.estado === "Finalizado") {
            row.classList.add('oro');
        } else if (index === 1 && participante.estado === "Finalizado") {
            row.classList.add('plata');
        } else if (index === 2 && participante.estado === "Finalizado") {
            row.classList.add('bronce');
        }

        // Formatear fechas
        const formatDate = (date) => date ? date.toLocaleTimeString('es-VE') : '-';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${participante.nombre}</td>
            <td>${participante.cedula}</td>
            <td>${participante.municipio}</td>
            <td>${participante.edad}</td>
            <td>${formatDate(participante.inicioCaminata)}</td>
            <td>${formatDate(participante.finCaminata)}</td>
            <td>${formatDate(participante.inicioNatacion)}</td>
            <td>${formatDate(participante.finNatacion)}</td>
            <td>${formatDate(participante.inicioCiclismo)}</td>
            <td>${formatDate(participante.finCiclismo)}</td>
            <td>${participante.tiempoTotal}</td>
            <td class="estado-${participante.estado.toLowerCase()}">${participante.estado}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Verificar finalización de la competencia
function verificarFinalizacion() {
    const participantesActivos = ListaParticipantes.filter(p => p.asistio && p.estado === "Compitiendo");
    
    if (participantesActivos.length === 0) {
        clearInterval(intervaloSimulacion);
        document.getElementById('iniciarSimulacion').innerHTML = '<i class="bi bi-flag"></i> Competencia Finalizada';
        document.getElementById('iniciarSimulacion').onclick = null;
        document.getElementById('iniciarSimulacion').disabled = true;
        
        mostrarNotificacion("¡La competencia ha finalizado!", "exito");
    }
    
    actualizarContadores();
}

// Reloj virtual
function iniciarRelojVirtual() {
    if (intervaloReloj) clearInterval(intervaloReloj);
    actualizarRelojVirtual();
    intervaloReloj = setInterval(actualizarRelojVirtual, 1000);
}

function actualizarRelojVirtual() {
    if (!relojVirtual) return;
    
    const horas = relojVirtual.getHours().toString().padStart(2, '0');
    const minutos = relojVirtual.getMinutes().toString().padStart(2, '0');
    const segundos = relojVirtual.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('relojVirtual').textContent = `${horas}:${minutos}:${segundos}`;
}

// Actualizar contadores
function actualizarContadores() {
    const total = ListaParticipantes.filter(p => p.asistio).length;
    const compitiendo = ListaParticipantes.filter(p => p.asistio && p.estado === "Compitiendo").length;
    const finalizado = ListaParticipantes.filter(p => p.asistio && p.estado === "Finalizado").length;
    const descalificado = ListaParticipantes.filter(p => p.asistio && p.estado === "Descalificado").length;
    
    document.getElementById('totalParticipantes').textContent = total;
    document.getElementById('compitiendo').textContent = compitiendo;
    document.getElementById('finalizado').textContent = finalizado;
    document.getElementById('descalificado').textContent = descalificado;
}

// Gráfico de progreso
function inicializarGrafico() {
    const ctx = document.getElementById('graficoProgreso').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (progressChart) progressChart.destroy();
    
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Distancia Recorrida (m)',
                    data: [],
                    backgroundColor: 'rgba(78, 205, 196, 0.7)',
                    borderColor: 'rgba(78, 205, 196, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false
                },
                {
                    label: 'Tiempo (s)',
                    data: [],
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderColor: 'rgba(255, 107, 107, 1)',
                    borderWidth: 2,
                    type: 'line',
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    footerFont: {
                        size: 12
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                                if (context.datasetIndex === 0) label += ' metros';
                                if (context.datasetIndex === 1) label += ' segundos';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distancia (m)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tiempo (s)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function actualizarGrafico() {
    if (!progressChart) return;
    
    const participantes = ListaParticipantes.filter(p => p.asistio && p.estado !== "Descalificado");
    
    // Ordenar participantes por distancia recorrida (mayor a menor)
    participantes.sort((a, b) => b.distanciaRecorridaTotal - a.distanciaRecorridaTotal);
    
    // Tomar solo los primeros 10 participantes para mejor visualización
    const topParticipantes = participantes.slice(0, 10);
    
    const labels = topParticipantes.map(p => p.nombre);
    const distancias = topParticipantes.map(p => p.distanciaRecorridaTotal);
    const tiempos = topParticipantes.map(p => 
        p.tiempoIteracionesCaminata + p.tiempoIteracionesNatacion + p.tiempoIteracionesCiclismo
    );
    
    // Actualizar datos del gráfico
    progressChart.data.labels = labels;
    progressChart.data.datasets[0].data = distancias;
    progressChart.data.datasets[1].data = tiempos;
    
    // Actualizar colores según el estado
    progressChart.data.datasets[0].backgroundColor = topParticipantes.map(p => {
        if (p.estado === "Finalizado") return 'rgba(40, 167, 69, 0.7)'; // Verde para finalizados
        return 'rgba(227, 77, 92, 0.7)'; // Rojo para compitiendo
    });
    
    progressChart.update();
}

// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const container = document.getElementById('notifications-container');
    const notificacion = document.createElement('div');
    
    // Iconos animados
    const iconos = {
        exito: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        advertencia: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <i class="bi ${iconos[tipo]} animate-icon"></i>
        <span>${mensaje}</span>
        <div class="progress-bar"></div>
    `;
    
    container.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('mostrar');
        
        // Barra de progreso
        const progressBar = notificacion.querySelector('.progress-bar');
        progressBar.style.width = '100%';
        progressBar.style.transition = 'width 3s linear';
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            if (container.contains(notificacion)) {
                container.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

function getIconoNotificacion(tipo) {
    switch(tipo) {
        case 'exito': return 'bi-check-circle-fill';
        case 'error': return 'bi-exclamation-circle-fill';
        case 'advertencia': return 'bi-exclamation-triangle-fill';
        case 'info': return 'bi-info-circle-fill';
        default: return 'bi-info-circle-fill';
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar fecha del evento
    document.getElementById('eventDate').textContent = '15 de Octubre de 2025';
    document.getElementById('fechaEvento').value = '2025-10-15'; // Formato YYYY-MM-DD
    
    // Mostrar la sección de registro por defecto
    mostrarSeccion('registro');
    actualizarListaRegistrados();

    // Configurar navegación activa inicial
    document.getElementById('nav-registro').classList.add('active');
});

// Efecto de carga para las secciones
function cargarSeccion(seccionId) {
    const seccion = document.getElementById(seccionId);
    seccion.style.opacity = '0';
    seccion.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        mostrarSeccion(seccionId);
        seccion.style.opacity = '1';
        seccion.style.transform = 'translateY(0)';
    }, 50);
}

// Actualizar los eventos de navegación
document.querySelectorAll('.navigation a').forEach(enlace => {
    enlace.onclick = function(e) {
        e.preventDefault();
        const seccionId = this.id.replace('nav-', '');
        cargarSeccion(seccionId);
    };
});

// Efecto de scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animación para los botones 3D
document.querySelectorAll('.efecto_3d').forEach(boton => {
    boton.addEventListener('mousedown', () => {
        boton.style.transform = 'scale(0.95)';
    });
    
    boton.addEventListener('mouseup', () => {
        boton.style.transform = 'scale(1)';
    });
    
    boton.addEventListener('mouseleave', () => {
        boton.style.transform = 'scale(1)';
    });
});