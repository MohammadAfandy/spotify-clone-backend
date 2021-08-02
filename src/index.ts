import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import querystring from 'querystring';
// @ts-ignore
import lyricsFinder from 'lyrics-finder';

import { randomString } from './utils/helpers';
import {
  PORT,
  CLIENT_ID,
  AUTHORIZE_URI,
  REDIRECT_URI,
  FRONTEND_URI,
} from './utils/constants';
import Api from './utils/api';
import axios from 'axios';

const app = express();
app.use(cors({
  origin: FRONTEND_URI,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cookiePrefix = 'spotify_clone';

app.get('/', (req, res, next) => {
  res.send('hello from spotify clone backend');
});

app.get('/login', (req, res, next) => {
  const state = randomString();
  res.cookie(cookiePrefix + '_state', state);

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: 'user-read-private user-read-playback-state streaming user-modify-playback-state playlist-modify-public user-library-modify user-top-read user-read-currently-playing playlist-read-private user-follow-read user-read-recently-played playlist-modify-private user-follow-modify user-library-read user-read-email ugc-image-upload',
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: true,
  });

  res.redirect(AUTHORIZE_URI + '?' + queryParams);
});

app.get('/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const currentState = req.cookies[cookiePrefix + '_state'];
  
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

    res.clearCookie(cookiePrefix + '_state');

    const response = await Api.post('/token', querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }));

    if (response.status !== 200) {
      throw new Error(response.data);
    }

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
    console.error('error', error);
    return res.redirect(FRONTEND_URI + '?' + querystring.stringify({
      error: error.message,
    }));
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

    if (response.status !== 200) {
      throw new Error(response.data);
    }
  
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
    })
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
  console.log(err.stack);
  console.log(err.message);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
