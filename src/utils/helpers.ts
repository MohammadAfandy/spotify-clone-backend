import { nanoid } from 'nanoid';
import { Request } from 'express';

import {
  CLIENT_ID,
  REDIRECT_URI,
} from './constants';
import { SpotifyAuthorizeQuery } from '../types/spotify-authorize-query';

export const randomString = (length = 10): string => {
  return nanoid(length);
};

export const getIpAddress = (req: Request): string | null => {
  let ip = req.headers["x-forwarded-for"];
  if (!ip) ip = req.socket.remoteAddress;

  return ip as string || null;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getQueryParamAuthorize = (): SpotifyAuthorizeQuery => {
  const state = randomString();
  let a = '';
  return {
    response_type: "code",
    client_id: CLIENT_ID,
    scope: `user-read-private user-read-playback-state streaming user-modify-playback-state playlist-modify-public user-library-modify user-top-read user-read-currently-playing playlist-read-private user-follow-read user-read-recently-played playlist-modify-private user-follow-modify user-library-read user-read-email ugc-image-upload`,
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: true,
  }
};
