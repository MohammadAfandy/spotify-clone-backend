import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import querystring from 'querystring';
import lyricsFinder from 'lyrics-finder';
import geoip from 'geoip-lite';
import myCache from './utils/cache';

import {
  getIpAddress,
  getQueryParamAuthorize,
} from './utils/helpers';
import {
  AUTHORIZE_URI,
  REDIRECT_URI,
  FRONTEND_URI,
  COOKIE_PREFIX,
  DEBUG,
} from './utils/constants';
import Api from './utils/api';
import axios, { Method } from 'axios';

const app = express();

const corsOptions: CorsOptions = {};
if (!DEBUG) corsOptions.origin = FRONTEND_URI;
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
  res.json({
    message: 'spotify clone backend'
  });
});

app.get('/login', (req, res, next) => {
  const queryParams = getQueryParamAuthorize();
  const { state } = queryParams;
  res.cookie(COOKIE_PREFIX + '_state', state);

  res.redirect(AUTHORIZE_URI + '?' + querystring.stringify(queryParams));
});

app.get('/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const currentState = req.cookies[COOKIE_PREFIX + '_state'];
  
    if (!code || typeof code !== 'string') {
      return res.redirect(FRONTEND_URI + '?' + querystring.stringify({
        error: 'code not valid',
      }));
    }

    if (!state || state !== currentState) {
      return res.redirect(FRONTEND_URI + '?' + querystring.stringify({
        error: 'state not valid',
      }));
    }

    res.clearCookie(COOKIE_PREFIX + '_state');

    const response = await Api.post('/token', querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }));

    const { access_token, refresh_token } = response.data;

    const responseProfile = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const { country } = responseProfile.data;

    const queryParams = querystring.stringify({
      access_token,
      refresh_token,
      country,
    });

    res.redirect(FRONTEND_URI + '#' + queryParams);

  } catch (error) {
    if (error instanceof Error) {
      return res.redirect(FRONTEND_URI + '?' + querystring.stringify({
        error: error.message,
      }));
    }
  }
});

app.post('/refresh_token', async (req, res, next) => {
  try {
    const { refresh_token: refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new Error('Refresh Token Not Valid');
    }

    const response = await Api.post('/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }));

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

app.all('/spotify/:path(*)', async (req, res, next) => {
  try {
    const { path } = req.params;
    const method = req.method as Method;
    let data: Record<string, unknown> | null = null;
    if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
      data = req.body;
    }

    // get access token if it is not available in cache
    let access_token = myCache.get('access_token') as string || '';
    if (!access_token) {
      console.log('requesting access token');
      const responseCredential = await Api.post('/token', querystring.stringify({
        grant_type: 'client_credentials',
      }));
      access_token = responseCredential.data.access_token;

      // set TTL cache based on expires_in
      const expires_in = responseCredential.data.expires_in;
      myCache.set('access_token', access_token, expires_in);
    }

    const ip = getIpAddress(req);
    let country = 'ID';
    if (ip) {
      const geoipRes = geoip.lookup(ip);
      if (geoipRes) {
        country = geoipRes.country;
      }
    }

    const response = await axios({
      method,
      url: `https://api.spotify.com/v1/${path}`,
      params: {
        country,
        ...req.query,
      },
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      }
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

app.get('/lyrics', async (req, res, next) => {
  try {
    const { artist, title } = req.query;
    const lyric = await lyricsFinder(artist, title);
    res.json({
      lyric,
    });
  } catch (error) {
    next(error);
  }
});

// not found handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // console.error(err.stack);
  // console.error(err.message);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

export default app;
