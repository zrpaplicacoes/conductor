import { DefaultResponse } from "./default-response";

export interface ErrorResponse extends DefaultResponse {
  error: string;
  errors?: Array<{
    [field: string]: string[]
  }>;
}
