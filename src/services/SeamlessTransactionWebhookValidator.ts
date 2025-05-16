import { isValidSignature } from '../utils/signature';
import { User } from '../models/User';

export class SeamlessTransactionWebhookValidator {
    member!: any;
    transactions!: any[];
    afterBalance!: number;
    beforeBalance!: number;
  response: any;

  static async validate(request: any) {
    const validator = new SeamlessTransactionWebhookValidator();
    // 1. Signature check
    if (!isValidSignature(request.OperatorCode, request.RequestTime, 'placebet', process.env.SECRET_KEY || '', request.Sign)) {
      validator.response = { ErrorCode: 1001, ErrorMessage: 'Invalid Signature' };
      return validator;
    }
    // 2. Member check
    validator.member = await User.findByName(request.MemberName);
    if (!validator.member) {
      validator.response = { ErrorCode: 1002, ErrorMessage: 'Member Not Exists' };
      return validator;
    }
    // 3. Transactions check
    validator.transactions = request.Transactions || [];
    if (!Array.isArray(validator.transactions) || validator.transactions.length === 0) {
      validator.response = { ErrorCode: 1003, ErrorMessage: 'Invalid transaction data format.' };
      return validator;
    }
    // 4. Balance check (simulate)
    validator.beforeBalance = validator.member.balance;
    const totalTransactionAmount = validator.transactions.reduce((sum: number, t: any) => sum + (t.TransactionAmount || 0), 0);
    validator.afterBalance = validator.beforeBalance + totalTransactionAmount;
    if (validator.afterBalance < 0) {
      validator.response = { ErrorCode: 1004, ErrorMessage: 'Insufficient Balance' };
      return validator;
    }
    return validator;
  }

  fails() {
    return !!this.response;
  }
  getResponse() {
    return this.response;
  }
}
