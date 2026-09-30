// replace with active base URL before deployment
const BASE_URL = "http://localhost:8000/api";

export class ApiError extends Error {
    constructor(status, data) {
        super(`API request failed with status ${status}`);
        this.status = status;
        this.data = data;
    }
}

async function request(method, path, body) {
    const response = await fetch(`${BASE_URL}/${path}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
        throw new ApiError(response.status, data);
    }
    return data;
}

/* General function for processing Django APIs */
async function operate(endpoint, operation, values = {}) {
    const { id, ...attributes } = values;

    if (operation == 'select') {
        if (id) {
            return request('GET', `${endpoint}/${id}`);
        }
        const query = new URLSearchParams();
        Object.entries(attributes)
            .filter(([, value]) => value != null)
            .forEach(([key, value]) => query.append(key, value));
        const queryString = query.toString();
        return request('GET', `${endpoint}/${queryString ? `?${queryString}` : ''}`);

    } else if (operation == 'create') {
        return request('POST', `${endpoint}/`, attributes);

    } else if (operation == 'update') {
        return request('PATCH', `${endpoint}/${id}`, attributes);

    } else if (operation == 'delete') {
        return request('DELETE', `${endpoint}/${id}`);
    }

    throw new Error(`Unknown operation: ${operation}`);
}

