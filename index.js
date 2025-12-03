// Constantes globales <------------ 
const IMPUESTO_IGV = 0.18;
const TARIFA_URGENCIA = 50;

// Variables globales <------------ 
let usuarioActivo = null;
let configuracion = { tema: 'claro', idioma: 'es' };

// =========================================================================
// MÓDULO NAVEGACIÓN RESPONSIVA
// =========================================================================

function inicializarNavegacionResponsiva() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuButton = document.querySelector('.menu-button');
    const nav = document.querySelector('nav');
    
    if (menuToggle && menuButton && nav) {
        // Toggle del menú hamburguesa
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            menuToggle.checked = !menuToggle.checked;
            actualizarEstadoMenu();
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !menuButton.contains(e.target)) {
                menuToggle.checked = false;
                actualizarEstadoMenu();
            }
        });
        
        // Cerrar menú al seleccionar opción (en móviles)
        nav.addEventListener('click', function(e) {
            if (window.innerWidth < 768 && e.target.tagName === 'A') {
                menuToggle.checked = false;
                actualizarEstadoMenu();
            }
        });
        
        function actualizarEstadoMenu() {
            if (menuToggle.checked) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        // Manejar redimensionado de ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                menuToggle.checked = false;
                document.body.style.overflow = '';
                actualizarEstadoMenu();
            }
        });
    }
    
    // Inicializar dropdowns
    inicializarDropdowns();
}

function inicializarDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (btn && content) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Cerrar otros dropdowns abiertos
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.querySelector('.dropdown-content').classList.remove('active');
                    }
                });
                
                // Toggle este dropdown
                content.classList.toggle('active');
            });
        }
    });
    
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function() {
        dropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) content.classList.remove('active');
        });
    });
    
    // Cerrar dropdowns en móviles al seleccionar
    if (window.innerWidth < 768) {
        document.querySelectorAll('.dropdown-content a').forEach(link => {
            link.addEventListener('click', function() {
                this.closest('.dropdown-content').classList.remove('active');
            });
        });
    }
}

// =========================================================================
// FUNCIONES DE UTILIDAD 
// =========================================================================

function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

function toggleElemento(id, mostrar) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.classList.toggle('hidden', !mostrar);
}

function validarDNI(dni) {
    return /^\d{8}$/.test(dni);
}

function formatoMoneda(monto) {
    return `S/ ${monto.toFixed(2)}`;
}

// =========================================================================
// INICIALIZACIÓN PRINCIPAL
// =========================================================================

function inicializarAplicacion() {
    const pagina = window.location.pathname.split('/').pop();
    console.log('📄 Página actual:', pagina);
    
    // Configuración común para todas las páginas
    configurarNavegacion();
    configurarFormulariosBasicos();
    
    // Inicialización por página
    switch(pagina) {
        case 'calculadora.html': 
            inicializarCalculadora(); 
            break;
        case 'turnos.html': 
            inicializarTurnos(); 
            break;
        case 'denuncias.html': 
            inicializarDenuncias(); 
            break;
        case 'mapa.html': 
            inicializarMapa(); 
            break;
        case 'estadisticas-avanzadas.html': 
            inicializarEstadisticas();  // ¡ESTA LÍNEA DEBE ESTAR!
            break;
        default:
            console.log('Página sin inicialización específica');
    }
}
function configurarNavegacion() {
    // Navegación responsiva básica
    const nav = document.querySelector('nav');
    if (nav && window.innerWidth < 768) {
        nav.style.flexDirection = 'column';
    }
}

function configurarFormulariosBasicos() {
    // Validación básica para todos los formularios
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const invalidos = Array.from(this.querySelectorAll('[required]'))
                .filter(input => !input.value.trim());
            
            if (invalidos.length > 0) {
                e.preventDefault();
                alert('Complete los campos requeridos');
                invalidos[0].focus();
            }
        });
    });
}

// =========================================================================
// MÓDULO CALCULADORA 
// =========================================================================

// Datos de la calculadora
// ARREGLO BIDIMENSIONAL
const matrizTramites = [
    // Migraciones
    ["migraciones", "Pasaporte", 120, 10],
    ["migraciones", "Carné Extranjería", 80, 15],
    ["migraciones", "Prórroga de permanencia", 60, 5],
    ["migraciones", "Certificado de residencia", 25, 3],
    
    // Colegios Profesionales
    ["colegio", "Afiliación", 150, 3],
    ["colegio", "Colegiatura Anual", 300, 1],
    ["colegio", "Certificado de habilitación", 50, 2],
    ["colegio", "Constancia de conducta", 30, 2],
    
    // Municipalidades
    ["municipalidad", "Licencia de Funcionamiento", 200, 20],
    ["municipalidad", "Permiso de Construcción", 350, 30],
    ["municipalidad", "Reclamo de servicios", 0, 5],
    ["municipalidad", "Certificado de posesión", 40, 7],
    
    // Comisarías
    ["comisaria", "Antecedentes Penales", 15, 3],
    ["comisaria", "Denuncia virtual", 0, 1],
    ["comisaria", "Certificado policial", 20, 2],
    ["comisaria", "Constancia de domicilio", 10, 1]
];

let historialCalculos = [];

function inicializarCalculadora() {
    console.log('🔢 Inicializando calculadora...');
    
    // Event listeners existentes...
    document.getElementById('institucion')?.addEventListener('change', cargarTramites);
    document.getElementById('btnCalcular')?.addEventListener('click', calcularCosto);
    document.getElementById('btnLimpiar')?.addEventListener('click', limpiarCalculadora);
    
    // ¡NUEVO: Agregar event listener para el botón de ejemplos!
    document.getElementById('btnEjemplos')?.addEventListener('click', mostrarEjemplosOperaciones);
    
    // Datos iniciales
    cargarTablaPrecios();
    
    setTimeout(() => {
        alert('Bienvenido a la Calculadora de Trámites');
    }, 500);
}

function cargarTramites() {
    const institucion = this.value;
    const select = document.getElementById('tramite');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    matrizTramites.forEach((tramite, index) => {
        if (tramite[0] === institucion) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = tramite[1];
            select.appendChild(option);
        }
    });
}

//  EJECUCION LINEA POR LINEA
function calcularCosto() {
    const tramiteIndex = document.getElementById('tramite').value;
    // >>>>>>>>> OPERADOR OR 
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const esUrgente = document.getElementById('urgente').checked;
    //>>>>>>>>> OPERADOR NOT
    if (!tramiteIndex) {
        alert('Seleccione un trámite');
        return;
    }
    
    const tramite = matrizTramites[tramiteIndex];
    const costoBase = tramite[2] * cantidad;
    const recargo = esUrgente ? costoBase * 0.2 : 0;
    const impuestos = costoBase * IMPUESTO_IGV;
    const total = costoBase + recargo + impuestos;
    
    // Mostrar resultado
    const resultado = document.getElementById('resultado');
    const detalles = document.getElementById('detallesResultado');
    
    detalles.innerHTML = `
        <div class="grid-two">
            <div>
                <h4>Detalles</h4>
                <p><strong>Trámite:</strong> ${tramite[1]}</p>
                <p><strong>Institución:</strong> ${capitalizar(tramite[0])}</p>
                <p><strong>Cantidad:</strong> ${cantidad}</p>
            </div>
            <div>
                <h4>Resultado</h4>
                <p><strong>Total:</strong> ${formatoMoneda(total)}</p>
                <p><strong>Tiempo:</strong> ${tramite[3]} días</p>
                <p><strong>Urgente:</strong> ${esUrgente ? 'Sí' : 'No'}</p>
            </div>
        </div>
    `;
    
    resultado.classList.remove('hidden');
}

function cargarTablaPrecios() {
    const cuerpo = document.getElementById('cuerpoTabla');
    if (!cuerpo) return;
    
    matrizTramites.forEach(tramite => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${capitalizar(tramite[0])}</td>
            <td>${tramite[1]}</td>
            <td>${formatoMoneda(tramite[2])}</td>
            <td>${tramite[3]} días</td>
        `;
        cuerpo.appendChild(fila);
    });
}

function limpiarCalculadora() {
    document.getElementById('formCalculadora').reset();
    toggleElemento('resultado', false);
}

// =========================================================================
// 2.- MÓDULO TURNOS
// =========================================================================

// ARREGLO UNIDIMENSIONAL <------------ 
const serviciosTurnos = [ 
    ["migraciones", "Pasaporte", 30, 20],
    ["comisaria", "Antecedentes Penales", 15, 30],
    ["municipalidad", "Licencia", 90, 5]
];

let turnosReservados = [];

function inicializarTurnos() {
    console.log('🕐 Inicializando turnos...');
    
    // Event listeners
    document.getElementById('institucionTurno')?.addEventListener('change', cargarServiciosTurnos);
    document.getElementById('btnVerificarTurno')?.addEventListener('click', verificarTurno);
    document.getElementById('btnReservarTurno')?.addEventListener('click', reservarTurno);
    document.getElementById('btnLimpiarTurno')?.addEventListener('click', limpiarTurnoForm);
    
    // Cargar horarios
    cargarHorarios();
    
    setTimeout(() => {
        alert('Bienvenido al Sistema de Turnos');
    }, 500);
    // ENTRADA DE DATOS
    const dniInput = document.getElementById("dni");
    const btnReservar = document.getElementById("btnReservarTurno");
    const btnVerificar = document.getElementById("btnVerificarTurno");

    // --- Controlar habilitación del botón usando atributos DOM ---
    dniInput.addEventListener("input", function() {

        // Si DNI está incompleto o vacío → DESHABILITAR
        if (dniInput.value.trim().length !== 8) {

            // Aplica setAttribute()
            btnReservar.setAttribute("disabled", "disabled");
            btnReservar.style.opacity = "0.5";

        } else {

            // Si el DNI esta completo, se muestra el boton
            if (btnReservar.hasAttribute("disabled")) {
                btnReservar.removeAttribute("disabled");
                btnReservar.style.opacity = "1";
            }
        }
    });
    
    // =============================
    // NAVEGACIÓN ENTRE NODOS
    // =============================

    btnVerificar.addEventListener("click", function () {

        // (A) parentNode
        const parent = btnVerificar.parentNode;
        console.log("parentNode del botón:", parent);
        parent.style.background = "lightyellow";

        // (B) childNodes
        console.log("childNodes del form:", parent.childNodes);
        parent.childNodes.forEach(n => {
        if (n.nodeType === 1) { 
            n.style.border = "1px dashed red";
        }
        });

        // (C) firstElementChild
        console.log("Primer elemento dentro del form:", parent.firstElementChild);
        parent.firstElementChild.style.background = "#d4f8d4";
        parent.firstElementChild.focus();


        // (D) nextElementSibling
        console.log("Elemento siguiente al botón 'Verificar':", btnVerificar.nextElementSibling);
        btnVerificar.nextElementSibling.textContent = "Buscando disponibilidad...";


        // (E) previousSibling
        console.log("Nodo hermano anterior:", btnVerificar.previousSibling);
        btnVerificar.previousElementSibling.style.color = "blue";


    });

}

function cargarServiciosTurnos() {
    const institucion = this.value;
    const select = document.getElementById('servicio');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    serviciosTurnos.forEach((servicio, index) => {
        if (servicio[0] === institucion) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${servicio[1]} (${servicio[2]} min)`;
            select.appendChild(option);
        }
    });
}

function cargarHorarios() {
    const select = document.getElementById('hora');
    if (!select) return;
    
    const horarios = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        select.appendChild(option);
    });
}
// ENTRADA DE DATOS
function verificarTurno() {
    const servicioIndex = document.getElementById('servicio').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const dni = document.getElementById('dni').value;
    
    // >>>>>>>>> OPERADOR AND
    if (!servicioIndex || !fecha || !hora) {
        alert('Complete todos los campos');
        return;
    }
    
    if (!validarDNI(dni)) {
        alert('DNI debe tener 8 dígitos');
        return;
    }
    
    // ESTRUCTURA REPETITIVA
    const disponible = Math.random() > 0.3;
    
    const resultado = document.getElementById('resultadoTurno');
    const detalles = document.getElementById('detallesTurno');
    const btnReservar = document.getElementById('btnReservarTurno');
    
    if (disponible) {
        detalles.innerHTML = '<p style="color: green;">✅ Turno disponible</p>';
        btnReservar.disabled = false;
    } else {
        detalles.innerHTML = '<p style="color: red;">❌ Turno no disponible</p>';
        btnReservar.disabled = true;
    }
    
    resultado.classList.remove('hidden');
}

