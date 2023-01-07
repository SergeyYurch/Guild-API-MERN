export interface ResultInterface {
    status: boolean;  // if method(function) result is positive status:true
    code: number; // usually the code to be returned to the client or else // х.з. не придумал
    message: string;
}