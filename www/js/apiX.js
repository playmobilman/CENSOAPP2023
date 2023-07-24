// api.js

const fetch = require('node-fetch');

class API {
    constructor(baseURL, authToken = null, retryAttempts = 3, retryDelay = 500) {
        this.baseURL = baseURL;
        this.authToken = authToken;
        this.retryAttempts = retryAttempts;
        this.retryDelay = retryDelay;
    }

    async fetchResource(endpoint, options = {}, attempt = 1) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        const settings = Object.assign({ headers }, options);

        let response;
        try {
            response = await fetch(url, settings);
        } catch (error) {
            if (attempt < this.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchResource(endpoint, options, attempt + 1);
            }
            throw error;
        }

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${body}`);
        }

        return response.json();
    }

    get(endpoint) {
        return this.fetchResource(endpoint);
    }

    post(endpoint, body) {
        const options = {
            method: 'POST',
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

    delete(endpoint) {
        const options = {
            method: 'DELETE',
        };
        return this.fetchResource(endpoint, options);
    }
}

module.exports = API;
