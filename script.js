/*********************** CONSTANTES Y VARIABLES GLOBALES ***********************/
const VELOCIDAD_MAXIMA_CAMINATA = 7 / 3.6; // m/s
const VELOCIDAD_MAXIMA_NATACION = 1.72; // m/s
const VELOCIDAD_MAXIMA_CICLISMO = 45 / 3.6; // m/s
const SEGUNDOS_POR_EJECUCION = 3
const INTERVALO_ENTRE_EJECUCUCIONES = 1

const corredores = [
    {
      nombre: "Juan Carlos Pérez González",
      cedula: "00112345678",
      municipio: "Santo Domingo",
      edad: 28, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "María Fernanda Rodríguez López",
      cedula: "00223456789",
      municipio: "Santiago",
      edad: 32, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Luis Alberto Martínez Sánchez",
      cedula: "00334567890",
      municipio: "La Vega",
      edad: 25, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Ana Patricia Díaz Ramírez",
      cedula: "00445678901",
      municipio: "San Cristóbal",
      edad: 35, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Carlos Enrique Jiménez Fernández",
      cedula: "00556789012",
      municipio: "Puerto Plata",
      edad: 29, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Sofía Alejandra Herrera Cruz",
      cedula: "00667890123",
      municipio: "San Pedro de Macorís",
      edad: 27, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "José Miguel García Pérez",
      cedula: "00778901234",
      municipio: "La Romana",
      edad: 31, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Laura Isabel Vargas Martínez",
      cedula: "00889012345",
      municipio: "Moca",
      edad: 24, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Pedro Antonio Núñez Díaz",
      cedula: "00990123456",
      municipio: "Bonao",
      edad: 33, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Diana Carolina Mejía Rodríguez",
      cedula: "01001234567",
      municipio: "San Juan de la Maguana",
      edad: 26, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Ricardo José Peña Sánchez",
      cedula: "01112345018",
      municipio: "Azua",
      edad: 30, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Gabriela Michelle López Fernández",
      cedula: "01223456129",
      municipio: "Barahona",
      edad: 28, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Fernando José Ramírez Cruz",
      cedula: "01334567230",
      municipio: "Higuey",
      edad: 34, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Valeria Alejandra Sánchez Martínez",
      cedula: "01445678341",
      municipio: "Nagua",
      edad: 23, 
        estado: "Pendiente", 
        asistio: false
    },
    {
      nombre: "Roberto Carlos Jiminian Herrera",
      cedula: "01556789452",
      municipio: "San Francisco de Macorís",
      edad: 29, 
        estado: "Pendiente", 
        asistio: false
    }
  ]

localStorage.setItem('participantes', JSON.stringify(corredores));

let ListaParticipantes = JSON.parse(localStorage.getItem('participantes')) || [];
let intervaloSimulacion;
let relojVirtual;
let progressChart;
let intervaloReloj;


/***************************** FUNCIONES DE EVENTOS ****************************/
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('eventDate').textContent = '15 de Octubre de 2025';
    document.getElementById('fechaEvento').value = '2025-10-15';
    mostrarSeccion('registro');
    document.getElementById('nav-registro').classList.add('active');
});

document.querySelectorAll('.navigation a').forEach(enlace => {
    enlace.onclick = function(e) {
        e.preventDefault();
        const seccionId = this.id.replace('nav-', '');
        mostrarSeccion(seccionId);
    };
});

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


/*********************** FUNCIONES QUE MANIPULAN EL DOM ************************/
function mostrarSeccion(seccionId) {
    document.querySelectorAll('section').forEach(seccion => {
        seccion.classList.add('seccion-oculta');
        seccion.classList.remove('seccion-activa');
    });
    
    document.getElementById(seccionId).classList.remove('seccion-oculta');
    document.getElementById(seccionId).classList.add('seccion-activa');
    
    document.querySelectorAll('.navigation a').forEach(enlace => {
        enlace.classList.remove('active');
    });
    document.getElementById(`nav-${seccionId}`).classList.add('active');
    
    if (seccionId === 'asistencia') {
        actualizarListaAsistentes();
    } else if (seccionId === 'competencia') {
        inicializarCompetencia();
    }
}

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

