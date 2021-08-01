import { nanoid } from 'nanoid';

export const randomString = (length: number = 10) => {
  return nanoid(length);
};
