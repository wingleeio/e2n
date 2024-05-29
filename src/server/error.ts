export class ApiError extends Error {
    constructor(public status = 500, message: string) {
        super(message);
    }
}
