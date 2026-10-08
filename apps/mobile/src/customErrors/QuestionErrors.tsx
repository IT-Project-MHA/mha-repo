class InvalidQuestionArrayError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmptyQuestionArray";
        Object.setPrototypeOf(this, InvalidQuestionArrayError.prototype);
    }
}

class InvalidQuestionTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidQuestionTypeError";
        Object.setPrototypeOf(this, InvalidQuestionTypeError.prototype);
    }
}
export {InvalidQuestionArrayError as EmptyQuestionArrayError, InvalidQuestionTypeError}