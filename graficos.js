import { obtenerDatosAPI } from './api.js';
let chartInstanceIngresos = null; // Variable para almacenar la instancia del gráfico de ingresos

// Función para cargar datos y generar gráficos de conteo de pasajeros
export async function cargarDatosYGraficarConteoPasajeros(apiKey, deviceID, startTime, endTime) {
    const apiUrlConteo = `http://199.223.255.38:12056/api/v1/basic/passenger-count/detail`;
    const parametros = {
        key: apiKey,
        terid: [deviceID],
        starttime: startTime,
        endtime: endTime,
        door: "" // No se especifica puerta
    };

    try {
        const respuesta = await obtenerDatosAPI(apiUrlConteo, parametros);

        if (respuesta && respuesta.data && respuesta.data.length > 0) {
            // Calcular el total de pasajeros por día y llamar a la función de análisis financiero
            const pasajerosPorDia = agruparPasajerosPorDia(respuesta.data);
            mostrarTablaAnalisisFinanciero(pasajerosPorDia);
            generarGraficoIngresosPorDia(pasajerosPorDia);
        } else {
            console.log('No se encontraron datos de conteo de pasajeros para el período especificado.');
            document.getElementById('ingresosTotales').innerHTML = 'No se encontraron datos de conteo de pasajeros.';
        }
    } catch (error) {
        console.error("Error al obtener datos de conteo de pasajeros para gráficos: ", error);
    }
}

// Función para agrupar los datos de pasajeros por día
export function agruparPasajerosPorDia(datos) {
    const pasajerosPorDia = {};

    datos.forEach(dato => {
        const fecha = dato.time.split(' ')[0]; // Obtener solo la fecha
        if (!pasajerosPorDia[fecha]) {
            pasajerosPorDia[fecha] = 0;
        }
        pasajerosPorDia[fecha] += dato.on;
    });

    return pasajerosPorDia;
}

// Función para mostrar la tabla de análisis financiero con los datos de pasajeros por día
export function mostrarTablaAnalisisFinanciero(pasajerosPorDia) {
    const tarifa = 2000; // Tarifa por pasajero en pesos
    const tbody = document.querySelector('#tablaIngresos tbody');
    tbody.innerHTML = ''; // Limpiar contenido previo

    let totalIngresos = 0;
    let totalPasajeros = 0;

    for (const [fecha, pasajeros] of Object.entries(pasajerosPorDia)) {
        const ingresos = pasajeros * tarifa;
        totalIngresos += ingresos;
        totalPasajeros += pasajeros;

        const fila = `
            <tr>
                <td>${fecha}</td>
                <td>${pasajeros}</td>
                <td>$${ingresos.toLocaleString()}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', fila);
    }

    // Mostrar ingresos totales
    document.getElementById('ingresosTotales').innerHTML = `Ingresos Totales Estimados: $${totalIngresos.toLocaleString()}`;
}

// Función para generar el gráfico de ingresos por día
export function generarGraficoIngresosPorDia(pasajerosPorDia) {
    const ctxIngresos = document.getElementById('graficoIngresos').getContext('2d');
    if (chartInstanceIngresos) {
        chartInstanceIngresos.destroy();
    }

    const fechas = Object.keys(pasajerosPorDia);
    const ingresosPorDia = fechas.map(fecha => pasajerosPorDia[fecha] * 2000);

    chartInstanceIngresos = new Chart(ctxIngresos, {
        type: 'bar',
        data: {
            labels: fechas,
            datasets: [
                {
                    label: 'Ingresos Generados por Día',
                    data: ingresosPorDia,
                    backgroundColor: 'green',
                    maxBarThickness: 50 // Limitar el grosor de las barras
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Ingresos en Pesos'
                    },
                    min: 0, // Escala mínima fija
                    max: 700000, // Escala máxima fija para evitar crecimiento descontrolado
                    beginAtZero: true
                }
            }
        }
    });
}

// Función para cargar datos de GPS y generar el gráfico de posiciones
export async function cargarDatosYGraficarGPS(apiKey, deviceID) {
    const apiUrlGPS = `http://199.223.255.38:12056/api/v1/basic/gps/last`;
    const parametros = { key: apiKey, terid: [deviceID] };

    try {
        const respuesta = await obtenerDatosAPI(apiUrlGPS, parametros);

        if (respuesta && respuesta.data && respuesta.data.length > 0) {
            const datos = respuesta.data;
            const latitudes = datos.map(dato => parseFloat(dato.gpslat));
            const longitudes = datos.map(dato => parseFloat(dato.gpslng));

            generarGraficoPosicionGPS(latitudes, longitudes);
        } else {
            console.log('No se pudieron obtener los datos GPS para el gráfico.');
        }
    } catch (error) {
        console.error("Error al obtener datos GPS para gráficos: ", error);
    }
}

// Inicializar gráficos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const deviceID = obtenerUltimoDispositivoSeleccionado();
    const startTime = new Date().toISOString().slice(0, 10) + " 00:00:00";
    const endTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (deviceID && window.apiKey) {
        cargarDatosYGraficarConteoPasajeros(window.apiKey, deviceID, startTime, endTime);
        cargarDatosYGraficarGPS(window.apiKey, deviceID);
    }
});
