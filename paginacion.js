// paginacion.js

import { mostrarDispositivosEnTabla } from './dispositivos.js';

export let paginaActual = 1;
const filasPorPagina = 3;

export function mostrarDispositivosConPaginacion(dispositivos) {
    const totalFilas = dispositivos.length;
    const totalPaginas = Math.ceil(totalFilas / filasPorPagina);

    const indiceInicio = (paginaActual - 1) * filasPorPagina;
    const indiceFin = indiceInicio + filasPorPagina;
    const dispositivosPaginados = dispositivos.slice(indiceInicio, indiceFin);

    mostrarDispositivosEnTabla(dispositivosPaginados);

    document.getElementById('infoPagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('anterior').disabled = paginaActual === 1;
    document.getElementById('siguiente').disabled = paginaActual === totalPaginas;
}

// Evento para botón "anterior"
export function anteriorPagina(datosActuales) {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarDispositivosConPaginacion(datosActuales);
    }
}

// Evento para botón "siguiente"
export function siguientePagina(datosActuales) {
    const totalFilas = datosActuales.length;
    const totalPaginas = Math.ceil(totalFilas / filasPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarDispositivosConPaginacion(datosActuales);
    }
}

