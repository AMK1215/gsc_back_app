export interface GetBalanceRequest {
  MemberName: string;
  OperatorCode: string;
  ProductID?: number;
  MessageID: string;
  RequestTime: string;
  Sign: string;
}

export interface GetBalanceResponse {
  ErrorCode: number;
  ErrorMessage: string;
  Balance: number | string;
  BeforeBalance: number | string;
} 