import crypto from 'crypto';

export function isValidSignature(operatorCode: string, requestTime: string, method: string, secretKey: string, sign: string): boolean {
  const expected = crypto.createHash('md5').update(operatorCode + requestTime + method + secretKey).digest('hex');
  return expected === sign;
}
