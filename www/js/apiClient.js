export default class APIClient {
    constructor(baseURL, authToken = null, retryAttempts = 3, retryDelay = 500) {
        this.baseURL = baseURL;
        this.authToken = authToken;
        this.retryAttempts = retryAttempts;
        this.retryDelay = retryDelay;
    }

    /**
     * Fetches a resource from the specified endpoint.
     * -----------------------------------------------
     * @param {string} endpoint - The endpoint to fetch the resource from.
     * @param {object} options - (optional) Additional options for the fetch request.
     * @param {number} attempt - (optional) The number of the current attempt (used for retrying).
     * @return {Promise<any>} - A promise that resolves with the fetched resource.
     */
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
        debugger
        try {
            // await automatically extracts and assigns the data returned by a promise to a variable.
            // The await supplements the then() function.However, it doesn't supplement the catch(). 
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

    // Method-based operations
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