import axios, {AxiosError} from "axios";

export class ErrorType {
    static UNKNOWN = new ErrorType('UNKNOWN');
    static NETWORK = new ErrorType('NETWORK');
    static SERVER = new ErrorType('SERVER');
    static CLIENT = new ErrorType('CLIENT');
    static AUTHENTICATION_REQUIRED = new ErrorType('AUTHENTICATION_REQUIRED');
    static UNAUTHORIZED = new ErrorType('UNAUTHORIZED');

    constructor(type: string) {
        this.type = type;
    }
}

export class RequestError {
    cause: ErrorType;
    httpStatus: string;
    message: string;

    constructor(cause: ErrorType, httpStatus: string, message: string) {
        this.cause = cause;
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
export class ClientBase {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

    }

    nullSafeOnComplete(result: any, onComplete?: (data: any) => void) {
        if (!onComplete) {
            return;
        }

        if (result.data != null) {
            onComplete(result.data);
        }
    }

    handleError (err: AxiosError, errorSetter: (RequestError) => void) {
        console.log('Api request failed')
        console.log(err.code)

        if (err.code === "ERR_NETWORK"){
            errorSetter(new RequestError(ErrorType.NETWORK, null, "Cannot connect to server"))
        }
    };
}
