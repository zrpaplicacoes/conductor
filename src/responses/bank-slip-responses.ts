import { DefaultResponse } from "./default-response";

export interface BankSlipCreateResponse extends DefaultResponse {
  id: number;
  value: number;
  registered: boolean;
}
