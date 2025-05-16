export class SlotWebhookService {
  static buildResponse(errorCode: number, afterBalance: number, beforeBalance: number) {
    return {
      ErrorCode: errorCode,
      ErrorMessage: errorCode === 0 ? 'Success' : 'Error',
      Balance: Number(afterBalance.toFixed(4)),
      BeforeBalance: Number(beforeBalance.toFixed(4)),
    };
  }
}
