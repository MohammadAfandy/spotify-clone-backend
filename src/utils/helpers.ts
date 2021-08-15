import { nanoid } from 'nanoid';
import { Request } from 'express';

export const randomString = (length: number = 10) => {
  return nanoid(length);
};

export const getIpAddress = (req: Request): string | null => {
  let ip = req.headers["x-forwarded-for"];
  if (!ip) ip = req.socket.remoteAddress;

  return ip as string || null;
};