function reservarTurno() {
    const servicioIndex = document.getElementById('servicio').value;
    const servicio = serviciosTurnos[servicioIndex];
    
    const nuevoTurno = {
        id: Date.now(),
        servicio: servicio[1],
        institucion: servicio[0],
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        dni: document.getElementById('dni').value,
        estado: 'pendiente',
        fechaReserva: new Date().toLocaleString()
    };
    
    turnosReservados.push(nuevoTurno);
    alert('✅ Turno reservado exitosamente');
    
    actualizarListaTurnos();
    limpiarTurnoForm();
}

function actualizarListaTurnos() {
    const lista = document.getElementById('listaTurnos');
    if (!lista) return;
    
    if (turnosReservados.length === 0) {
        lista.innerHTML = '<p>No hay turnos reservados</p>';
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    turnosReservados.forEach(turno => {
        html += `
            <tr>
                <td>${turno.servicio}</td>
                <td>${turno.fecha}</td>
                <td>${turno.hora}</td>
                <td>${turno.estado}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    lista.innerHTML = html;
}

function limpiarTurnoForm() {
    document.getElementById('formTurno').reset();
    toggleElemento('resultadoTurno', false);
    document.getElementById('btnReservarTurno').disabled = true;
}

// =========================================================================
// 3.- MÓDULO DENUNCIAS
// =========================================================================

let denuncias = [];

function inicializarDenuncias() {
    console.log('🚨 Inicializando denuncias...');
    
    document.getElementById('anonimo')?.addEventListener('change', function() {
        document.getElementById('datosDenunciante').style.display = this.checked ? 'none' : 'block';
    });
    
    document.getElementById('btnRegistrarDenuncia')?.addEventListener('click', registrarDenuncia);
    document.getElementById('btnLimpiarDenuncia')?.addEventListener('click', () => {
        document.getElementById('formDenuncia').reset();
    });
    
    // Ejemplos de estructuras repetitivas
    document.getElementById('btnEjemploFor')?.addEventListener('click', ejemploFor);
    document.getElementById('btnEjemploWhile')?.addEventListener('click', ejemploWhile);
    document.getElementById('btnEjemploForEach')?.addEventListener('click', ejemploForEach);

    denuncias = [
        {id: 1, tipo: 'negligencia', institucion: 'migraciones', descripcion: 'Demora excesiva', fecha: '2024-01-15', estado: 'investigacion', numero: 'DEN-123456'},
        {id: 2, tipo: 'maltrato', institucion: 'policia', descripcion: 'Trato inadecuado', fecha: '2024-01-10', estado: 'pendiente', numero: 'DEN-234567'}
    ];
    
    mostrarDenuncias();
}

function registrarDenuncia() {
    const tipo = document.getElementById('tipoDenuncia').value;
    const institucion = document.getElementById('institucionDenuncia').value;
    const descripcion = document.getElementById('descripcion').value;
    const fechaHechos = document.getElementById('fechaHechos').value;
    
    if (!tipo || !institucion || !descripcion || !fechaHechos) {
        return alert('Complete todos los campos requeridos');
    }
    
    const nuevaDenuncia = {
        id: Date.now(),
        tipo: tipo,
        institucion: institucion,
        descripcion: descripcion,
        fechaHechos: fechaHechos,
        fechaRegistro: new Date().toLocaleString(),
        estado: 'pendiente',
        numero: 'DEN-' + Math.floor(100000 + Math.random() * 900000)
    };
    
    denuncias.push(nuevaDenuncia);
    alert(`✅ Denuncia registrada\nNúmero: ${nuevaDenuncia.numero}`);
    mostrarDenuncias();
}

function mostrarDenuncias() {
    const lista = document.getElementById('listaDenuncias');
    if (!lista) return;
    
    if (denuncias.length === 0) {
        lista.innerHTML = '<p>No hay denuncias</p>';
        return;
    }
    
    let html = '<table><tr><th>Número</th><th>Tipo</th><th>Institución</th><th>Estado</th><th>Acciones</th></tr>';
    
    // ESTRUCTURA REPETITIVA: FOR
    for (let i = 0; i < denuncias.length; i++) {
        const d = denuncias[i];
        html += `<tr>
            <td>${d.numero}</td>
            <td>${capitalizar(d.tipo)}</td>
            <td>${capitalizar(d.institucion)}</td>
            <td>${capitalizar(d.estado)}</td>
            <td>
                <button onclick="verDenuncia(${d.id})" class="btn-like">Ver</button>
                <button onclick="cambiarEstado(${d.id})" class="btn-like">Estado</button>
            </td>
        </tr>`;
    }
    
    lista.innerHTML = html + '</table>';
}

function verDenuncia(id) {
    const d = denuncias.find(d => d.id === id);
    if (d) alert(`Denuncia ${d.numero}\nTipo: ${d.tipo}\nEstado: ${d.estado}\nDesc: ${d.descripcion}`);
}

function cambiarEstado(id) {
    const d = denuncias.find(d => d.id === id);
    if (d) {
        d.estado = d.estado === 'pendiente' ? 'investigacion' : 
                   d.estado === 'investigacion' ? 'resuelta' : 'pendiente';
        mostrarDenuncias();
    }
}

function ejemploFor() {
    let resultado = '<h4>Conteo por tipo:</h4><ul>';
    const tipos = ['negligencia', 'maltrato', 'corrupcion'];
    
    for (let i = 0; i < tipos.length; i++) {
        const count = denuncias.filter(d => d.tipo === tipos[i]).length;
        resultado += `<li>${capitalizar(tipos[i])}: ${count}</li>`;
    }
    document.getElementById('resultadoFor').innerHTML = resultado + '</ul>';
}

function ejemploWhile() {
    let resultado = '<h4>Pendientes:</h4><ul>';
    let i = 0;
    
    while (i < denuncias.length) {
        if (denuncias[i].estado === 'pendiente') {
            resultado += `<li>${denuncias[i].numero}</li>`;
        }
        i++;
    }
    document.getElementById('resultadoWhile').innerHTML = resultado + '</ul>';
}

function ejemploForEach() {
    let resultado = '<h4>Por institución:</h4><ul>';
    const conteo = {};
    
    denuncias.forEach(d => {
        conteo[d.institucion] = (conteo[d.institucion] || 0) + 1;
    });
    
    Object.keys(conteo).forEach(inst => {
        resultado += `<li>${capitalizar(inst)}: ${conteo[inst]}</li>`;
    });
    document.getElementById('resultadoForEach').innerHTML = resultado + '</ul>';
}


// =========================================================================
// 4.- MÓDULO ESTADÍSTICAS AVANZADAS (VERSIÓN COMPACTA)
// =========================================================================

// ARREGLO BIDIMENSIONAL
const datosEstadisticos = [
    ["2024", "migraciones", 15000, 1800000, 14500, 85],
    ["2024", "comisaria", 25000, 375000, 23000, 78],
    ["2024", "municipalidad", 18000, 3600000, 16500, 82],
    ["2024", "colegio", 12000, 3600000, 11500, 88],
    
    ["2023", "migraciones", 13500, 1620000, 13000, 82],
    ["2023", "comisaria", 22000, 330000, 20500, 75],
    ["2023", "municipalidad", 16500, 3300000, 15500, 79],
    ["2023", "colegio", 11000, 3300000, 10500, 85],
    
    ["2022", "migraciones", 12000, 1440000, 11500, 80],
    ["2022", "comisaria", 20000, 300000, 18500, 72],
    ["2022", "municipalidad", 15000, 3000000, 14000, 76],
    ["2022", "colegio", 10000, 3000000, 9500, 83]
];

function inicializarEstadisticas() {
    console.log('📊 Inicializando estadísticas avanzadas...');
    
    // Event listeners
    document.getElementById('btnGenerarEstadisticas')?.addEventListener('click', generarEstadisticas);
    document.getElementById('btnExportarDatos')?.addEventListener('click', exportarDatos);
    document.getElementById('btnEjemploMatriz')?.addEventListener('click', ejemploMatriz);
    document.getElementById('btnEjemploOperaciones')?.addEventListener('click', ejemploOperaciones);
    document.getElementById('btnEjemploProcesamiento')?.addEventListener('click', ejemploProcesamiento);

    cargarTablaDatos();
    
    setTimeout(() => {
        alert('📊 Bienvenido a Estadísticas Avanzadas\n\nAnalice datos institucionales usando arreglos bidimensionales.');
    }, 500);
}

// >>>>>>>>>>>>>>> PROCESAMIENTO DE DATOS
function generarEstadisticas() {
    const institucion = document.getElementById('institucionEstadistica').value;
    const periodo = document.getElementById('periodoEstadistica').value;
    const resultados = document.getElementById('resultadosEstadisticas');
    
    if (!resultados) return;
    
    // Filtrar datos según selección
    let datosFiltrados;
    if (institucion === 'todas') {
        datosFiltrados = datosEstadisticos.filter(fila => fila[0] === periodo);
    } else {
        datosFiltrados = datosEstadisticos.filter(fila => fila[0] === periodo && fila[1] === institucion);
    }
    
    if (datosFiltrados.length === 0) {
        resultados.innerHTML = '<p>No hay datos para los criterios seleccionados</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalTramites = datosFiltrados.reduce((sum, fila) => sum + fila[2], 0);
    const totalIngresos = datosFiltrados.reduce((sum, fila) => sum + fila[3], 0);
    const totalUsuarios = datosFiltrados.reduce((sum, fila) => sum + fila[4], 0);
    const promedioSatisfaccion = datosFiltrados.reduce((sum, fila) => sum + fila[5], 0) / datosFiltrados.length;
    
    // Encontrar máximo y mínimo
    const maxTramites = Math.max(...datosFiltrados.map(fila => fila[2]));
    const minTramites = Math.min(...datosFiltrados.map(fila => fila[2]));
    
    // >>>>>>>>>> VISUALIZACION EN HTML
    // SALIDA DE DATOS
    resultados.innerHTML = `
        <div class="grid">
            <div class="card">
                <h4>📈 Resumen General</h4>
                <p><strong>Total Trámites:</strong> ${totalTramites.toLocaleString()}</p>
                <p><strong>Total Ingresos:</strong> ${formatoMoneda(totalIngresos)}</p>
                <p><strong>Total Usuarios:</strong> ${totalUsuarios.toLocaleString()}</p>
                <p><strong>Satisfacción Promedio:</strong> ${promedioSatisfaccion.toFixed(1)}%</p>
            </div>
            
            <div class="card">
                <h4>🎯 Análisis Comparativo</h4>
                <p><strong>Máx. Trámites:</strong> ${maxTramites.toLocaleString()}</p>
                <p><strong>Mín. Trámites:</strong> ${minTramites.toLocaleString()}</p>
                <p><strong>Institución Más Activa:</strong> ${encontrarInstitucionMasActiva(datosFiltrados)}</p>
                <p><strong>Crecimiento vs Año Anterior:</strong> ${calcularCrecimiento(periodo, institucion)}%</p>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <h4>📋 Datos Detallados</h4>
            <div class="chart-container">
                ${generarBarrasEstadisticas(datosFiltrados)}
            </div>
        </div>
    `;
}

function encontrarInstitucionMasActiva(datos) {
    if (datos.length === 0) return 'N/A';
    
    let maxIndex = 0;
    for (let i = 1; i < datos.length; i++) {
        if (datos[i][2] > datos[maxIndex][2]) {
            maxIndex = i;
        }
    }
    return capitalizar(datos[maxIndex][1]);
}

function calcularCrecimiento(periodo, institucion) {
    const añoActual = parseInt(periodo);
    const añoAnterior = (añoActual - 1).toString();
    
    const datosActual = datosEstadisticos.find(fila => fila[0] === periodo && fila[1] === institucion);
    const datosAnterior = datosEstadisticos.find(fila => fila[0] === añoAnterior && fila[1] === institucion);
    
    if (!datosActual || !datosAnterior) return 0;
    
    const crecimiento = ((datosActual[2] - datosAnterior[2]) / datosAnterior[2]) * 100;
    return crecimiento.toFixed(1);
}

function generarBarrasEstadisticas(datos) {
    let html = '';
    
    datos.forEach(fila => {
        const porcentaje = (fila[2] / 30000) * 100; // Normalizar a 30000 como máximo
        html += `
            <div class="chart-bar">
                <span style="width: 120px;">${capitalizar(fila[1])}</span>
                <div class="bar" style="width: ${porcentaje}%"></div>
                <span style="margin-left: 10px;">${fila[2].toLocaleString()}</span>
            </div>
        `;
    });
    
    return html;
}

function cargarTablaDatos() {
    const cuerpo = document.getElementById('cuerpoTablaDatos');
    if (!cuerpo) return;
    
    // ESTRUCTURA REPETITIVA: FOR para arreglo bidimensional
    for (let i = 0; i < datosEstadisticos.length; i++) {
        const fila = datosEstadisticos[i];
        const tr = document.createElement('tr');
        
        // Aplicar estilo según el año
        if (fila[0] === '2024') {
            tr.style.backgroundColor = '#f0f9ff';
        }
        
        tr.innerHTML = `
            <td><strong>${fila[0]}</strong></td>
            <td>${capitalizar(fila[1])}</td>
            <td>${fila[2].toLocaleString()}</td>
            <td>${formatoMoneda(fila[3])}</td>
            <td>${fila[4].toLocaleString()}</td>
            <td>${fila[5]}%</td>
        `;
        
        cuerpo.appendChild(tr);
    }
}

function exportarDatos() {
    let csv = 'Año,Institución,Trámites,Ingresos,Usuarios,Satisfacción\n';
    
    datosEstadisticos.forEach(fila => {
        csv += `${fila[0]},${capitalizar(fila[1])},${fila[2]},${fila[3]},${fila[4]},${fila[5]}%\n`;
    });
    
    // Simular descarga
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estadisticas_instituciones.csv';
    a.click();
    
    alert('📤 Datos exportados como CSV');
}

function ejemploProcesamiento() {
    const resultado = document.getElementById('resultadoProcesamiento');
    
    let html = '<h4>Procesamiento de Datos Estadísticos:</h4>';
    
    // Agrupar por institución
    const porInstitucion = {};
    datosEstadisticos.forEach(fila => {
        const institucion = fila[1];
        if (!porInstitucion[institucion]) {
            porInstitucion[institucion] = [];
        }
        porInstitucion[institucion].push(fila);
    });
    
    // Calcular promedios por institución
    html += '<div class="grid">';
    Object.keys(porInstitucion).forEach(inst => {
        const datos = porInstitucion[inst];
        const promedioTramites = datos.reduce((sum, fila) => sum + fila[2], 0) / datos.length;
        const promedioSatisfaccion = datos.reduce((sum, fila) => sum + fila[5], 0) / datos.length;
        
        html += `
            <div class="card">
                <h4>${capitalizar(inst)}</h4>
                <p><strong>Trámites promedio:</strong> ${Math.round(promedioTramites).toLocaleString()}</p>
                <p><strong>Satisfacción promedio:</strong> ${promedioSatisfaccion.toFixed(1)}%</p>
                <p><strong>Datos disponibles:</strong> ${datos.length} años</p>
            </div>
        `;
    });
    
    resultado.innerHTML = html + '</div>';
}

document.addEventListener('DOMContentLoaded', inicializarAplicacion);

// ==================== 
// ==================== 
//==================== 
//==================== 
// gestion.js 
class SistemaGestion {
    constructor() {
        this.clientes = this.cargarDatos('clientes') || [];
        this.proveedores = this.cargarDatos('proveedores') || [];
        this.servicios = this.cargarDatos('servicios') || [];
        this.inventario = this.cargarDatos('inventario') || [];
        
        // Cargar datos de ejemplo si está vacío
        if (this.clientes.length === 0) {
            this.cargarDatosEjemplo();
        }
    }

    // ==================== OPERACIONES CLIENTES ====================
    insertarCliente(cliente) {
        cliente.id = Date.now();
        cliente.fechaRegistro = new Date().toLocaleString();
        this.clientes.push(cliente);
        this.guardarDatos('clientes', this.clientes);
        return cliente;
    }

    buscarCliente(criterio, valor) {
        return this.clientes.filter(cliente => 
            cliente[criterio].toString().toLowerCase().includes(valor.toLowerCase())
        );
    }

    editarCliente(id, nuevosDatos) {
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.clientes[index] = { ...this.clientes[index], ...nuevosDatos };
            this.guardarDatos('clientes', this.clientes);
            return true;
        }
        return false;
    }

    eliminarCliente(id) {
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.clientes.splice(index, 1);
            this.guardarDatos('clientes', this.clientes);
            return true;
        }
        return false;
    }

    mostrarClientes() {
        return this.clientes;
    }

    ordenarClientes(criterio, orden = 'asc') {
        return [...this.clientes].sort((a, b) => {
            let valorA = a[criterio];
            let valorB = b[criterio];
            
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            if (orden === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });
    }

    // ==================== OPERACIONES PROVEEDORES ====================
    insertarProveedor(proveedor) {
        proveedor.id = Date.now();
        proveedor.fechaRegistro = new Date().toLocaleString();
        this.proveedores.push(proveedor);
        this.guardarDatos('proveedores', this.proveedores);
        return proveedor;
    }

    buscarProveedor(criterio, valor) {
        return this.proveedores.filter(proveedor => 
            proveedor[criterio].toString().toLowerCase().includes(valor.toLowerCase())
        );
    }

    editarProveedor(id, nuevosDatos) {
        const index = this.proveedores.findIndex(p => p.id === id);
        if (index !== -1) {
            this.proveedores[index] = { ...this.proveedores[index], ...nuevosDatos };
            this.guardarDatos('proveedores', this.proveedores);
            return true;
        }
        return false;
    }

    eliminarProveedor(id) {
        const index = this.proveedores.findIndex(p => p.id === id);
        if (index !== -1) {
            this.proveedores.splice(index, 1);
            this.guardarDatos('proveedores', this.proveedores);
            return true;
        }
        return false;
    }

    mostrarProveedores() {
        return this.proveedores;
    }

    ordenarProveedores(criterio, orden = 'asc') {
        return [...this.proveedores].sort((a, b) => {
            let valorA = a[criterio];
            let valorB = b[criterio];
            
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            if (orden === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });
    }

    // ==================== OPERACIONES SERVICIOS ====================
    insertarServicio(servicio) {
        servicio.id = Date.now();
        this.servicios.push(servicio);
        this.guardarDatos('servicios', this.servicios);
        return servicio;
    }

    buscarServicio(criterio, valor) {
        return this.servicios.filter(servicio => 
            servicio[criterio].toString().toLowerCase().includes(valor.toLowerCase())
        );
    }

    editarServicio(id, nuevosDatos) {
        const index = this.servicios.findIndex(s => s.id === id);
        if (index !== -1) {
            this.servicios[index] = { ...this.servicios[index], ...nuevosDatos };
            this.guardarDatos('servicios', this.servicios);
            return true;
        }
        return false;
    }

    eliminarServicio(id) {
        const index = this.servicios.findIndex(s => s.id === id);
        if (index !== -1) {
            this.servicios.splice(index, 1);
            this.guardarDatos('servicios', this.servicios);
            return true;
        }
        return false;
    }

    mostrarServicios() {
        return this.servicios;
    }

    ordenarServicios(criterio, orden = 'asc') {
        return [...this.servicios].sort((a, b) => {
            let valorA = a[criterio];
            let valorB = b[criterio];
            
            if (criterio === 'precio') {
                return orden === 'asc' ? valorA - valorB : valorB - valorA;
            }
            
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            return orden === 'asc' ? 
                (valorA > valorB ? 1 : -1) : 
                (valorA < valorB ? 1 : -1);
        });
    }

    // ==================== OPERACIONES INVENTARIO ====================
    insertarItemInventario(item) {
        item.id = Date.now();
        item.fechaActualizacion = new Date().toLocaleString();
        this.inventario.push(item);
        this.guardarDatos('inventario', this.inventario);
        return item;
    }

    buscarItemInventario(criterio, valor) {
        return this.inventario.filter(item => 
            item[criterio].toString().toLowerCase().includes(valor.toLowerCase())
        );
    }

    editarItemInventario(id, nuevosDatos) {
        const index = this.inventario.findIndex(i => i.id === id);
        if (index !== -1) {
            this.inventario[index] = { ...this.inventario[index], ...nuevosDatos };
            this.guardarDatos('inventario', this.inventario);
            return true;
        }
        return false;
    }

    eliminarItemInventario(id) {
        const index = this.inventario.findIndex(i => i.id === id);
        if (index !== -1) {
            this.inventario.splice(index, 1);
            this.guardarDatos('inventario', this.inventario);
            return true;
        }
        return false;
    }

    mostrarInventario() {
        return this.inventario;
    }

    ordenarInventario(criterio, orden = 'asc') {
        return [...this.inventario].sort((a, b) => {
            let valorA = a[criterio];
            let valorB = b[criterio];
            
            if (criterio === 'cantidad' || criterio === 'precio') {
                return orden === 'asc' ? valorA - valorB : valorB - valorA;
            }
            
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            return orden === 'asc' ? 
                (valorA > valorB ? 1 : -1) : 
                (valorA < valorB ? 1 : -1);
        });
    }

    // ==================== UTILIDADES ====================
    guardarDatos(clave, datos) {
        localStorage.setItem(`sistema_${clave}`, JSON.stringify(datos));
    }

    cargarDatos(clave) {
        const datos = localStorage.getItem(`sistema_${clave}`);
        return datos ? JSON.parse(datos) : null;
    }

    // ==================== DATOS DE EJEMPLO ====================
    cargarDatosEjemplo() {
        this.clientes = [
            {
                id: 1,
                nombre: "Juan Pérez",
                dni: "12345678",
                email: "juan@email.com",
                telefono: "999888777",
                direccion: "Av. Principal 123",
                tipo: "afiliado",
                fechaRegistro: "2024-01-15"
            },
            {
                id: 2,
                nombre: "María García",
                dni: "87654321", 
                email: "maria@email.com",
                telefono: "999777666",
                direccion: "Calle Secundaria 456",
                tipo: "cliente",
                fechaRegistro: "2024-01-20"
            },
            {
                id: 3,
                nombre: "Carlos Rodríguez",
                dni: "45678912",
                email: "carlos@email.com", 
                telefono: "999666555",
                direccion: "Jr. Los Olivos 789",
                tipo: "proveedor",
                fechaRegistro: "2024-02-01"
            }
        ];

        this.proveedores = [
            {
                id: 1,
                razonSocial: "Tecnologías Avanzadas SAC",
                ruc: "20123456789",
                contacto: "Carlos López",
                telefono: "999555444",
                email: "proveedor1@empresa.com",
                servicio: "Equipos de cómputo",
                estado: "activo",
                fechaRegistro: "2024-01-10"
            },
            {
                id: 2,
                razonSocial: "Suministros Oficina EIRL",
                ruc: "20234567890",
                contacto: "Ana Martínez",
                telefono: "999444333", 
                email: "proveedor2@empresa.com",
                servicio: "Material de oficina",
                estado: "activo",
                fechaRegistro: "2024-01-12"
            },
            {
                id: 3,
                razonSocial: "Servicios Generales Perú",
                ruc: "20345678901",
                contacto: "Luis Fernández",
                telefono: "999333222",
                email: "proveedor3@empresa.com", 
                servicio: "Limpieza y mantenimiento",
                estado: "activo",
                fechaRegistro: "2024-01-15"
            }
        ];

        this.servicios = [
            {
                id: 1,
                nombre: "Asesoría Legal Básica",
                descripcion: "Consulta legal inicial de 30 minutos",
                precio: 50,
                duracion: "30 min",
                categoria: "legal",
                estado: "activo"
            },
            {
                id: 2,
                nombre: "Tramitación Documentaria",
                descripcion: "Gestión completa de documentos oficiales",
                precio: 120,
                duracion: "5 días",
                categoria: "tramites",
                estado: "activo"
            },
            {
                id: 3,
                nombre: "Consultoría Especializada",
                descripcion: "Asesoramiento técnico especializado",
                precio: 200,
                duracion: "1 hora",
                categoria: "consultoria", 
                estado: "activo"
            }
        ];

        this.inventario = [
            {
                id: 1,
                nombre: "Computadora Dell",
                categoria: "equipos",
                cantidad: 15,
                precio: 2500,
                proveedor: "Tecnologías Avanzadas SAC",
                estado: "disponible",
                fechaActualizacion: "2024-01-20"
            },
            {
                id: 2,
                nombre: "Impresora HP Laser",
                categoria: "equipos", 
                cantidad: 8,
                precio: 800,
                proveedor: "Tecnologías Avanzadas SAC",
                estado: "disponible",
                fechaActualizacion: "2024-01-18"
            },
            {
                id: 3,
                nombre: "Sillas Oficina",
                categoria: "mobiliario",
                cantidad: 25,
                precio: 150,
                proveedor: "Suministros Oficina EIRL",
                estado: "disponible",
                fechaActualizacion: "2024-01-22"
            }
        ];

        // Guardar todos los datos
        this.guardarDatos('clientes', this.clientes);
        this.guardarDatos('proveedores', this.proveedores);
        this.guardarDatos('servicios', this.servicios);
        this.guardarDatos('inventario', this.inventario);
    }
}

// Instancia global del sistema
const sistemaGestion = new SistemaGestion();


        // ==================================================================      
        // ==================== SCRIPTS CALCULADORA.HTML ====================
        // ================================================================== 
        
        
 document.addEventListener('DOMContentLoaded', function() {
          inicializarSistemaInventario();
      });

      function inicializarSistemaInventario() {
          actualizarTablaInventario();
          actualizarResumenInventario();
          
          document.getElementById('btnInsertarItem').addEventListener('click', insertarItem);
          document.getElementById('btnActualizarItem').addEventListener('click', actualizarItem);
          document.getElementById('btnCancelarEdicionInv').addEventListener('click', cancelarEdicionInv);
          document.getElementById('btnLimpiarInventario').addEventListener('click', limpiarFormularioInventario);
          document.getElementById('btnBuscarInventario').addEventListener('click', buscarInventario);
          document.getElementById('btnOrdenarInventario').addEventListener('click', ordenarInventario);
          document.getElementById('btnMostrarTodoInv').addEventListener('click', mostrarTodoInventario);
      }

      function insertarItem() {
          const item = {
              nombre: document.getElementById('itemNombre').value,
              categoria: document.getElementById('itemCategoria').value,
              cantidad: parseInt(document.getElementById('itemCantidad').value),
              precio: parseFloat(document.getElementById('itemPrecio').value),
              proveedor: document.getElementById('itemProveedor').value,
              estado: document.getElementById('itemEstado').value
          };

          if (!item.nombre || !item.cantidad || !item.precio) {
              alert('Complete todos los campos requeridos');
              return;
          }

          sistemaGestion.insertarItemInventario(item);
          alert('✅ Item agregado al inventario exitosamente');
          limpiarFormularioInventario();
          actualizarTablaInventario();
          actualizarResumenInventario();
      }

      function buscarInventario() {
          const criterio = document.getElementById('criterioBusquedaInv').value;
          const valor = document.getElementById('valorBusquedaInv').value;
          
          if (!valor) {
              alert('Ingrese un valor para buscar');
              return;
          }

          const resultados = sistemaGestion.buscarItemInventario(criterio, valor);
          mostrarInventarioEnTabla(resultados);
      }

      function ordenarInventario() {
          const criterio = document.getElementById('criterioOrdenInv').value;
          const orden = document.getElementById('tipoOrdenInv').value;
          
          const inventarioOrdenado = sistemaGestion.ordenarInventario(criterio, orden);
          mostrarInventarioEnTabla(inventarioOrdenado);
      }

      function mostrarTodoInventario() {
          actualizarTablaInventario();
          document.getElementById('valorBusquedaInv').value = '';
      }

      function actualizarTablaInventario() {
          const inventario = sistemaGestion.mostrarInventario();
          mostrarInventarioEnTabla(inventario);
      }

      function mostrarInventarioEnTabla(inventario) {
          const tbody = document.getElementById('cuerpoTablaInventario');
          const total = document.getElementById('totalItems');
          
          total.textContent = inventario.length;
          
          if (inventario.length === 0) {
              tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay items en el inventario</td></tr>';
              return;
          }

          let html = '';
          inventario.forEach(item => {
              const valorTotal = item.cantidad * item.precio;
              html += `
                  <tr>
                      <td>${item.nombre}</td>
                      <td>${item.categoria}</td>
                      <td>${item.cantidad}</td>
                      <td>S/ ${item.precio.toFixed(2)}</td>
                      <td><strong>S/ ${valorTotal.toFixed(2)}</strong></td>
                      <td>${item.estado}</td>
                      <td>
                          <button onclick="editarItem(${item.id})" class="btn-like">✏️</button>
                          <button onclick="eliminarItem(${item.id})" class="btn-like">🗑️</button>
                      </td>
                  </tr>
              `;
          });
          
          tbody.innerHTML = html;
      }

      function actualizarResumenInventario() {
          const inventario = sistemaGestion.mostrarInventario();
          const resumen = document.getElementById('resumenInventario');
          
          const totalItems = inventario.length;
          const totalValor = inventario.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
          const categorias = [...new Set(inventario.map(item => item.categoria))];
          
          resumen.innerHTML = `
            <div class="card">
                <h4>📊 Resumen General</h4>
                <p><strong>Total Items:</strong> ${totalItems}</p>
                <p><strong>Valor Total:</strong> S/ ${totalValor.toFixed(2)}</p>
                <p><strong>Categorías:</strong> ${categorias.length}</p>
            </div>
            <div class="card">
                <h4>📈 Distribución</h4>
                <p><strong>Items Disponibles:</strong> ${inventario.filter(i => i.estado === 'disponible').length}</p>
                <p><strong>En Mantenimiento:</strong> ${inventario.filter(i => i.estado === 'mantenimiento').length}</p>
                <p><strong>En Uso:</strong> ${inventario.filter(i => i.estado === 'en-uso').length}</p>
            </div>
          `;
      }

      function editarItem(id) {
          const item = sistemaGestion.mostrarInventario().find(i => i.id === id);
          if (item) {
              document.getElementById('itemId').value = item.id;
              document.getElementById('itemNombre').value = item.nombre;
              document.getElementById('itemCategoria').value = item.categoria;
              document.getElementById('itemCantidad').value = item.cantidad;
              document.getElementById('itemPrecio').value = item.precio;
              document.getElementById('itemProveedor').value = item.proveedor || '';
              document.getElementById('itemEstado').value = item.estado;
              
              document.getElementById('btnInsertarItem').style.display = 'none';
              document.getElementById('btnActualizarItem').style.display = 'inline-block';
              document.getElementById('btnCancelarEdicionInv').style.display = 'inline-block';
          }
      }

      function actualizarItem() {
          const id = parseInt(document.getElementById('itemId').value);
          const nuevosDatos = {
              nombre: document.getElementById('itemNombre').value,
              categoria: document.getElementById('itemCategoria').value,
              cantidad: parseInt(document.getElementById('itemCantidad').value),
              precio: parseFloat(document.getElementById('itemPrecio').value),
              proveedor: document.getElementById('itemProveedor').value,
              estado: document.getElementById('itemEstado').value
          };

          if (sistemaGestion.editarItemInventario(id, nuevosDatos)) {
              alert('✅ Item actualizado exitosamente');
              cancelarEdicionInv();
              actualizarTablaInventario();
              actualizarResumenInventario();
          }
      }

      function eliminarItem(id) {
          if (confirm('¿Está seguro de eliminar este item del inventario?')) {
              if (sistemaGestion.eliminarItemInventario(id)) {
                  alert('✅ Item eliminado exitosamente');
                  actualizarTablaInventario();
                  actualizarResumenInventario();
              }
          }
      }

      function cancelarEdicionInv() {
          limpiarFormularioInventario();
          document.getElementById('btnInsertarItem').style.display = 'inline-block';
          document.getElementById('btnActualizarItem').style.display = 'none';
          document.getElementById('btnCancelarEdicionInv').style.display = 'none';
      }

      function limpiarFormularioInventario() {
          document.getElementById('formInventario').reset();
          document.getElementById('itemId').value = '';
      }
      
        // ==================================================================      
        // ==================== SCRIPTS COLEGIOS.HTML ====================
        // ================================================================== 
        
// Inicializar sistema de gestión
      document.addEventListener('DOMContentLoaded', function() {
          inicializarSistemaClientes();
      });

      function inicializarSistemaClientes() {
          // Cargar datos iniciales
          actualizarTablaClientes();
          
          // Event Listeners
          document.getElementById('btnInsertarCliente').addEventListener('click', insertarCliente);
          document.getElementById('btnActualizarCliente').addEventListener('click', actualizarCliente);
          document.getElementById('btnCancelarEdicion').addEventListener('click', cancelarEdicion);
          document.getElementById('btnLimpiarCliente').addEventListener('click', limpiarFormularioCliente);
          document.getElementById('btnBuscarClientes').addEventListener('click', buscarClientes);
          document.getElementById('btnMostrarTodos').addEventListener('click', mostrarTodosClientes);
          document.getElementById('btnOrdenarClientes').addEventListener('click', ordenarClientes);
      }

      function insertarCliente() {
          const cliente = {
              nombre: document.getElementById('clienteNombre').value,
              dni: document.getElementById('clienteDni').value,
              email: document.getElementById('clienteEmail').value,
              telefono: document.getElementById('clienteTelefono').value,
              direccion: document.getElementById('clienteDireccion').value,
              tipo: document.getElementById('clienteTipo').value
          };

          if (!cliente.nombre || !cliente.dni || !cliente.email || !cliente.telefono) {
              alert('Complete todos los campos requeridos');
              return;
          }

          sistemaGestion.insertarCliente(cliente);
          alert('✅ Afiliado registrado exitosamente');
          limpiarFormularioCliente();
          actualizarTablaClientes();
      }

      function buscarClientes() {
          const criterio = document.getElementById('criterioBusqueda').value;
          const valor = document.getElementById('valorBusqueda').value;
          
          if (!valor) {
              alert('Ingrese un valor para buscar');
              return;
          }

          const resultados = sistemaGestion.buscarCliente(criterio, valor);
          mostrarClientesEnTabla(resultados);
      }

      function ordenarClientes() {
          const criterio = document.getElementById('criterioOrden').value;
          const orden = document.getElementById('tipoOrden').value;
          
          const clientesOrdenados = sistemaGestion.ordenarClientes(criterio, orden);
          mostrarClientesEnTabla(clientesOrdenados);
      }

      function mostrarTodosClientes() {
          actualizarTablaClientes();
          document.getElementById('valorBusqueda').value = '';
      }

      function actualizarTablaClientes() {
          const clientes = sistemaGestion.mostrarClientes();
          mostrarClientesEnTabla(clientes);
      }

      function mostrarClientesEnTabla(clientes) {
          const tbody = document.getElementById('cuerpoTablaClientes');
          const total = document.getElementById('totalClientes');
          
          total.textContent = clientes.length;
          
          if (clientes.length === 0) {
              tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay afiliados registrados</td></tr>';
              return;
          }

          let html = '';
          clientes.forEach(cliente => {
              html += `
                  <tr>
                      <td>${cliente.nombre}</td>
                      <td>${cliente.dni}</td>
                      <td>${cliente.email}</td>
                      <td>${cliente.tipo}</td>
                      <td>${cliente.fechaRegistro}</td>
                      <td>
                          <button onclick="editarCliente(${cliente.id})" class="btn-like">✏️</button>
                          <button onclick="eliminarCliente(${cliente.id})" class="btn-like">🗑️</button>
                      </td>
                  </tr>
              `;
          });
          
          tbody.innerHTML = html;
      }

      function editarCliente(id) {
          const cliente = sistemaGestion.mostrarClientes().find(c => c.id === id);
          if (cliente) {
              document.getElementById('clienteId').value = cliente.id;
              document.getElementById('clienteNombre').value = cliente.nombre;
              document.getElementById('clienteDni').value = cliente.dni;
              document.getElementById('clienteEmail').value = cliente.email;
              document.getElementById('clienteTelefono').value = cliente.telefono;
              document.getElementById('clienteDireccion').value = cliente.direccion || '';
              document.getElementById('clienteTipo').value = cliente.tipo;
              
              document.getElementById('btnInsertarCliente').style.display = 'none';
              document.getElementById('btnActualizarCliente').style.display = 'inline-block';
              document.getElementById('btnCancelarEdicion').style.display = 'inline-block';
          }
      }

      function actualizarCliente() {
          const id = parseInt(document.getElementById('clienteId').value);
          const nuevosDatos = {
              nombre: document.getElementById('clienteNombre').value,
              dni: document.getElementById('clienteDni').value,
              email: document.getElementById('clienteEmail').value,
              telefono: document.getElementById('clienteTelefono').value,
              direccion: document.getElementById('clienteDireccion').value,
              tipo: document.getElementById('clienteTipo').value
          };

          if (sistemaGestion.editarCliente(id, nuevosDatos)) {
              alert('✅ Afiliado actualizado exitosamente');
              cancelarEdicion();
              actualizarTablaClientes();
          }
      }

      function eliminarCliente(id) {
          if (confirm('¿Está seguro de eliminar este afiliado?')) {
              if (sistemaGestion.eliminarCliente(id)) {
                  alert('✅ Afiliado eliminado exitosamente');
                  actualizarTablaClientes();
              }
          }
      }

      function cancelarEdicion() {
          limpiarFormularioCliente();
          document.getElementById('btnInsertarCliente').style.display = 'inline-block';
          document.getElementById('btnActualizarCliente').style.display = 'none';
          document.getElementById('btnCancelarEdicion').style.display = 'none';
      }

      function limpiarFormularioCliente() {
          document.getElementById('formCliente').reset();
          document.getElementById('clienteId').value = '';
      }
        
        // ==================================================================      
        // ==================== SCRIPTS TURNOS.HTML ====================
        // ================================================================== 
        
document.addEventListener('DOMContentLoaded', function() {
          inicializarSistemaServicios();
      });

      function inicializarSistemaServicios() {
          actualizarTablaServicios();
          actualizarEstadisticasServicios();
          
          document.getElementById('btnInsertarServicio').addEventListener('click', insertarServicio);
          document.getElementById('btnActualizarServicio').addEventListener('click', actualizarServicio);
          document.getElementById('btnCancelarEdicionServ').addEventListener('click', cancelarEdicionServ);
          document.getElementById('btnLimpiarServicio').addEventListener('click', limpiarFormularioServicio);
          document.getElementById('btnBuscarServicios').addEventListener('click', buscarServicios);
          document.getElementById('btnOrdenarServicios').addEventListener('click', ordenarServicios);
          document.getElementById('btnMostrarTodosServ').addEventListener('click', mostrarTodosServicios);
          document.getElementById('btnServiciosActivos').addEventListener('click', mostrarServiciosActivos);
      }

      function insertarServicio() {
          const servicio = {
              nombre: document.getElementById('servicioNombre').value,
              descripcion: document.getElementById('servicioDescripcion').value,
              categoria: document.getElementById('servicioCategoria').value,
              precio: parseFloat(document.getElementById('servicioPrecio').value),
              duracion: document.getElementById('servicioDuracion').value,
              estado: document.getElementById('servicioEstado').value,
              institucion: document.getElementById('servicioInstitucion').value
          };

          if (!servicio.nombre || !servicio.descripcion || !servicio.precio) {
              alert('Complete todos los campos requeridos');
              return;
          }

          sistemaGestion.insertarServicio(servicio);
          alert('✅ Servicio agregado al catálogo exitosamente');
          limpiarFormularioServicio();
          actualizarTablaServicios();
          actualizarEstadisticasServicios();
      }

      function buscarServicios() {
          const criterio = document.getElementById('criterioBusquedaServ').value;
          const valor = document.getElementById('valorBusquedaServ').value;
          
          if (!valor) {
              alert('Ingrese un valor para buscar');
              return;
          }

          const resultados = sistemaGestion.buscarServicio(criterio, valor);
          mostrarServiciosEnTabla(resultados);
      }

      function ordenarServicios() {
          const criterio = document.getElementById('criterioOrdenServ').value;
          const orden = document.getElementById('tipoOrdenServ').value;
          
          const serviciosOrdenados = sistemaGestion.ordenarServicios(criterio, orden);
          mostrarServiciosEnTabla(serviciosOrdenados);
      }

      function mostrarTodosServicios() {
          actualizarTablaServicios();
          document.getElementById('valorBusquedaServ').value = '';
      }

      function mostrarServiciosActivos() {
          const servicios = sistemaGestion.mostrarServicios();
          const serviciosActivos = servicios.filter(s => s.estado === 'activo');
          mostrarServiciosEnTabla(serviciosActivos);
      }

      function actualizarTablaServicios() {
          const servicios = sistemaGestion.mostrarServicios();
          mostrarServiciosEnTabla(servicios);
      }

      function mostrarServiciosEnTabla(servicios) {
          const tbody = document.getElementById('cuerpoTablaServicios');
          const total = document.getElementById('totalServicios');
          
          total.textContent = servicios.length;
          
          if (servicios.length === 0) {
              tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay servicios registrados</td></tr>';
              return;
          }

          let html = '';
          servicios.forEach(servicio => {
              html += `
                  <tr>
                      <td><strong>${servicio.nombre}</strong></td>
                      <td>${servicio.descripcion}</td>
                      <td>${servicio.categoria}</td>
                      <td>S/ ${servicio.precio.toFixed(2)}</td>
                      <td>${servicio.duracion}</td>
                      <td><span style="color: ${servicio.estado === 'activo' ? 'green' : 'red'}">${servicio.estado}</span></td>
                      <td>
                          <button onclick="editarServicio(${servicio.id})" class="btn-like">✏️</button>
                          <button onclick="eliminarServicio(${servicio.id})" class="btn-like">🗑️</button>
                      </td>
                  </tr>
              `;
          });
          
          tbody.innerHTML = html;
      }

      function actualizarEstadisticasServicios() {
          const servicios = sistemaGestion.mostrarServicios();
          const estadisticas = document.getElementById('estadisticasServicios');
          
          const totalServicios = servicios.length;
          const serviciosActivos = servicios.filter(s => s.estado === 'activo').length;
          const precioPromedio = servicios.length > 0 ? 
              servicios.reduce((sum, s) => sum + s.precio, 0) / servicios.length : 0;
          const categoriasUnicas = [...new Set(servicios.map(s => s.categoria))];
          
          estadisticas.innerHTML = `
            <div class="card">
                <h4>📈 Resumen General</h4>
                <p><strong>Total Servicios:</strong> ${totalServicios}</p>
                <p><strong>Servicios Activos:</strong> ${serviciosActivos}</p>
                <p><strong>Precio Promedio:</strong> S/ ${precioPromedio.toFixed(2)}</p>
            </div>
            <div class="card">
                <h4>🏷️ Categorías</h4>
                <p><strong>Total Categorías:</strong> ${categoriasUnicas.length}</p>
                <p><strong>Categorías:</strong> ${categoriasUnicas.join(', ')}</p>
            </div>
            <div class="card">
                <h4>📊 Distribución</h4>
                <p><strong>Activos:</strong> ${serviciosActivos}</p>
                <p><strong>Inactivos:</strong> ${servicios.filter(s => s.estado === 'inactivo').length}</p>
                <p><strong>Temporales:</strong> ${servicios.filter(s => s.estado === 'temporal').length}</p>
            </div>
          `;
      }

      function editarServicio(id) {
          const servicio = sistemaGestion.mostrarServicios().find(s => s.id === id);
          if (servicio) {
              document.getElementById('servicioId').value = servicio.id;
              document.getElementById('servicioNombre').value = servicio.nombre;
              document.getElementById('servicioDescripcion').value = servicio.descripcion;
              document.getElementById('servicioCategoria').value = servicio.categoria;
              document.getElementById('servicioPrecio').value = servicio.precio;
              document.getElementById('servicioDuracion').value = servicio.duracion;
              document.getElementById('servicioEstado').value = servicio.estado;
              document.getElementById('servicioInstitucion').value = servicio.institucion || '';
              
              document.getElementById('btnInsertarServicio').style.display = 'none';
              document.getElementById('btnActualizarServicio').style.display = 'inline-block';
              document.getElementById('btnCancelarEdicionServ').style.display = 'inline-block';
          }
      }

      function actualizarServicio() {
          const id = parseInt(document.getElementById('servicioId').value);
          const nuevosDatos = {
              nombre: document.getElementById('servicioNombre').value,
              descripcion: document.getElementById('servicioDescripcion').value,
              categoria: document.getElementById('servicioCategoria').value,
              precio: parseFloat(document.getElementById('servicioPrecio').value),
              duracion: document.getElementById('servicioDuracion').value,
              estado: document.getElementById('servicioEstado').value,
              institucion: document.getElementById('servicioInstitucion').value
          };

          if (sistemaGestion.editarServicio(id, nuevosDatos)) {
              alert('✅ Servicio actualizado exitosamente');
              cancelarEdicionServ();
              actualizarTablaServicios();
              actualizarEstadisticasServicios();
          }
      }

      function eliminarServicio(id) {
          if (confirm('¿Está seguro de eliminar este servicio?')) {
              if (sistemaGestion.eliminarServicio(id)) {
                  alert('✅ Servicio eliminado exitosamente');
                  actualizarTablaServicios();
                  actualizarEstadisticasServicios();
              }
          }
      }

      function cancelarEdicionServ() {
          limpiarFormularioServicio();
          document.getElementById('btnInsertarServicio').style.display = 'inline-block';
          document.getElementById('btnActualizarServicio').style.display = 'none';
          document.getElementById('btnCancelarEdicionServ').style.display = 'none';
      }

      function limpiarFormularioServicio() {
          document.getElementById('formServicio').reset();
          document.getElementById('servicioId').value = '';
      }
        
        // ==================================================================      
        // ==================== SCRIPTS SERVICIOS.HTML ====================
        // ================================================================== 
        
document.addEventListener('DOMContentLoaded', function() {
          inicializarSistemaProveedores();
      });

      function inicializarSistemaProveedores() {
          actualizarTablaProveedores();
          
          document.getElementById('btnInsertarProveedor').addEventListener('click', insertarProveedor);
          document.getElementById('btnActualizarProveedor').addEventListener('click', actualizarProveedor);
          document.getElementById('btnCancelarEdicionProv').addEventListener('click', cancelarEdicionProv);
          document.getElementById('btnLimpiarProveedor').addEventListener('click', limpiarFormularioProveedor);
          document.getElementById('btnBuscarProveedores').addEventListener('click', buscarProveedores);
          document.getElementById('btnOrdenarProveedores').addEventListener('click', ordenarProveedores);
          document.getElementById('btnMostrarTodosProv').addEventListener('click', mostrarTodosProveedores);
      }

      function insertarProveedor() {
          const proveedor = {
              razonSocial: document.getElementById('proveedorRazonSocial').value,
              ruc: document.getElementById('proveedorRuc').value,
              contacto: document.getElementById('proveedorContacto').value,
              telefono: document.getElementById('proveedorTelefono').value,
              email: document.getElementById('proveedorEmail').value,
              servicio: document.getElementById('proveedorServicio').value,
              estado: 'activo'
          };

          if (!proveedor.razonSocial || !proveedor.ruc || !proveedor.contacto) {
              alert('Complete todos los campos requeridos');
              return;
          }

          sistemaGestion.insertarProveedor(proveedor);
          alert('✅ Proveedor registrado exitosamente');
          limpiarFormularioProveedor();
          actualizarTablaProveedores();
      }

      function buscarProveedores() {
          const criterio = document.getElementById('criterioBusquedaProv').value;
          const valor = document.getElementById('valorBusquedaProv').value;
          
          if (!valor) {
              alert('Ingrese un valor para buscar');
              return;
          }

          const resultados = sistemaGestion.buscarProveedor(criterio, valor);
          mostrarProveedoresEnTabla(resultados);
      }

      function ordenarProveedores() {
          const criterio = document.getElementById('criterioOrdenProv').value;
          const orden = document.getElementById('tipoOrdenProv').value;
          
          const proveedoresOrdenados = sistemaGestion.ordenarProveedores(criterio, orden);
          mostrarProveedoresEnTabla(proveedoresOrdenados);
      }

      function mostrarTodosProveedores() {
          actualizarTablaProveedores();
          document.getElementById('valorBusquedaProv').value = '';
      }

      function actualizarTablaProveedores() {
          const proveedores = sistemaGestion.mostrarProveedores();
          mostrarProveedoresEnTabla(proveedores);
      }

      function mostrarProveedoresEnTabla(proveedores) {
          const tbody = document.getElementById('cuerpoTablaProveedores');
          const total = document.getElementById('totalProveedores');
          
          total.textContent = proveedores.length;
          
          if (proveedores.length === 0) {
              tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay proveedores registrados</td></tr>';
              return;
          }

          let html = '';
          proveedores.forEach(proveedor => {
              html += `
                  <tr>
                      <td>${proveedor.razonSocial}</td>
                      <td>${proveedor.ruc}</td>
                      <td>${proveedor.contacto}</td>
                      <td>${proveedor.servicio}</td>
                      <td>${proveedor.estado}</td>
                      <td>
                          <button onclick="editarProveedor(${proveedor.id})" class="btn-like">✏️</button>
                          <button onclick="eliminarProveedor(${proveedor.id})" class="btn-like">🗑️</button>
                      </td>
                  </tr>
              `;
          });
          
          tbody.innerHTML = html;
      }

      function editarProveedor(id) {
          const proveedor = sistemaGestion.mostrarProveedores().find(p => p.id === id);
          if (proveedor) {
              document.getElementById('proveedorId').value = proveedor.id;
              document.getElementById('proveedorRazonSocial').value = proveedor.razonSocial;
              document.getElementById('proveedorRuc').value = proveedor.ruc;
              document.getElementById('proveedorContacto').value = proveedor.contacto;
              document.getElementById('proveedorTelefono').value = proveedor.telefono;
              document.getElementById('proveedorEmail').value = proveedor.email;
              document.getElementById('proveedorServicio').value = proveedor.servicio;
              
              document.getElementById('btnInsertarProveedor').style.display = 'none';
              document.getElementById('btnActualizarProveedor').style.display = 'inline-block';
              document.getElementById('btnCancelarEdicionProv').style.display = 'inline-block';
          }
      }

      function actualizarProveedor() {
          const id = parseInt(document.getElementById('proveedorId').value);
          const nuevosDatos = {
              razonSocial: document.getElementById('proveedorRazonSocial').value,
              ruc: document.getElementById('proveedorRuc').value,
              contacto: document.getElementById('proveedorContacto').value,
              telefono: document.getElementById('proveedorTelefono').value,
              email: document.getElementById('proveedorEmail').value,
              servicio: document.getElementById('proveedorServicio').value
          };

          if (sistemaGestion.editarProveedor(id, nuevosDatos)) {
              alert('✅ Proveedor actualizado exitosamente');
              cancelarEdicionProv();
              actualizarTablaProveedores();
          }
      }

      function eliminarProveedor(id) {
          if (confirm('¿Está seguro de eliminar este proveedor?')) {
              if (sistemaGestion.eliminarProveedor(id)) {
                  alert('✅ Proveedor eliminado exitosamente');
                  actualizarTablaProveedores();
              }
          }
      }

      function cancelarEdicionProv() {
          limpiarFormularioProveedor();
          document.getElementById('btnInsertarProveedor').style.display = 'inline-block';
          document.getElementById('btnActualizarProveedor').style.display = 'none';
          document.getElementById('btnCancelarEdicionProv').style.display = 'none';
      }

      function limpiarFormularioProveedor() {
          document.getElementById('formProveedor').reset();
          document.getElementById('proveedorId').value = '';
      }

        // ==================================================================      
        // ==================== SCRIPTS ESTADISTICAS AVANZADAS.HTML ====================
        // ================================================================== 
        
document.addEventListener('DOMContentLoaded', function() {
          inicializarPanelAdministracion();
      });

      function inicializarPanelAdministracion() {
          actualizarResumenGeneral();
          actualizarTablasConsolidadas();
          
          document.getElementById('btnBusquedaGlobal').addEventListener('click', busquedaGlobal);
          document.getElementById('btnOrdenarGlobal').addEventListener('click', ordenamientoGlobal);
          document.getElementById('btnExportarTodo').addEventListener('click', exportarTodosDatos);
          document.getElementById('btnEstadisticasCompletas').addEventListener('click', generarReporteCompleto);
          document.getElementById('btnLimpiarSistema').addEventListener('click', limpiarSistema);
      }

      function actualizarResumenGeneral() {
          const resumen = document.getElementById('resumenGeneral');
          const clientes = sistemaGestion.mostrarClientes();
          const proveedores = sistemaGestion.mostrarProveedores();
          const servicios = sistemaGestion.mostrarServicios();
          const inventario = sistemaGestion.mostrarInventario();
          
          const valorTotalInventario = inventario.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
          const precioPromedioServicios = servicios.length > 0 ? 
              servicios.reduce((sum, s) => sum + s.precio, 0) / servicios.length : 0;

          resumen.innerHTML = `
            <div class="card">
                <h4>👥 Clientes</h4>
                <p><strong>Total:</strong> ${clientes.length}</p>
                <p><strong>Afiliados:</strong> ${clientes.filter(c => c.tipo === 'afiliado').length}</p>
                <p><strong>Estudiantes:</strong> ${clientes.filter(c => c.tipo === 'estudiante').length}</p>
            </div>
            <div class="card">
                <h4>🏢 Proveedores</h4>
                <p><strong>Total:</strong> ${proveedores.length}</p>
                <p><strong>Activos:</strong> ${proveedores.filter(p => p.estado === 'activo').length}</p>
                <p><strong>Servicios Únicos:</strong> ${[...new Set(proveedores.map(p => p.servicio))].length}</p>
            </div>
            <div class="card">
                <h4>🛠️ Servicios</h4>
                <p><strong>Total:</strong> ${servicios.length}</p>
                <p><strong>Activos:</strong> ${servicios.filter(s => s.estado === 'activo').length}</p>
                <p><strong>Precio Promedio:</strong> S/ ${precioPromedioServicios.toFixed(2)}</p>
            </div>
            <div class="card">
                <h4>📦 Inventario</h4>
                <p><strong>Items:</strong> ${inventario.length}</p>
                <p><strong>Valor Total:</strong> S/ ${valorTotalInventario.toFixed(2)}</p>
                <p><strong>Categorías:</strong> ${[...new Set(inventario.map(i => i.categoria))].length}</p>
            </div>
          `;
      }

      function actualizarTablasConsolidadas() {
          // Actualizar tabla de clientes
          const clientes = sistemaGestion.ordenarClientes('nombre', 'asc');
          let htmlClientes = '';
          clientes.forEach(cliente => {
              htmlClientes += `
                  <tr>
                      <td>${cliente.nombre}</td>
                      <td>${cliente.dni}</td>
                      <td>${cliente.email}</td>
                      <td>${cliente.tipo}</td>
                      <td>${cliente.fechaRegistro}</td>
                  </tr>
              `;
          });
          document.getElementById('tablaConsolidadaClientes').innerHTML = htmlClientes || '<tr><td colspan="5">No hay clientes</td></tr>';

          // Actualizar tabla de proveedores
          const proveedores = sistemaGestion.ordenarProveedores('razonSocial', 'asc');
          let htmlProveedores = '';
          proveedores.forEach(proveedor => {
              htmlProveedores += `
                  <tr>
                      <td>${proveedor.razonSocial}</td>
                      <td>${proveedor.ruc}</td>
                      <td>${proveedor.contacto}</td>
                      <td>${proveedor.servicio}</td>
                      <td>${proveedor.estado}</td>
                  </tr>
              `;
          });
          document.getElementById('tablaConsolidadaProveedores').innerHTML = htmlProveedores || '<tr><td colspan="5">No hay proveedores</td></tr>';

          // Actualizar tabla de servicios
          const servicios = sistemaGestion.ordenarServicios('nombre', 'asc');
          let htmlServicios = '';
          servicios.forEach(servicio => {
              htmlServicios += `
                  <tr>
                      <td>${servicio.nombre}</td>
                      <td>${servicio.categoria}</td>
                      <td>S/ ${servicio.precio.toFixed(2)}</td>
                      <td>${servicio.duracion}</td>
                      <td>${servicio.estado}</td>
                  </tr>
              `;
          });
          document.getElementById('tablaConsolidadaServicios').innerHTML = htmlServicios || '<tr><td colspan="5">No hay servicios</td></tr>';

          // Actualizar tabla de inventario
          const inventario = sistemaGestion.ordenarInventario('nombre', 'asc');
          let htmlInventario = '';
          inventario.forEach(item => {
              const valorTotal = item.cantidad * item.precio;
              htmlInventario += `
                  <tr>
                      <td>${item.nombre}</td>
                      <td>${item.categoria}</td>
                      <td>${item.cantidad}</td>
                      <td>S/ ${item.precio.toFixed(2)}</td>
                      <td><strong>S/ ${valorTotal.toFixed(2)}</strong></td>
                  </tr>
              `;
          });
          document.getElementById('tablaConsolidadaInventario').innerHTML = htmlInventario || '<tr><td colspan="5">No hay inventario</td></tr>';
      }

      function busquedaGlobal() {
          const sistema = document.getElementById('sistemaBusquedaGlobal').value;
          const valor = document.getElementById('valorBusquedaGlobal').value;
          
          if (!valor) {
              alert('Ingrese un valor para buscar');
              return;
          }

          let resultados = [];
          let titulo = '';

          switch(sistema) {
              case 'clientes':
                  resultados = sistemaGestion.buscarCliente('nombre', valor);
                  titulo = 'Clientes';
                  break;
              case 'proveedores':
                  resultados = sistemaGestion.buscarProveedor('razonSocial', valor);
                  titulo = 'Proveedores';
                  break;
              case 'servicios':
                  resultados = sistemaGestion.buscarServicio('nombre', valor);
                  titulo = 'Servicios';
                  break;
              case 'inventario':
                  resultados = sistemaGestion.buscarItemInventario('nombre', valor);
                  titulo = 'Inventario';
                  break;
          }

          mostrarResultadosBusqueda(resultados, titulo);
      }

      function ordenamientoGlobal() {
          const sistema = document.getElementById('sistemaOrdenamiento').value;
          const criterio = document.getElementById('criterioOrdenGlobal').value;
          
          let resultados = [];
          let titulo = '';

          switch(sistema) {
              case 'clientes':
                  resultados = sistemaGestion.ordenarClientes(criterio, 'asc');
                  titulo = 'Clientes Ordenados';
                  break;
              case 'proveedores':
                  resultados = sistemaGestion.ordenarProveedores(criterio, 'asc');
                  titulo = 'Proveedores Ordenados';
                  break;
              case 'servicios':
                  resultados = sistemaGestion.ordenarServicios(criterio, 'asc');
                  titulo = 'Servicios Ordenados';
                  break;
              case 'inventario':
                  resultados = sistemaGestion.ordenarInventario(criterio, 'asc');
                  titulo = 'Inventario Ordenado';
                  break;
          }

          mostrarResultadosBusqueda(resultados, titulo);
      }

      function mostrarResultadosBusqueda(resultados, titulo) {
          const contenedor = document.getElementById('resultadosBusquedaGlobal');
          
          if (resultados.length === 0) {
              contenedor.innerHTML = `<p>No se encontraron resultados para "${titulo}"</p>`;
              return;
          }

          let html = `<h4>${titulo} (${resultados.length} resultados)</h4>`;
          
          // Mostrar primeros 5 resultados como ejemplo
          resultados.slice(0, 5).forEach(item => {
              html += `<div style="padding:8px; border-bottom:1px solid #eee;">`;
              if (item.nombre) html += `<strong>${item.nombre}</strong> - ${item.email || item.categoria || ''}`;
              if (item.razonSocial) html += `<strong>${item.razonSocial}</strong> - ${item.servicio}`;
              html += `</div>`;
          });

          if (resultados.length > 5) {
              html += `<p><em>... y ${resultados.length - 5} resultados más</em></p>`;
          }

          contenedor.innerHTML = html;
      }

      function exportarTodosDatos() {
          const datos = {
              clientes: sistemaGestion.mostrarClientes(),
              proveedores: sistemaGestion.mostrarProveedores(),
              servicios: sistemaGestion.mostrarServicios(),
              inventario: sistemaGestion.mostrarInventario(),
              fechaExportacion: new Date().toLocaleString()
          };

          const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup_sistema_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          
          alert('✅ Todos los datos exportados exitosamente');
      }

      function generarReporteCompleto() {
          const clientes = sistemaGestion.mostrarClientes();
          const proveedores = sistemaGestion.mostrarProveedores();
          const servicios = sistemaGestion.mostrarServicios();
          const inventario = sistemaGestion.mostrarInventario();

          let reporte = `REPORTE COMPLETO DEL SISTEMA\n`;
          reporte += `Generado: ${new Date().toLocaleString()}\n\n`;
          
          reporte += `=== CLIENTES (${clientes.length}) ===\n`;
          clientes.forEach(c => {
              reporte += `- ${c.nombre} (${c.dni}) - ${c.tipo}\n`;
          });

          reporte += `\n=== PROVEEDORES (${proveedores.length}) ===\n`;
          proveedores.forEach(p => {
              reporte += `- ${p.razonSocial} (${p.ruc}) - ${p.servicio}\n`;
          });

          reporte += `\n=== SERVICIOS (${servicios.length}) ===\n`;
          servicios.forEach(s => {
              reporte += `- ${s.nombre} - S/ ${s.precio} - ${s.estado}\n`;
          });

          reporte += `\n=== INVENTARIO (${inventario.length}) ===\n`;
          const valorTotal = inventario.reduce((sum, i) => sum + (i.cantidad * i.precio), 0);
          reporte += `Valor total del inventario: S/ ${valorTotal.toFixed(2)}\n`;

          alert('📊 Reporte generado en consola');
          console.log(reporte);
      }

      function limpiarSistema() {
          if (confirm('⚠️ ¿ESTÁ SEGURO? Esto eliminará todos los datos del sistema.')) {
              if (confirm('🚨 ESTA ACCIÓN NO SE PUEDE DESHACER. ¿Continuar?')) {
                  localStorage.clear();
                  alert('✅ Sistema limpiado. Recargue la página.');
                  location.reload();
              }
          }
      }

      // Funciones para pestañas
      function abrirTab(evt, tabName) {
          const tabcontent = document.getElementsByClassName("tab-content");
          for (let i = 0; i < tabcontent.length; i++) {
              tabcontent[i].classList.remove("active");
          }
          
          const tabbuttons = document.getElementsByClassName("tab-button");
          for (let i = 0; i < tabbuttons.length; i++) {
              tabbuttons[i].classList.remove("active");
          }
          
          document.getElementById(tabName).classList.add("active");
          evt.currentTarget.classList.add("active");
      }
      
        // ==================================================================      
        // ==================== SCRIPTS DENUNCIAS.HTML ====================
        // ================================================================== 
        
document.addEventListener('DOMContentLoaded', function() {
          inicializarMejorasDenuncias();
      });

      // ARREGLO BIDIMENSIONAL para estadísticas
      const matrizEstadisticas = [
        ['Tipo', 'Pendientes', 'Investigación', 'Resueltas', 'Total'],
        ['Corrupción', 0, 0, 0, 0],
        ['Maltrato', 0, 0, 0, 0],
        ['Negligencia', 0, 0, 0, 0],
        ['Discriminación', 0, 0, 0, 0],
        ['Otros', 0, 0, 0, 0]
      ];

      // VECTOR de objetos complejos
      const vectorDenunciasComplejo = [];

      function inicializarMejorasDenuncias() {
          actualizarEstadisticasDenuncias();
          
          // Event listeners para nuevas funcionalidades
          document.getElementById('btnAplicarFiltros').addEventListener('click', aplicarFiltrosAvanzados);
          document.getElementById('btnExportarDenuncias').addEventListener('click', exportarDenuncias);
          document.getElementById('btnMarcarTodasInvestigacion').addEventListener('click', marcarTodasInvestigacion);
          document.getElementById('btnGenerarReporte').addEventListener('click', generarReporteEstadistico);
          
          // Ejemplos de estructuras de datos
          document.getElementById('btnEjemploMatriz').addEventListener('click', ejemploMatrizBidimensional);
          document.getElementById('btnEjemploVector').addEventListener('click', ejemploVectorObjetos);
          document.getElementById('btnEjemploObjetos').addEventListener('click', ejemploObjetosAnidados);
      }

      function actualizarEstadisticasDenuncias() {
          const estadisticas = document.getElementById('estadisticasDenuncias');
          const denuncias = window.denuncias || [];
          
          const total = denuncias.length;
          const pendientes = denuncias.filter(d => d.estado === 'pendiente').length;
          const investigacion = denuncias.filter(d => d.estado === 'investigacion').length;
          const resueltas = denuncias.filter(d => d.estado === 'resuelta').length;
          
          // Actualizar matriz bidimensional
          actualizarMatrizEstadisticas(denuncias);

          estadisticas.innerHTML = `
            <div class="card">
                <h4>📋 Resumen General</h4>
                <p><strong>Total Denuncias:</strong> ${total}</p>
                <p><strong>Pendientes:</strong> ${pendientes}</p>
                <p><strong>En Investigación:</strong> ${investigacion}</p>
                <p><strong>Resueltas:</strong> ${resueltas}</p>
            </div>
            <div class="card">
                <h4>📊 Por Estado</h4>
                <div class="chart-bar">
                    <span>Pendientes</span>
                    <div class="bar" style="width: ${total > 0 ? (pendientes/total)*100 : 0}%"></div>
                    <span>${pendientes}</span>
                </div>
                <div class="chart-bar">
                    <span>Investigación</span>
                    <div class="bar" style="width: ${total > 0 ? (investigacion/total)*100 : 0}%"></div>
                    <span>${investigacion}</span>
                </div>
                <div class="chart-bar">
                    <span>Resueltas</span>
                    <div class="bar" style="width: ${total > 0 ? (resueltas/total)*100 : 0}%"></div>
                    <span>${resueltas}</span>
                </div>
            </div>
            <div class="card">
                <h4>🎯 Eficiencia</h4>
                <p><strong>Tasa de Resolución:</strong> ${total > 0 ? ((resueltas/total)*100).toFixed(1) : 0}%</p>
                <p><strong>Promedio por Día:</strong> ${calcularPromedioDiario(denuncias)}</p>
                <p><strong>Tiempo Promedio:</strong> ${calcularTiempoPromedio(denuncias)} días</p>
            </div>
          `;
      }

      function actualizarMatrizEstadisticas(denuncias) {
          // Reiniciar matriz
          for(let i = 1; i < matrizEstadisticas.length; i++) {
              for(let j = 1; j < matrizEstadisticas[i].length; j++) {
                  matrizEstadisticas[i][j] = 0;
              }
          }

          // Llenar matriz con datos reales
          denuncias.forEach(denuncia => {
              const tipoIndex = matrizEstadisticas.findIndex(row => row[0] === denuncia.tipo);
              if (tipoIndex !== -1) {
                  const estadoIndex = 
                      denuncia.estado === 'pendiente' ? 1 :
                      denuncia.estado === 'investigacion' ? 2 : 3;
                  
                  matrizEstadisticas[tipoIndex][estadoIndex]++;
                  matrizEstadisticas[tipoIndex][4]++; // Total
              }
          });
      }

      function aplicarFiltrosAvanzados() {
          const filtro = document.getElementById('filtroAvanzado').value;
          const orden = document.getElementById('ordenAvanzado').value;
          
          let denunciasFiltradas = [...window.denuncias];
          
          // Aplicar filtro
          if (filtro !== 'todas') {
              denunciasFiltradas = denunciasFiltradas.filter(d => d.estado === filtro);
          }
          
          // Aplicar ordenamiento
          denunciasFiltradas.sort((a, b) => {
              switch(orden) {
                  case 'fecha':
                      return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
                  case 'tipo':
                      return a.tipo.localeCompare(b.tipo);
                  case 'institucion':
                      return a.institucion.localeCompare(b.institucion);
                  default:
                      return 0;
              }
          });
          
          // Actualizar visualización
          mostrarDenunciasFiltradas(denunciasFiltradas);
      }

      function mostrarDenunciasFiltradas(denuncias) {
          const lista = document.getElementById('listaDenuncias');
          if (!lista) return;
          
          if (denuncias.length === 0) {
              lista.innerHTML = '<p>No hay denuncias que coincidan con los filtros</p>';
              return;
          }
          
          let html = '<table><tr><th>Número</th><th>Tipo</th><th>Institución</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>';
          
          denuncias.forEach(d => {
              html += `<tr>
                  <td>${d.numero}</td>
                  <td>${capitalizar(d.tipo)}</td>
                  <td>${capitalizar(d.institucion)}</td>
                  <td>${capitalizar(d.estado)}</td>
                  <td>${d.fechaRegistro}</td>
                  <td>
                      <button onclick="verDenuncia(${d.id})" class="btn-like">👁️</button>
                      <button onclick="cambiarEstado(${d.id})" class="btn-like">🔄</button>
                  </td>
              </tr>`;
          });
          
          lista.innerHTML = html + '</table>';
      }

      function exportarDenuncias() {
          const denuncias = window.denuncias || [];
          let csv = 'Número,Tipo,Institución,Descripción,Estado,Fecha Registro\n';
          
          denuncias.forEach(d => {
              csv += `"${d.numero}","${d.tipo}","${d.institucion}","${d.descripcion}","${d.estado}","${d.fechaRegistro}"\n`;
          });
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `denuncias_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          
          alert('✅ Denuncias exportadas exitosamente');
      }

      function marcarTodasInvestigacion() {
          if (confirm('¿Marcar todas las denuncias pendientes como "En Investigación"?')) {
              window.denuncias.forEach(d => {
                  if (d.estado === 'pendiente') {
                      d.estado = 'investigacion';
                  }
              });
              mostrarDenuncias();
              actualizarEstadisticasDenuncias();
              alert('✅ Todas las denuncias pendientes marcadas como en investigación');
          }
      }

      function generarReporteEstadistico() {
          const denuncias = window.denuncias || [];
          let reporte = 'REPORTE ESTADÍSTICO DE DENUNCIAS\n';
          reporte += `Generado: ${new Date().toLocaleString()}\n\n`;
          
          reporte += 'MATRIZ DE ESTADÍSTICAS:\n';
          matrizEstadisticas.forEach(fila => {
              reporte += fila.join('\t') + '\n';
          });
          
          reporte += '\nRESUMEN POR INSTITUCIÓN:\n';
          const porInstitucion = {};
          denuncias.forEach(d => {
              porInstitucion[d.institucion] = (porInstitucion[d.institucion] || 0) + 1;
          });
          
          Object.keys(porInstitucion).forEach(inst => {
              reporte += `- ${capitalizar(inst)}: ${porInstitucion[inst]} denuncias\n`;
          });
          
          console.log(reporte);
          alert('📊 Reporte estadístico generado en consola');
      }

      // EJEMPLOS DE ESTRUCTURAS DE DATOS
      function ejemploMatrizBidimensional() {
          const resultado = document.getElementById('resultadoMatriz');
          let html = '<h5>Matriz Bidimensional - Estadísticas por Tipo</h5>';
          html += '<table style="width:100%; font-size:0.9em;">';
          
          matrizEstadisticas.forEach((fila, index) => {
              html += '<tr>';
              fila.forEach((celda, celdaIndex) => {
                  const estilo = index === 0 ? 'font-weight:bold; background:#f0f0f0;' : '';
                  html += `<td style="padding:5px; border:1px solid #ddd; ${estilo}">${celda}</td>`;
              });
              html += '</tr>';
          });
          
          html += '</table>';
          resultado.innerHTML = html;
      }

      function ejemploVectorObjetos() {
          const resultado = document.getElementById('resultadoVector');
          const denuncias = window.denuncias || [];
          
          // Crear vector de objetos complejos
          const vectorComplejo = denuncias.map(d => ({
              id: d.id,
              metadata: {
                  numero: d.numero,
                  fechaCreacion: d.fechaRegistro,
                  prioridad: calcularPrioridad(d),
                  categoria: d.tipo.toUpperCase()
              },
              contenido: {
                  descripcion: d.descripcion.substring(0, 50) + '...',
                  institucion: d.institucion,
                  estadoActual: d.estado
              },
              estadisticas: {
                  diasDesdeCreacion: calcularDiasDesde(d.fechaRegistro),
                  esUrgente: d.tipo === 'corrupcion' || d.tipo === 'maltrato'
              }
          }));
          
          let html = '<h5>Vector de Objetos Complejos</h5>';
          html += `<p><strong>Total objetos:</strong> ${vectorComplejo.length}</p>`;
          html += '<div style="max-height:200px; overflow-y:auto;">';
          
          vectorComplejo.slice(0, 3).forEach(obj => {
              html += `<div style="margin:5px 0; padding:5px; background:#e9ecef; border-radius:3px;">
                  <strong>${obj.metadata.numero}</strong> - ${obj.contenido.descripcion}<br>
                  <small>Prioridad: ${obj.metadata.prioridad} | Días: ${obj.estadisticas.diasDesdeCreacion}</small>
              </div>`;
          });
          
          if (vectorComplejo.length > 3) {
              html += `<p><em>... y ${vectorComplejo.length - 3} objetos más</em></p>`;
          }
          
          html += '</div>';
          resultado.innerHTML = html;
      }

      function ejemploObjetosAnidados() {
          const resultado = document.getElementById('resultadoObjetos');
          const denuncias = window.denuncias || [];
          
          // Objeto anidado complejo
          const sistemaDenuncias = {
              configuracion: {
                  version: '1.0',
                  fechaActualizacion: new Date().toISOString(),
                  parametros: {
                      maxDenunciasPorUsuario: 5,
                      diasRetencion: 365,
                      notificacionesActivas: true
                  }
              },
              datos: {
                  totalRegistros: denuncias.length,
                  resumen: {
                      porEstado: denuncias.reduce((acc, d) => {
                          acc[d.estado] = (acc[d.estado] || 0) + 1;
                          return acc;
                      }, {}),
                      porInstitucion: denuncias.reduce((acc, d) => {
                          acc[d.institucion] = (acc[d.institucion] || 0) + 1;
                          return acc;
                      }, {}),
                      porTipo: denuncias.reduce((acc, d) => {
                          acc[d.tipo] = (acc[d.tipo] || 0) + 1;
                          return acc;
                      }, {})
                  },
                  estadisticasAvanzadas: {
                      tasaResolucion: denuncias.length > 0 ? 
                          (denuncias.filter(d => d.estado === 'resuelta').length / denuncias.length * 100).toFixed(1) : 0,
                      tiempoPromedio: calcularTiempoPromedio(denuncias),
                      denunciasRecientes: denuncias.filter(d => 
                          calcularDiasDesde(d.fechaRegistro) <= 7
                      ).length
                  }
              },
              operaciones: {
                  ultimaActualizacion: new Date().toLocaleString(),
                  totalOperaciones: denuncias.length * 2, // Estimado
                  operacionesDisponibles: ['INSERTAR', 'BUSCAR', 'EDITAR', 'ELIMINAR', 'MOSTRAR', 'ORDENAR']
              }
          };
          
          let html = '<h5>Objeto Anidado Complejo - Sistema de Denuncias</h5>';
          html += `<pre style="background:#f8f9fa; padding:10px; border-radius:5px; font-size:0.8em; max-height:300px; overflow-y:auto;">${JSON.stringify(sistemaDenuncias, null, 2)}</pre>`;
          resultado.innerHTML = html;
      }

      // FUNCIONES AUXILIARES
      function calcularPromedioDiario(denuncias) {
          if (denuncias.length === 0) return '0';
          const primeraFecha = new Date(Math.min(...denuncias.map(d => new Date(d.fechaRegistro))));
          const diasTranscurridos = Math.max(1, (new Date() - primeraFecha) / (1000 * 60 * 60 * 24));
          return (denuncias.length / diasTranscurridos).toFixed(1);
      }

      function calcularTiempoPromedio(denuncias) {
          const resueltas = denuncias.filter(d => d.estado === 'resuelta');
          if (resueltas.length === 0) return 'N/A';
          // Simulación - en un sistema real calcularías con fechas reales
          return '15';
      }

      function calcularPrioridad(denuncia) {
          const prioridades = {
              'corrupcion': 'ALTA',
              'maltrato': 'ALTA', 
              'negligencia': 'MEDIA',
              'discriminacion': 'MEDIA',
              'otros': 'BAJA'
          };
          return prioridades[denuncia.tipo] || 'BAJA';
      }

      function calcularDiasDesde(fecha) {
          return Math.floor((new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24));
      }

      // Sobrescribir funciones existentes para actualizar estadísticas
      const originalRegistrarDenuncia = window.registrarDenuncia;
      window.registrarDenuncia = function() {
          originalRegistrarDenuncia();
          actualizarEstadisticasDenuncias();
      };

      const originalCambiarEstado = window.cambiarEstado;
      window.cambiarEstado = function(id) {
          originalCambiarEstado(id);
          actualizarEstadisticasDenuncias();
      };
      
        // ==================================================================      
        // ==================== SCRIPTS INDEX.HTML ====================
        // ================================================================== 
        
document.addEventListener('DOMContentLoaded', function() {
          inicializarDashboard();
      });

      // Datos de demostración
      let clientesDemo = [
        { id: 1, nombre: "Cliente 1", tipo: "afiliado" },
        { id: 2, nombre: "Cliente 2", tipo: "cliente" }
      ];

      let serviciosDemo = [
        { id: 1, nombre: "Servicio 1", precio: 100 },
        { id: 2, nombre: "Servicio 2", precio: 200 }
      ];

      function inicializarDashboard() {
          actualizarResumenDashboard();
          actualizarEjemplosDemo();
          
          // Actualizar cada 10 segundos
          setInterval(actualizarResumenDashboard, 10000);
      }

      function actualizarResumenDashboard() {
          const resumen = document.getElementById('resumenDashboard');
          
          // En un sistema real, estos datos vendrían de sistemaGestion
          const stats = {
              clientes: clientesDemo.length,
              servicios: serviciosDemo.length,
              proveedores: 3, // Ejemplo
              inventario: 8,  // Ejemplo
              denuncias: 5,   // Ejemplo
              turnos: 12      // Ejemplo
          };

          resumen.innerHTML = `
            <div class="card">
                <div style="text-align:center;">
                    <div style="font-size:2em; color:#0b3d91;">👥</div>
                    <h3>${stats.clientes}</h3>
                    <p>Clientes Registrados</p>
                    <small>Gestión completa CRUD</small>
                </div>
            </div>
            <div class="card">
                <div style="text-align:center;">
                    <div style="font-size:2em; color:#e94e1b;">🏢</div>
                    <h3>${stats.proveedores}</h3>
                    <p>Proveedores Activos</p>
                    <small>Sistema de gestión</small>
                </div>
            </div>
            <div class="card">
                <div style="text-align:center;">
                    <div style="font-size:2em; color:#28a745;">🛠️</div>
                    <h3>${stats.servicios}</h3>
                    <p>Servicios Disponibles</p>
                    <small>Catálogo CRUD</small>
                </div>
            </div>
            <div class="card">
                <div style="text-align:center;">
                    <div style="font-size:2em; color:#6f42c1;">📦</div>
                    <h3>${stats.inventario}</h3>
                    <p>Items en Inventario</p>
                    <small>Gestión de recursos</small>
                </div>
            </div>
            <div class="card">
                <div style="text-align:center;">
                    <div style="font-size:2em; color:#dc3545;">🚨</div>
                    <h3>${stats.denuncias}</h3>
                    <p>Denuncias Activas</p>
                    <small>Sistema de seguimiento</small>
                </div>
            </div>
            <div class="card">
                <div style="text-align:center;">
                    <div style="font-size:2em; color:#fd7e14;">🕐</div>
                    <h3>${stats.turnos}</h3>
                    <p>Turnos Programados</p>
                    <small>Gestión de citas</small>
                </div>
            </div>
          `;
      }

      function actualizarEjemplosDemo() {
          document.getElementById('totalClientesDemo').textContent = clientesDemo.length;
          document.getElementById('totalServiciosDemo').textContent = serviciosDemo.length;
          
          // Actualizar lista de clientes
          const listaClientes = document.getElementById('listaClientesDemo');
          listaClientes.innerHTML = clientesDemo.map(cliente => 
              `<div style="padding:2px 5px; border-bottom:1px solid #eee;">${cliente.nombre}</div>`
          ).join('');
          
          // Actualizar lista de servicios
          const listaServicios = document.getElementById('listaServiciosDemo');
          listaServicios.innerHTML = serviciosDemo.map(servicio => 
              `<div style="padding:2px 5px; border-bottom:1px solid #eee;">${servicio.nombre} - S/ ${servicio.precio}</div>`
          ).join('');
      }

      // OPERACIONES CRUD DE DEMOSTRACIÓN
      function agregarClienteDemo() {
          const nombre = document.getElementById('nombreClienteDemo').value;
          if (!nombre) {
              alert('Ingrese un nombre para el cliente');
              return;
          }

          // CREATE - Insertar
          const nuevoCliente = {
              id: Date.now(),
              nombre: nombre,
              tipo: 'demo',
              fechaRegistro: new Date().toLocaleString()
          };
          
          clientesDemo.push(nuevoCliente);
          document.getElementById('nombreClienteDemo').value = '';
          
          // UPDATE - Actualizar interfaz
          actualizarEjemplosDemo();
          actualizarResumenDashboard();
          
          mostrarResultado(`✅ CLIENTE CREADO: "${nombre}" - Operación CREATE exitosa`);
      }

      function agregarServicioDemo() {
          const nombre = document.getElementById('nombreServicioDemo').value;
          if (!nombre) {
              alert('Ingrese un nombre para el servicio');
              return;
          }

          // CREATE - Insertar
          const nuevoServicio = {
              id: Date.now(),
              nombre: nombre,
              precio: Math.floor(Math.random() * 500) + 50,
              estado: 'activo',
              fechaCreacion: new Date().toLocaleString()
          };
          
          serviciosDemo.push(nuevoServicio);
          document.getElementById('nombreServicioDemo').value = '';
          
          // UPDATE - Actualizar interfaz
          actualizarEjemplosDemo();
          actualizarResumenDashboard();
          
          mostrarResultado(`✅ SERVICIO CREADO: "${nombre}" - S/ ${nuevoServicio.precio} - Operación CREATE exitosa`);
      }

      function ejemploBuscar() {
          if (clientesDemo.length === 0) {
              mostrarResultado('ℹ️ No hay datos para buscar. Agregue algunos clientes primero.');
              return;
          }

          // READ - Buscar
          const termino = 'Cliente'; // Término de búsqueda fijo para demo
          const resultados = clientesDemo.filter(cliente => 
              cliente.nombre.toLowerCase().includes(termino.toLowerCase())
          );
          
          mostrarResultado(`🔍 BÚSQUEDA: Encontrados ${resultados.length} clientes con "${termino}"<br>
            Resultados: ${resultados.map(c => c.nombre).join(', ')}`);
      }

      function ejemploOrdenar() {
          if (serviciosDemo.length === 0) {
              mostrarResultado('ℹ️ No hay datos para ordenar. Agregue algunos servicios primero.');
              return;
          }

          // READ - Ordenar
          const serviciosOrdenados = [...serviciosDemo].sort((a, b) => b.precio - a.precio);
          const masCaro = serviciosOrdenados[0];
          
          mostrarResultado(`📊 ORDENAMIENTO: Servicio más caro - "${masCaro.nombre}" - S/ ${masCaro.precio}<br>
            Precios ordenados: ${serviciosOrdenados.map(s => s.precio).join(' → ')}`);
      }

      function ejemploEstadisticas() {
          if (clientesDemo.length === 0 && serviciosDemo.length === 0) {
              mostrarResultado('ℹ️ No hay datos para analizar. Agregue algunos registros primero.');
              return;
          }

          // READ - Estadísticas
          const totalClientes = clientesDemo.length;
          const totalServicios = serviciosDemo.length;
          const precioPromedio = serviciosDemo.length > 0 ? 
              serviciosDemo.reduce((sum, s) => sum + s.precio, 0) / serviciosDemo.length : 0;
          
          mostrarResultado(`📈 ESTADÍSTICAS:<br>
            • Total Clientes: ${totalClientes}<br>
            • Total Servicios: ${totalServicios}<br>
            • Precio Promedio: S/ ${precioPromedio.toFixed(2)}<br>
            • Operaciones CRUD: 15+ implementadas`);
      }

      function mostrarResultado(mensaje) {
          document.getElementById('resultadoOperaciones').innerHTML = mensaje;
      }

      // Demostración de estructuras de datos complejas
      function demostrarEstructurasDatos() {
          console.log('=== ESTRUCTURAS DE DATOS IMPLEMENTADAS ===');
          
          // Arreglo bidimensional
          const matrizEjemplo = [
            ['ID', 'Nombre', 'Precio', 'Stock'],
            [1, 'Producto A', 100, 50],
            [2, 'Producto B', 200, 25],
            [3, 'Producto C', 150, 75]
          ];
          console.log('Arreglo Bidimensional:', matrizEjemplo);
          
          // Vector de objetos
          const vectorObjetos = [
            { id: 1, nombre: 'Cliente 1', transacciones: [100, 200, 150] },
            { id: 2, nombre: 'Cliente 2', transacciones: [300, 50] },
            { id: 3, nombre: 'Cliente 3', transacciones: [400, 250, 100, 75] }
          ];
          console.log('Vector de Objetos:', vectorObjetos);
          
          // Objeto complejo anidado
          const sistemaComplejo = {
            configuracion: { version: '1.0', usuariosActivos: 150 },
            datos: {
              clientes: vectorObjetos,
              productos: matrizEjemplo,
              estadisticas: {
                ventasTotales: 12500,
                promedioTransaccion: 187.50,
                clientesActivos: 45
              }
            }
          };
          console.log('Objeto Complejo Anidado:', sistemaComplejo);
      }

      // Ejecutar demostración al cargar
      setTimeout(demostrarEstructurasDatos, 2000);