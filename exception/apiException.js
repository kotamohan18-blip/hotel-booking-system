export class ApiException extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = "ApiException";
        this.originalError = originalError;
    }
}
