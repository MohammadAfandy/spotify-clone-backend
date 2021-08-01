import 'dotenv/config';

export const CLIENT_ID = process.env.CLIENT_ID || '';
export const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
export const REDIRECT_URI = process.env.REDIRECT_URI || '';
export const FRONTEND_URI = process.env.FRONTEND_URI || '';
export const DEBUG = process.env.DEBUG === 'false' ? false : true;
export const AUTHORIZE_URI = 'https://accounts.spotify.com/authorize';
export const BASE_URI = 'https://accounts.spotify.com/api';
