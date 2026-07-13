import type { Request, Response, NextFunction } from 'express';
import { jest, describe, test, expect } from '@jest/globals';
import { requireUsername } from './auth.middleware.js';

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
}

describe('requireUsername', () => {
  test('blocks with 403 when req.user has no username', () => {
    const req = { user: { _id: 'u1' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireUsername(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() when req.user has a username', () => {
    const req = { user: { _id: 'u1', username: 'johndoe' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireUsername(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
