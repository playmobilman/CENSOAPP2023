export default class APIClient {
    constructor(baseURL, authToken = null, retryAttempts = 3, retryDelay = 500) {
        this.baseURL = baseURL;
        this.authToken = authToken;
        this.retryAttempts = retryAttempts;
        this.retryDelay = retryDelay;
    }

    /**
     * Obtiene un recurso por medio de un endpoint específico.
     * -----------------------------------------------
     * @param {string} endpoint - La URL desde donde se quiere obtener la información.
     * @param {object} options - (opcional) Objeto de opciones adicionales para el método fetch.
     * @param {number} attempt - (opcional) El número de reintentos en la request.
     * @return {Promise<any>} - El objeto promise que se resuelve con el resultado de la petición.
     */
    async fetchResource(endpoint, options = {}, attempt = 1) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        const settings = Object.assign({headers}, options);
        let response;
        
        try {
            response = await fetch(url, settings);
        } catch (error) {
            throw error;
        }

        if (!response.ok) {
            const body = await response.json();
            throw new Error(body.mensaje);
            //throw new Error(`HTTP error! status: ${response.status}, body: ${body}`);
        }

        return response.json();
    }

    // Operaciones en base a métodos HTTP
    get(endpoint, headers = {}) {
        const options = {
            method: 'GET',
            headers: headers,
        };
        return this.fetchResource(endpoint, options);
    }

    post(endpoint, body, headers = {}) {
        const options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        };
        return this.fetchResource(endpoint, options);
    }

    put(endpoint, body) {
        const options = {
            method: 'PUT',
            body: JSON.stringify(body),
        };
        return this.fetchResource(endpoint, options);
    }

    delete(endpoint, headers = {}) {
        const options = {
            method: 'DELETE',
            headers: headers
        };
        return this.fetchResource(endpoint, options);
    }
}