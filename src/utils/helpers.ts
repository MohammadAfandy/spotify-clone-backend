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
  return {
    response_type: "code",
    client_id: CLIENT_ID,
    scope: `ugc-image-upload user-read-playback-state user-modify-playback-state user-read-private user-follow-modify user-follow-read user-library-modify user-library-read streaming user-read-playback-position playlist-modify-private playlist-read-collaborative playlist-read-private user-top-read playlist-modify-public user-read-currently-playing user-read-recently-played app-remote-control user-read-email`,
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: true,
  };
};
