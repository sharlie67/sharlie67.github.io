// api.js

// Función para obtener la API Key con credenciales del usuario
export async function obtenerAPIKey(username, password) {
    const url = "http://199.223.255.38:12056/api/v1/basic/key";
    const parametros = { username, password };
    
    try {
        const respuesta = await fetch(`${url}?username=${parametros.username}&password=${parametros.password}`, {
            method: "GET"
        });
        const datos = await respuesta.json();
        if (datos.errorcode === 200) {
            return datos.data.key;
        } else {
            throw new Error("Credenciales inválidas.");
        }
    } catch (error) {
        console.error("Error en la solicitud: ", error);
        throw error;
    }
}

// Función para obtener datos desde la API con parámetros opcionales
export async function obtenerDatosAPI(url, parametros = null) {
    try {
        const response = await fetch(url, {
            method: parametros ? "POST" : "GET",
            headers: parametros ? { "Content-Type": "application/json" } : {},
            body: parametros ? JSON.stringify(parametros) : null
        });
        if (!response.ok) throw new Error('Error al conectar con la API');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}
