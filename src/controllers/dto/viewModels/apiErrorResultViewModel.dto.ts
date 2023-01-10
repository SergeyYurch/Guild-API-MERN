export interface APIErrorResultModel  {
    errorsMessages: FieldError[];
}

export interface FieldError  {
    message: string;
    field: string;
}