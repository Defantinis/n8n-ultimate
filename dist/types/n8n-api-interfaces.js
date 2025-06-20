/**
 * n8n Core API Interfaces - Based on Official Repository Research
 *
 * These interfaces define the core APIs used by n8n for workflow execution,
 * data flow between nodes, credential management, and execution context.
 */
// Constants and type guards
export const N8N_API_CONSTANTS = {
    NODE_PROPERTY_TYPES: [
        'boolean',
        'collection',
        'color',
        'dateTime',
        'fixedCollection',
        'hidden',
        'json',
        'notice',
        'number',
        'options',
        'string',
        'credentialsSelect',
        'resourceLocator',
        'curlImport',
        'resourceMapper',
        'filter'
    ],
    HTTP_METHODS: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'HEAD',
        'OPTIONS'
    ],
    EXECUTION_STATUSES: [
        'success',
        'error',
        'running',
        'waiting'
    ],
    ERROR_HANDLING_OPTIONS: [
        'stopWorkflow',
        'continueRegularOutput',
        'continueErrorOutput'
    ]
};
export function isINodeExecutionData(data) {
    return data && typeof data === 'object' && 'json' in data;
}
export function isIDataObject(data) {
    return data && typeof data === 'object' && !Array.isArray(data);
}
export function isNodeOperationError(error) {
    return error && typeof error === 'object' && 'message' in error;
}
export const N8N_API_INTERFACES_VERSION = '1.0.0';
//# sourceMappingURL=n8n-api-interfaces.js.map