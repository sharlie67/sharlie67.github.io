// dispositivos.js

import { obtenerDatosAPI } from './api.js';
import { mostrarDispositivosConPaginacion } from './paginacion.js';

let ultimoDispositivoSeleccionado = null;
let datosFiltrados = [];  // Variable para almacenar los datos después de filtrar

// Función para inicializar los eventos de dispositivos
export function inicializarEventosDeDispositivos(apiKey, datosActuales) {
    document.getElementById('cargarDatos').addEventListener('click', async function () {
        const apiUrl = `http://199.223.255.38:12056/api/v1/basic/devices?key=${apiKey}`;
        const datos = await obtenerDatosAPI(apiUrl);
        if (datos && datos.data) {
            datosActuales.splice(0, datosActuales.length, ...datos.data);
            datosFiltrados = [...datosActuales];
            mostrarDispositivosConPaginacion(datosFiltrados);  // Mostrar los datos con paginación
        } else {
            document.getElementById('resultado').innerHTML = 'No se pudieron obtener los datos. Verifica la API.';
        }
    });

    document.getElementById('campoBusqueda').addEventListener('input', () => {
        filtrarDispositivos(datosActuales);
    });
}

// Función para devolver el último dispositivo seleccionado
export function obtenerUltimoDispositivoSeleccionado() {
    return ultimoDispositivoSeleccionado;
}

// Función para mostrar dispositivos en la tabla y asignar eventos de selección
export function mostrarDispositivosEnTabla(dispositivos) {
    const tablaBody = document.querySelector('#tablaDispositivos tbody');
    const dispositivoSeleccionadoDiv = document.getElementById('dispositivoSeleccionado');
    tablaBody.innerHTML = '';

    dispositivos.forEach(dispositivo => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${dispositivo.deviceid}</td>
            <td>${dispositivo.carlicence}</td>
            <td>${dispositivo.groupid}</td>
            <td>${dispositivo.devicetype}</td>
        `;
        
        // Agregar evento de clic a cada fila para seleccionar el dispositivo
        fila.addEventListener('click', () => {
            ultimoDispositivoSeleccionado = dispositivo.deviceid;
            console.log('Dispositivo seleccionado:', ultimoDispositivoSeleccionado);  // Depuración para verificar el ID
            
            // Mostrar el ID del dispositivo seleccionado en el HTML
            dispositivoSeleccionadoDiv.innerHTML = `Dispositivo seleccionado: ${ultimoDispositivoSeleccionado}`;
        });
        
        tablaBody.appendChild(fila);
    });
}

// Función para filtrar dispositivos
function filtrarDispositivos(datosActuales) {
    const input = document.getElementById('campoBusqueda').value.toUpperCase();
    
    if (input === "") {
        datosFiltrados = [...datosActuales];
    } else {
        datosFiltrados = datosActuales.filter(dispositivo => {
            return Object.values(dispositivo).some(value => 
                value && value.toString().toUpperCase().includes(input)
            );
        });
    }
    
    mostrarDispositivosConPaginacion(datosFiltrados);
}
