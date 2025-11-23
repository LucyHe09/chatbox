/**
 * Session validation module for the main process
 * This is a simplified version that doesn't depend on renderer-side types
 */

const VALID_ROLES = ['user', 'assistant', 'system'];

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    warnings?: string[];
}

/**
 * Validates a session object against the expected schema
 */
export function validateSession(data: any): ValidationResult {
    const warnings: string[] = [];

    // Check if data is null or undefined
    if (data === null || data === undefined) {
        return {
            isValid: false,
            error: 'Session data is null or undefined. Please provide a valid JSON file.'
        };
    }

    // Check if data is an object
    if (typeof data !== 'object' || Array.isArray(data)) {
        return {
            isValid: false,
            error: 'Invalid JSON structure. Expected an object but received ' +
                   (Array.isArray(data) ? 'an array' : typeof data) + '.'
        };
    }

    // Validate required fields
    if (!data.id) {
        return {
            isValid: false,
            error: 'Missing required field: "id". Each session must have a unique identifier.'
        };
    }

    if (typeof data.id !== 'string') {
        return {
            isValid: false,
            error: `Invalid field type: "id" must be a string, but received ${typeof data.id}.`
        };
    }

    if (!data.name) {
        return {
            isValid: false,
            error: 'Missing required field: "name". Each session must have a name.'
        };
    }

    if (typeof data.name !== 'string') {
        return {
            isValid: false,
            error: `Invalid field type: "name" must be a string, but received ${typeof data.name}.`
        };
    }

    if (!data.messages) {
        return {
            isValid: false,
            error: 'Missing required field: "messages". Each session must have a messages array.'
        };
    }

    if (!Array.isArray(data.messages)) {
        return {
            isValid: false,
            error: `Invalid field type: "messages" must be an array, but received ${typeof data.messages}.`
        };
    }

    // Validate each message
    for (let i = 0; i < data.messages.length; i++) {
        const message = data.messages[i];
        const messageValidation = validateMessage(message, i);

        if (!messageValidation.isValid) {
            return messageValidation;
        }

        if (messageValidation.warnings && messageValidation.warnings.length > 0) {
            warnings.push(...messageValidation.warnings);
        }
    }

    // Check for empty messages array
    if (data.messages.length === 0) {
        warnings.push('The session contains no messages. Consider importing sessions with conversation history.');
    }

    // Check for suspicious ID patterns
    if (!isValidUUID(data.id) && !data.id.match(/^[a-zA-Z0-9_-]+$/)) {
        warnings.push('Session ID contains special characters. A new ID may be generated if this conflicts with existing sessions.');
    }

    // Check session name length
    if (data.name.length > 100) {
        warnings.push(`Session name is very long (${data.name.length} characters). It may be truncated in the UI.`);
    }

    if (data.name.trim() === '') {
        return {
            isValid: false,
            error: 'Session name cannot be empty.'
        };
    }

    return {
        isValid: true,
        warnings: warnings.length > 0 ? warnings : undefined
    };
}

/**
 * Validates a single message object
 */
function validateMessage(message: any, index: number): ValidationResult {
    const warnings: string[] = [];

    if (message === null || message === undefined) {
        return {
            isValid: false,
            error: `Message at index ${index} is null or undefined. All messages must be valid objects.`
        };
    }

    if (typeof message !== 'object' || Array.isArray(message)) {
        return {
            isValid: false,
            error: `Message at index ${index} is not a valid object. Expected an object but received ${Array.isArray(message) ? 'an array' : typeof message}.`
        };
    }

    // Check required fields
    if (!message.id) {
        return {
            isValid: false,
            error: `Message at index ${index} is missing required field: "id". Each message must have a unique identifier.`
        };
    }

    if (typeof message.id !== 'string') {
        return {
            isValid: false,
            error: `Message at index ${index}: "id" must be a string, but received ${typeof message.id}.`
        };
    }

    if (!message.role) {
        return {
            isValid: false,
            error: `Message at index ${index} is missing required field: "role". Valid roles are: user, assistant, system.`
        };
    }

    if (typeof message.role !== 'string') {
        return {
            isValid: false,
            error: `Message at index ${index}: "role" must be a string, but received ${typeof message.role}.`
        };
    }

    // Validate role value
    if (!VALID_ROLES.includes(message.role)) {
        return {
            isValid: false,
            error: `Message at index ${index}: Invalid role "${message.role}". Valid roles are: user, assistant, system.`
        };
    }

    if (message.content === undefined || message.content === null) {
        return {
            isValid: false,
            error: `Message at index ${index} is missing required field: "content". Each message must have content.`
        };
    }

    if (typeof message.content !== 'string') {
        return {
            isValid: false,
            error: `Message at index ${index}: "content" must be a string, but received ${typeof message.content}.`
        };
    }

    // Check for empty content
    if (message.content.trim() === '') {
        warnings.push(`Message at index ${index} has empty content.`);
    }

    // Check for very long content
    if (message.content.length > 100000) {
        warnings.push(`Message at index ${index} has very long content (${message.content.length} characters). This might cause performance issues.`);
    }

    return {
        isValid: true,
        warnings: warnings.length > 0 ? warnings : undefined
    };
}

/**
 * Helper function to check if a string is a valid UUID
 */
function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Validates file size
 */
export function validateFileSize(sizeInBytes: number): ValidationResult {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (sizeInBytes === 0) {
        return {
            isValid: false,
            error: 'The file is empty. Please select a valid JSON file with session data.'
        };
    }

    if (sizeInBytes > maxSize) {
        return {
            isValid: false,
            error: `File size exceeds 10MB limit. Current size: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB. Please use a smaller file.`
        };
    }

    return { isValid: true };
}

/**
 * Validates JSON parsing
 */
export function validateJSONParse(content: string): { data?: any; error?: string } {
    try {
        if (!content || content.trim() === '') {
            return { error: 'The file is empty. Please select a valid JSON file with session data.' };
        }

        const data = JSON.parse(content);
        return { data };
    } catch (error) {
        if (error instanceof SyntaxError) {
            // Try to provide more specific error messages
            const match = error.message.match(/position (\d+)/);
            if (match) {
                const position = parseInt(match[1]);
                const snippet = content.substring(Math.max(0, position - 20), Math.min(content.length, position + 20));
                return {
                    error: `Invalid JSON syntax near position ${position}: "${snippet}". ${error.message}`
                };
            }
            return { error: `Invalid JSON format: ${error.message}` };
        }
        return { error: 'Failed to parse JSON file. Please ensure the file contains valid JSON.' };
    }
}

/**
 * Sanitizes session data by removing invalid optional fields
 */
export function sanitizeSessionData(data: any): any {
    const sanitized: any = {
        id: data.id,
        name: data.name,
        messages: []
    };

    // Sanitize messages
    for (const message of data.messages) {
        sanitized.messages.push({
            id: message.id,
            role: message.role,
            content: message.content
        });
    }

    return sanitized;
}