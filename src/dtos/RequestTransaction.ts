import { IsString, IsNumber } from 'class-validator';

export class RequestTransaction {
    @IsNumber() MemberID!: number;
    @IsNumber() Status!: number;
    @IsString() ProductID!: string;
    @IsNumber() GameType!: number;
    @IsString() TransactionID!: string;
    @IsString() WagerID!: string;
    @IsNumber() BetAmount!: number;
    @IsNumber() TransactionAmount!: number;
    @IsNumber() PayoutAmount!: number;
    @IsNumber() ValidBetAmount!: number;
    @IsString() MemberName!: string;
  }