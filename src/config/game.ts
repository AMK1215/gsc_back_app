import dotenv from 'dotenv';
dotenv.config();

export const GAME_OPERATOR_CODE = process.env.GAME_OPERATOR_CODE || '';
export const GAME_SECRET_KEY = process.env.GAME_SECRET_KEY || '';
export const GAME_API_URL = process.env.GAME_API_URL || ''; 