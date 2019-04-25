export enum BankSlipType {
  PRIVATE = 7,
  AGREEMENT = 8,
  RECHARGE = 9
}

export interface BankSlipCreateRequest {
  accountId: number;
  value: number;
  dueDate?: Date;
  type?: BankSlipType;
}
