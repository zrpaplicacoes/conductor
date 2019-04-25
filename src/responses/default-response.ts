export interface DefaultResponse {
  statusCode: number;
  rawBody?: string;
  headers: {
    [key: string]: string
  };
}
