import axios from 'axios';
import {
  CLIENT_ID,
  CLIENT_SECRET,
  BASE_URI,
} from './constants';

export default axios.create({
  baseURL: BASE_URI,
  headers: {
    Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