function actualizarTabla() {
    const tbody = document.getElementById('tablaParticipantes');
    tbody.innerHTML = "";

    const participantesConfirmados = ListaParticipantes.filter(participante => participante.asistio);

    participantesConfirmados.sort((a, b) => {
        if (a.estado === "Descalificado" && b.estado !== "Descalificado") return 1;
        if (b.estado === "Descalificado" && a.estado !== "Descalificado") return -1;
        if (a.estado === "Finalizado" && b.estado !== "Finalizado") return -1;
        if (b.estado === "Finalizado" && a.estado !== "Finalizado") return 1;

        const ratioA = a.distanciaRecorridaTotal / (a.tiempoIteracionesCaminata + a.tiempoIteracionesNatacion + a.tiempoIteracionesCiclismo);
        const ratioB = b.distanciaRecorridaTotal / (b.tiempoIteracionesCaminata + b.tiempoIteracionesNatacion + b.tiempoIteracionesCiclismo);
        
        return ratioB - ratioA;
    });

    participantesConfirmados.forEach((participante, index) => {
        const row = document.createElement('tr');
        
        if (index === 0 && participante.estado === "Finalizado") {
            row.classList.add('oro');
        } else if (index === 1 && participante.estado === "Finalizado") {
            row.classList.add('plata');
        } else if (index === 2 && participante.estado === "Finalizado") {
            row.classList.add('bronce');
        }

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

function actualizarRelojVirtual() {
    if (!relojVirtual) return;
    
    const horas = relojVirtual.getHours().toString().padStart(2, '0');
    const minutos = relojVirtual.getMinutes().toString().padStart(2, '0');
    const segundos = relojVirtual.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('relojVirtual').textContent = `${horas}:${minutos}:${segundos}`;
}


/************************** FUNCIONES DE SIMULACIÓN ***************************/
function iniciarSimulacion() {
    if (intervaloSimulacion) {
        clearInterval(intervaloSimulacion);
    }
    
    document.getElementById('iniciarSimulacion').classList.add('pulse');
    document.getElementById('iniciarSimulacion').innerHTML = '<i class="bi bi-pause"></i> Parar Competencia';
    document.getElementById('iniciarSimulacion').onclick = pausarSimulacion;
    
    const horaActual = new Date(relojVirtual);
    ListaParticipantes = ListaParticipantes.map((participante, index) => {
        if (participante.asistio && participante.estado === "Compitiendo") {
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
    
    intervaloSimulacion = setInterval(() => {
        ListaParticipantes.forEach((participante, index) => {
            actualizarProgreso(participante);
            if (index % 10 === 0) actualizarGrafico(); // Reducir actualizaciones del gráfico
        });
        
        actualizarTabla();
        relojVirtual.setSeconds(relojVirtual.getSeconds() + SEGUNDOS_POR_EJECUCION); // +1 segundos por iteración
        actualizarRelojVirtual();
        verificarFinalizacion();
    }, INTERVALO_ENTRE_EJECUCUCIONES); 
    
    mostrarNotificacion("¡Competencia iniciada! Buena suerte a todos los participantes", "exito");
}

function pausarSimulacion() {
    clearInterval(intervaloSimulacion);
    document.getElementById('iniciarSimulacion').innerHTML = '<i class="bi bi-play"></i> Reiniciar Competencia';
    document.getElementById('iniciarSimulacion').onclick = iniciarSimulacion;
    mostrarNotificacion("Competencia pausada", "advertencia");
}

function actualizarProgreso(participante) {
    if (!participante.asistio || participante.estado !== "Compitiendo") return;

    const variacionAleatoria = 0.999955 + Math.random(); // Probabilidad de ser descalificado

    let velocidad, distanciaObjetivo;
    
    switch(participante.disciplina) {
        case "Caminata":
            velocidad = participante.velocidadCaminata;
            distanciaObjetivo = 10 * 1000;
            participante.tiempoIteracionesCaminata += SEGUNDOS_POR_EJECUCION;
            break;

        case "Natación":
            velocidad = participante.velocidadNatacion;
            distanciaObjetivo = 10 * 1000;
            participante.tiempoIteracionesNatacion += SEGUNDOS_POR_EJECUCION;
            break;

        case "Ciclismo":
            velocidad = participante.velocidadCiclismo;
            distanciaObjetivo = 30 * 1000;
            participante.tiempoIteracionesCiclismo += SEGUNDOS_POR_EJECUCION;
            break;
    }

    const distanciaAvance = (velocidad * SEGUNDOS_POR_EJECUCION) - variacionAleatoria; // m/s * segundos
    

    if (variacionAleatoria < 1) {
        participante.estado = "Descalificado";
        mostrarNotificacion(`${participante.nombre} ha sido descalificado`, "error");
        return;
    }

    participante.distanciaRecorrida += distanciaAvance;
    participante.distanciaRecorridaTotal += distanciaAvance;

    if (participante.distanciaRecorrida >= distanciaObjetivo) {
        const horaActual = new Date(relojVirtual);
        
        switch (participante.disciplina) {
            
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

            case "Caminata":
                participante.finCaminata = new Date(horaActual);
                participante.inicioNatacion = new Date(horaActual);
                participante.distanciaRecorrida = 0;
                participante.disciplina = "Natación";
                actualizarTiempoTotal(participante);
                mostrarNotificacion(`${participante.nombre} ha completado la caminata`, "info");
                break;
        }
    }
}

function actualizarTiempoTotal(participante) {
    const totalSegundos = participante.tiempoIteracionesCaminata + participante.tiempoIteracionesNatacion + participante.tiempoIteracionesCiclismo;
 
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
 
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
 
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
 
    participante.tiempoTotal = `${horas}Hr : ${minutos}Min : ${segundos}Seg`;
}

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


/****************************** FUNCIONES UTILES ******************************/
function mostrarNotificacion(mensaje, tipo) {
    const container = document.getElementById('notifications-container');
    const notificacion = document.createElement('div');
    
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

function formatDate(date) {
    return date ? date.toLocaleTimeString('es-VE') : '-';
}

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

function inicializarCompetencia() {
    inicializarGrafico();
    
    const fechaEvento = localStorage.getItem('fechaEvento') || '2025-10-15';
    const horaInicio = localStorage.getItem('horaInicioCompetencia') || '08:00:00';
    
    const [year, month, day] = fechaEvento.split('-');
    const [hours, minutes, seconds] = horaInicio.split(':');
    
    relojVirtual = new Date(year, month - 1, day, hours, minutes, seconds);
    
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
                // Velocidades base constantes con variacion inicial única
                velocidadCaminata: VELOCIDAD_MAXIMA_CAMINATA,
                velocidadNatacion: VELOCIDAD_MAXIMA_NATACION,
                velocidadCiclismo: VELOCIDAD_MAXIMA_CICLISMO
            };
        }
        return participante;
    });
    
    iniciarRelojVirtual();
    actualizarTabla();
    actualizarContadores();
    actualizarGrafico();
}

function iniciarRelojVirtual() {
    if (intervaloReloj) clearInterval(intervaloReloj);
    actualizarRelojVirtual();
    intervaloReloj = setInterval(actualizarRelojVirtual, 1000);
}

function registrarParticipante() {
    const cedula = parseInt(document.getElementById('cedula').value);
    const nombre = document.getElementById('nombre').value.trim();
    const municipio = document.getElementById('municipio').value.trim();
    const edad = parseInt(document.getElementById('edad').value);

    document.getElementById('mensajeCedula').textContent = '';
    document.getElementById('mensajeEdad').textContent = '';
    document.getElementById('mensajeCampos').textContent = '';

    if (!nombre || !municipio || !cedula || !edad) {
        mostrarNotificacion('Por favor, complete todos los campos.', 'error');
        document.getElementById('mensajeCampos').textContent = 'Por favor, complete todos los campos.';
        return;
    }

    if (cedula < 1) {
        mostrarNotificacion('Cédula inválida', 'error');
        document.getElementById('mensajeCedula').textContent = 'Cédula Inválida';
        return;
    }

    if (ListaParticipantes.some(participante => participante.cedula === cedula)) {
        mostrarNotificacion('Ya existe un participante con esa cédula.', 'error');
        document.getElementById('mensajeCedula').textContent = 'Ya existe un participante con esa cédula.';
        return;
    }

    if (edad < 15) {
        mostrarNotificacion('Solo te puedes registrar si eres mayor de 14 años', 'error');
        document.getElementById('mensajeEdad').textContent = 'Solo te puedes registrar si eres mayor de 14 años';
        return;
    }

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
    
    document.getElementById('nombre').value = '';
    document.getElementById('cedula').value = '';
    document.getElementById('municipio').value = '';
    document.getElementById('edad').value = '';
}

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
    
    if (confirm(`¿Está seguro que desea eliminar al participante ${ListaParticipantes[indice].nombre} (C.I. ${cedula})?`)) {
        ListaParticipantes.splice(indice, 1);
        localStorage.setItem('participantes', JSON.stringify(ListaParticipantes));
        mostrarNotificacion("Participante eliminado con éxito", "exito");
        document.getElementById('cedula').value = '';
    }
}

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

function searchParticipants() {
    const searchTerm = document.getElementById('searchParticipant').value.toLowerCase();
    const items = document.querySelectorAll("#listaAsistentes li");
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function inicializarGrafico() {
    const ctx = document.getElementById('graficoProgreso').getContext('2d');
    
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
    participantes.sort((a, b) => b.distanciaRecorridaTotal - a.distanciaRecorridaTotal);
    const topParticipantes = participantes.slice(0, 10);
    
    const labels = topParticipantes.map(p => p.nombre);
    const distancias = topParticipantes.map(p => p.distanciaRecorridaTotal);
    const tiempos = topParticipantes.map(p => 
        p.tiempoIteracionesCaminata + p.tiempoIteracionesNatacion + p.tiempoIteracionesCiclismo
    );
    
    progressChart.data.labels = labels;
    progressChart.data.datasets[0].data = distancias;
    progressChart.data.datasets[1].data = tiempos;
    
    progressChart.data.datasets[0].backgroundColor = topParticipantes.map(p => {
        return p.estado === "Finalizado" ? 'rgba(40, 167, 69, 0.7)' : 'rgba(227, 77, 92, 0.7)';
    });
    
    progressChart.update();
}
