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

export interface PlaceBetRequest {
  MemberName: string;
  OperatorCode: string;
  ProductID: number;
  MessageID: string;
  RequestTime: string;
  Sign: string;
  Transactions: Array<{
    MemberID: number;
    Status: number;
    ProductID: string;
    GameType: number;
    TransactionID: string;
    WagerID: string;
    BetAmount: number;
    TransactionAmount: number;
    PayoutAmount: number;
    ValidBetAmount: number;
    MemberName: string;
  }>;
} 