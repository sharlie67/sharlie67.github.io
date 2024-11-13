// auth.js

import { obtenerAPIKey } from './api.js';

export async function iniciarSesion(username, password) {
    try {
        const apiKey = await obtenerAPIKey(username, password);
        mostrarPaginaPrincipal();
        return apiKey;
    } catch (error) {
        document.getElementById('loginError').textContent = "Error en el inicio de sesión: " + error.message;
        throw error;
    }
}

function mostrarPaginaPrincipal() {
    document.getElementById('loginForm').classList.add('hidden');
    document.querySelector('header').classList.remove('hidden');
    document.querySelector('nav').classList.remove('hidden');
    document.querySelector('main').classList.remove('hidden');
    document.querySelector('footer').classList.remove('hidden');
}
