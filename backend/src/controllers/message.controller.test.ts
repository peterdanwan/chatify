import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { connectTestDb, disconnectTestDb, clearTestDb } from '#lib/testDb.js';
import { User } from '#models/User.js';
import { ContactRequest } from '#models/ContactRequest.js';
import { Message } from '#models/Message.js';
import { sendMessage, getMessagesByUserId } from './message.controller.js';

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
}

let userCounter = 0;
async function createUser() {
  userCounter += 1;
  return User.create({
    email: `user${userCounter}@test.com`,
    displayName: 'Test User',
    username: `user${userCounter}`,
  });
}

beforeAll(async () => {
  await connectTestDb();
}, 60000);

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('sendMessage', () => {
  test('blocks messaging a non-contact', async () => {
    const sender = await createUser();
    const receiver = await createUser();

    const req = {
      user: sender,
      params: { id: receiver._id.toString() },
      body: { text: 'hi' },
    } as unknown as Request<{ id: string }>;
    const res = mockRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(await Message.countDocuments()).toBe(0);
  });

  test('allows messaging an accepted contact', async () => {
    const sender = await createUser();
    const receiver = await createUser();
    await ContactRequest.create({
      requester: sender._id,
      recipient: receiver._id,
      status: 'accepted',
    });

    const req = {
      user: sender,
      params: { id: receiver._id.toString() },
      body: { text: 'hi' },
    } as unknown as Request<{ id: string }>;
    const res = mockRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(await Message.countDocuments()).toBe(1);
  });

  test('a pending (not yet accepted) request does not unlock messaging', async () => {
    const sender = await createUser();
    const receiver = await createUser();
    await ContactRequest.create({
      requester: sender._id,
      recipient: receiver._id,
      status: 'pending',
    });

    const req = {
      user: sender,
      params: { id: receiver._id.toString() },
      body: { text: 'hi' },
    } as unknown as Request<{ id: string }>;
    const res = mockRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('getMessagesByUserId', () => {
  test('blocks reading messages with a non-contact', async () => {
    const me = await createUser();
    const other = await createUser();

    const req = {
      user: me,
      params: { id: other._id.toString() },
    } as unknown as Request<{ id: string }>;
    const res = mockRes();

    await getMessagesByUserId(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('allows reading messages with an accepted contact', async () => {
    const me = await createUser();
    const other = await createUser();
    await ContactRequest.create({ requester: me._id, recipient: other._id, status: 'accepted' });

    const req = {
      user: me,
      params: { id: other._id.toString() },
    } as unknown as Request<{ id: string }>;
    const res = mockRes();

    await getMessagesByUserId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
