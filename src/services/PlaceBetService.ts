import { getRedisLock, releaseRedisLock } from '../utils/redisLock';
import { SeamlessTransactionWebhookValidator } from './SeamlessTransactionWebhookValidator';
import { SlotWebhookService } from './SlotWebhookService';

export class PlaceBetService {
  static async placeBet(requestBody: any) {
    // 1. Validate request (signature, member, etc.)
    const validator = await SeamlessTransactionWebhookValidator.validate(requestBody);
    if (validator.fails()) {
      return { status: 400, body: validator.getResponse() };
    }

    const userId = validator.member.id;
    const wagerIds = validator.transactions.map((t: any) => t.WagerID).filter(Boolean);

    // 2. Acquire Redis locks
    if (!(await getRedisLock(`wallet:lock:${userId}`))) {
      return { status: 409, body: { message: 'Another transaction is currently processing for this user.' } };
    }
    for (const wagerId of wagerIds) {
      if (!(await getRedisLock(`wager:lock:${wagerId}`))) {
        await releaseRedisLock(`wallet:lock:${userId}`);
        return { status: 409, body: { message: `Another transaction is currently processing for wager_id ${wagerId}` } };
      }
    }

    // 3. Business logic (DB transaction, insert bets, process transfer, etc.)
    try {
      // ... (port your PHP logic here, using TypeORM/Prisma transactions)
      // On success:
      await releaseRedisLock(`wallet:lock:${userId}`);
      for (const wagerId of wagerIds) await releaseRedisLock(`wager:lock:${wagerId}`);
      return {
        status: 200,
        body: SlotWebhookService.buildResponse(0, validator.afterBalance, validator.beforeBalance)
      };
    } catch (e: any) {
      await releaseRedisLock(`wallet:lock:${userId}`);
      for (const wagerId of wagerIds) await releaseRedisLock(`wager:lock:${wagerId}`);
      return { status: 500, body: { message: e.message } };
    }
  }
}
