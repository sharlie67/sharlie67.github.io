// conteoPasajeros.js

import { obtenerDatosAPI } from './api.js';

// Función para cargar el detalle del conteo de pasajeros y calcular el total de pasajeros subidos
export async function cargarDetalleConteoPasajeros(apiKey, deviceID, startTime, endTime) {
    const apiUrlConteo = `http://199.223.255.38:12056/api/v1/basic/passenger-count/detail`;
    const parametros = {
        key: apiKey,
        terid: [deviceID],
        starttime: startTime,
        endtime: endTime,
        door: "" // Puedes especificar una puerta si es necesario
    };

    try {
        const respuesta = await obtenerDatosAPI(apiUrlConteo, parametros);

        if (respuesta && respuesta.data && respuesta.data.length > 0) {
            // Mostrar los datos y calcular el total de pasajeros subidos
            mostrarDatosConteo(respuesta.data);
            calcularTotalPasajerosSubidos(respuesta.data);
        } else {
            document.getElementById('resultadoConteo').innerHTML = 'No se encontraron datos de conteo de pasajeros para el período especificado.';
        }
    } catch (error) {
        console.error("Error al obtener datos de conteo de pasajeros: ", error);
        document.getElementById('resultadoConteo').innerHTML = 'Error al conectar con la API de conteo de pasajeros.';
    }
}

// Función para mostrar los datos de conteo de pasajeros en el DOM
function mostrarDatosConteo(datos) {
    const resultadoDiv = document.getElementById('resultadoConteo');
    resultadoDiv.innerHTML = `<h3>Detalle de Conteo de Pasajeros</h3>`;
    
    // Organizar los datos en una tabla para mejor visualización
    const tabla = document.createElement('table');
    tabla.innerHTML = `
        <tr>
            <th>Hora</th>
            <th>Subieron</th>
            <th>Bajaron</th>
            <th>Personas a bordo</th>
        </tr>
    `;

    datos.forEach((registro) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.time}</td>
            <td>${registro.on} pasajeros</td>
            <td>${registro.off} pasajeros</td>
            <td>${registro.remainp ?? 'No disponible'}</td>
        `;
        tabla.appendChild(fila);
    });

    resultadoDiv.appendChild(tabla);
}


// Función para calcular el total de pasajeros subidos en el período especificado
function calcularTotalPasajerosSubidos(datos) {
    const totalPasajerosSubidos = datos.reduce((total, registro) => total + registro.on, 0);
    
    // Mostrar el resultado en el DOM
    const resultadoDiv = document.getElementById('resultadoConteo');
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<h3>Total de pasajeros subidos: ${totalPasajerosSubidos}</h3>`;
    resultadoDiv.appendChild(totalDiv);
    
}


// Función para iniciar la actualización periódica del conteo de pasajeros
export function iniciarActualizacionConteo(apiKey, deviceID) {
    if (!apiKey || !deviceID) {
        console.warn("API Key o dispositivo no definidos.");
        return;
    }

    const startTime = new Date().toISOString().slice(0, 10) + " 00:00:00"; // Hoy a medianoche
    const endTime = new Date().toISOString().replace('T', ' ').slice(0, 19); // Hora actual

    // Llama a cargarDetalleConteoPasajeros cada minuto para actualizar los datos
    setInterval(() => cargarDetalleConteoPasajeros(apiKey, deviceID, startTime, endTime), 60000); // Actualiza cada minuto
}
