export enum GameStatusCode {
  Pending = 100,
  Settle = 101,
  Void = 102,
}

export const GameStatusDescription: Record<GameStatusCode, string> = {
  [GameStatusCode.Pending]: 'Pending',
  [GameStatusCode.Settle]: 'Settle',
  [GameStatusCode.Void]: 'Void',
}; 