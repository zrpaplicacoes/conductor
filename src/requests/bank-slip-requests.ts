import { BankSlipType } from "../models";

export interface BankSlipCreateRequest {
  accountId: number;
  value: number;
  dueDate?: Date;
  type?: BankSlipType;
}
