// gps.js

import { obtenerDatosAPI } from './api.js';

// Array de ubicaciones de interés
const locationsOfInterest = [
    { name: "Bogota limpia", lat: 4.691933, lng: -74.121745 },
    // Aquí puedes añadir más ubicaciones en el futuro
];

// Configurar el umbral de proximidad en grados
const proximityThreshold = 0.001;

// Función para verificar si el GPS está cerca de una ubicación objetivo
function isNearby(currentLocation, targetLocation, threshold) {
    const latDiff = Math.abs(currentLocation.lat - targetLocation.lat);
    const lngDiff = Math.abs(currentLocation.lng - targetLocation.lng);
    return latDiff < threshold && lngDiff < threshold;
}

// Función para verificar proximidad a múltiples ubicaciones
function checkProximityToLocations(gpsData) {
    const currentLocation = {
        lat: parseFloat(gpsData.gpslat),
        lng: parseFloat(gpsData.gpslng)
    };
    
    locationsOfInterest.forEach(location => {
        if (isNearby(currentLocation, location, proximityThreshold)) {
            alert(`El dispositivo está cerca de ${location.name}.`);
        }
    });
}

// Función para mostrar datos GPS en el mapa y en formato de texto
function mostrarDatosGPS(datos) {
    const resultadoDiv = document.getElementById('resultadoGPS');
    resultadoDiv.innerHTML = `<p>Última posición GPS: ${datos.gpslat}, ${datos.gpslng}</p>`;

    if (typeof L !== 'undefined' && L.map) {
        if (window.myMap) {
            // Destruir el mapa si ya existe
            window.myMap.off(); // Desactivar eventos
            window.myMap.remove();
            window.myMap = null; // Resetear la instancia
        }

        // Crear un nuevo mapa
        window.myMap = L.map('mapaGPS').setView([datos.gpslat, datos.gpslng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(window.myMap);
        L.marker([datos.gpslat, datos.gpslng]).addTo(window.myMap)
            .bindPopup('Última posición del dispositivo')
            .openPopup();
    } else {
        console.warn('Leaflet no está cargado.');
        resultadoDiv.innerHTML += '<p>Error: Leaflet no está cargado correctamente.</p>';
    }

    checkProximityToLocations(datos);
}

// Función para cargar la última posición GPS
export async function cargarUltimaPosicionGPS(apiKey, deviceID) {
    const apiUrlGPS = `http://199.223.255.38:12056/api/v1/basic/gps/last`;
    const parametros = { key: apiKey, terid: [deviceID] };
    
    try {
        const respuesta = await obtenerDatosAPI(apiUrlGPS, parametros);

        if (respuesta && respuesta.data && respuesta.data.length > 0) {
            mostrarDatosGPS(respuesta.data[0]);
        } else {
            document.getElementById('resultadoGPS').innerHTML = 'No se pudieron obtener los datos GPS. Verifica la API.';
            if (window.myMap) {
                window.myMap.off();
                window.myMap.remove();
                window.myMap = null;
            }
        }
    } catch (error) {
        console.error("Error al obtener datos GPS: ", error);
        document.getElementById('resultadoGPS').innerHTML = 'Error al conectar con la API. Inténtalo más tarde.';
    }
}

// Llamar a cargarUltimaPosicionGPS periódicamente usando la apiKey y el último dispositivo seleccionado
setInterval(() => {
    if (window.apiKey && window.ultimoDispositivoSeleccionado) {
        cargarUltimaPosicionGPS(window.apiKey, window.ultimoDispositivoSeleccionado);
    } else {
        console.warn("API Key o dispositivo no definidos.");
    }
}, 10000);
