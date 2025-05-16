import Redis from 'ioredis';
const redis = new Redis();

export async function getRedisLock(key: string, ttl = 15): Promise<boolean> {
  return (await redis.set(key, '1', 'EX', ttl, 'NX')) ? true : false;
}
export async function releaseRedisLock(key: string) {
  await redis.del(key);
}
