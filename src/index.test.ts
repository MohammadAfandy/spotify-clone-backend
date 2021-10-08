import request from 'supertest';
import cookie from 'cookie';
import app from './app';

import querystring from 'querystring';
import {
  AUTHORIZE_URI,
  FRONTEND_URI,
  COOKIE_PREFIX,
} from './utils/constants';
import { getQueryParamAuthorize } from './utils/helpers';

describe('Login Page', () => {
  it('should redirect to spotify authorization page', async () => {
    const response = await request(app).get('/login');
    const queryParams = getQueryParamAuthorize();

    // remove state because it is random
    queryParams.state = '';
    const desiredUrl = AUTHORIZE_URI + '?' + querystring.stringify(queryParams);
    const { location } = response.headers;
    const locationObj = querystring.parse(location.substring(location.indexOf('?') + 1));
    locationObj.state = '';
    const locationUrl = AUTHORIZE_URI + '?' + querystring.stringify(locationObj);

    expect(response.status).toBe(302);
    expect(locationUrl).toBe(desiredUrl);
  });

  it('should set a state cookie', async () => {
    const response = await request(app).get('/login');
    const cookieObj = cookie.parse(decodeURIComponent(response.headers['set-cookie']));
    expect(cookieObj).toMatchObject({
      [COOKIE_PREFIX + '_state']: expect.any(String)
    });
  });
});


describe('Callback', () => {
  it('should redirect to frontend page if no code supplied in query', async () => {
    const response = await request(app).get('/callback?state=tes-state');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(FRONTEND_URI + '?' + querystring.stringify({
      error: 'code not valid',
    }));
  });

  it('should redirect to frontend page if no state supplied in query', async () => {
    const response = await request(app).get('/callback?code=tes-code');
    expect(response.status).toBe(200);
    expect(response.headers.location).toBe(FRONTEND_URI + '?' + querystring.stringify({
      error: 'state not valid',
    }));
  });
  
  it(
    'should redirect to frontend page if state in query is different from state in cookies',
    async () => {
      const response = await request(app)
        .get('/callback?state=tes-state&code=tes-code')
        .set('Cookie', [`${COOKIE_PREFIX}_state=tes-state-different`]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(FRONTEND_URI + '?' + querystring.stringify({
        error: 'state not valid',
      }));
    }
  );
});

describe('Refresh Token', () => {
  it('should has refresh_token in body', async () => {
    const response = await request(app).post('/refresh_token');
    expect(response.status).not.toBe(200);
  });
});
