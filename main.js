// main.js

import { iniciarSesion } from './auth.js';
import { inicializarEventosDeDispositivos, obtenerUltimoDispositivoSeleccionado } from './dispositivos.js';
import { mostrarDispositivosConPaginacion, anteriorPagina, siguientePagina } from './paginacion.js';
import { cargarUltimaPosicionGPS } from './gps.js';
import { iniciarActualizacionConteo, cargarDetalleConteoPasajeros } from './conteoPasajeros.js';
import { cargarDatosYGraficarConteoPasajeros, cargarDatosYGraficarGPS, mostrarTablaAnalisisFinanciero } from './graficos.js';


let apiKey;
let datosActuales = [];  // Variable para almacenar los dispositivos actuales

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    
    // Evento de inicio de sesión
    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Iniciar sesión y obtener apiKey
            apiKey = await iniciarSesion(username, password);
            window.apiKey = apiKey; // Hacer apiKey global
            
            // Inicializar eventos de dispositivos y cargar los dispositivos iniciales
            inicializarEventosDeDispositivos(apiKey, datosActuales);
        } catch (error) {
            console.error("Error en la autenticación:", error);
            document.getElementById('loginError').textContent = "Error en la autenticación. Verifica tus credenciales.";
        }
    });

    // Evento para cargar datos GPS del último dispositivo seleccionado
    document.getElementById('cargarDatosGPS').addEventListener('click', () => {
        const deviceID = obtenerUltimoDispositivoSeleccionado();
        
        if (deviceID) {
            cargarUltimaPosicionGPS(apiKey, deviceID);
            iniciarActualizacionConteo(apiKey, deviceID);
            window.ultimoDispositivoSeleccionado = deviceID; // Hacer deviceID global
            
            // Llamada para generar gráficos al seleccionar un dispositivo
            const startTime = new Date().toISOString().slice(0, 10) + " 00:00:00";
            const endTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
            cargarDatosYGraficarConteoPasajeros(apiKey, deviceID, startTime, endTime);
            cargarDatosYGraficarGPS(apiKey, deviceID);
        } else {
            alert('Por favor, selecciona un dispositivo en la tabla primero.');
        }
    });

    // Eventos para los botones de paginación
    document.getElementById('anterior').addEventListener('click', () => {
        anteriorPagina(datosActuales);
    });

    document.getElementById('siguiente').addEventListener('click', () => {
        siguientePagina(datosActuales);
    });

    // Evento para el botón de filtrar por fecha
    document.getElementById('filtrarConteoPasajeros').addEventListener('click', () => {
        const deviceID = obtenerUltimoDispositivoSeleccionado();
        const fechaInicio = document.getElementById('fechaInicio').value;
        const horaInicio = document.getElementById('horaInicio').value || "00:00:00";
        const fechaFin = document.getElementById('fechaFin').value;
        const horaFin = document.getElementById('horaFin').value || "23:59:59";

        if (deviceID && fechaInicio && fechaFin) {
            const startTime = `${fechaInicio} ${horaInicio}`;
            const endTime = `${fechaFin} ${horaFin}`;
            console.log("Parámetros para el filtro de conteo:", { deviceID, startTime, endTime });
            
            cargarDetalleConteoPasajeros(apiKey, deviceID, startTime, endTime);
            window.ultimoDispositivoSeleccionado = deviceID; // Hacer deviceID global

            // Actualizar gráfico de conteo de pasajeros con las fechas seleccionadas
            cargarDatosYGraficarConteoPasajeros(apiKey, deviceID, startTime, endTime);
            
            // Integrar las funciones de análisis financiero y de zonas de afluencia
            if (analizarEstadisticasFinancieras && detectarZonasDeAfluencia) {
                analizarEstadisticasFinancieras(deviceID, startTime, endTime);
                detectarZonasDeAfluencia(deviceID, startTime, endTime);
            } else {
                console.warn("Las funciones de análisis financiero y de zonas de afluencia no están definidas.");
            }

        } else {
            alert('Por favor, selecciona un dispositivo y asegúrate de que ambas fechas están completas.');
        }
    });

    // Evento para el botón de "Conteo de Hoy"
    document.getElementById('hoyConteoPasajeros').addEventListener('click', () => {
        const deviceID = obtenerUltimoDispositivoSeleccionado();
        const startTime = new Date().toISOString().slice(0, 10) + " 00:00:00";
        const endTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

        if (deviceID) {
            console.log("Parámetros para el conteo de hoy:", { deviceID, startTime, endTime });
            cargarDetalleConteoPasajeros(apiKey, deviceID, startTime, endTime);
            window.ultimoDispositivoSeleccionado = deviceID; // Hacer deviceID global

            // Actualizar gráfico de conteo de pasajeros para "Conteo de Hoy"
            cargarDatosYGraficarConteoPasajeros(apiKey, deviceID, startTime, endTime);

            // Integrar las funciones de análisis financiero y de zonas de afluencia
            if (analizarEstadisticasFinancieras && detectarZonasDeAfluencia) {
                analizarEstadisticasFinancieras(deviceID, startTime, endTime);
                detectarZonasDeAfluencia(deviceID, startTime, endTime);
            } else {
                console.warn("Las funciones de análisis financiero y de zonas de afluencia no están definidas.");
            }

        } else {
            alert('Por favor, selecciona un dispositivo en la tabla primero.');
        }
    });
});

