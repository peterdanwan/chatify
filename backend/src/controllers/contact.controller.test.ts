import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { connectTestDb, disconnectTestDb, clearTestDb } from '#lib/testDb.js';
import { User } from '#models/User.js';
import { ContactRequest } from '#models/ContactRequest.js';
import {
  sendContactRequest,
  acceptContactRequest,
  removeContact,
  getContacts,
  getIncomingRequests,
  areContacts,
} from './contact.controller.js';

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
}

let userCounter = 0;
async function createUser(overrides: Partial<{ displayName: string; username: string }> = {}) {
  userCounter += 1;
  return User.create({
    email: `user${userCounter}@test.com`,
    displayName: 'Test User',
    username: `user${userCounter}`,
    ...overrides,
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

describe('sendContactRequest', () => {
  test('creates a pending request between two distinct users', async () => {
    const me = await createUser({ username: 'alice' });
    const them = await createUser({ username: 'bob' });

    const req = { user: me, body: { username: 'bob' } } as unknown as Request;
    const res = mockRes();

    await sendContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const stored = await ContactRequest.findOne({ requester: me._id, recipient: them._id });
    expect(stored?.status).toBe('pending');
  });

  test('rejects adding yourself', async () => {
    const me = await createUser({ username: 'alice' });
    const req = { user: me, body: { username: 'alice' } } as unknown as Request;
    const res = mockRes();

    await sendContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404s for an unknown username', async () => {
    const me = await createUser({ username: 'alice' });
    const req = { user: me, body: { username: 'ghost' } } as unknown as Request;
    const res = mockRes();

    await sendContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('409s on a duplicate pending request', async () => {
    const me = await createUser({ username: 'alice' });
    const them = await createUser({ username: 'bob' });
    await ContactRequest.create({ requester: me._id, recipient: them._id, status: 'pending' });

    const req = { user: me, body: { username: 'bob' } } as unknown as Request;
    const res = mockRes();

    await sendContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('409s if already contacts', async () => {
    const me = await createUser({ username: 'alice' });
    const them = await createUser({ username: 'bob' });
    await ContactRequest.create({ requester: me._id, recipient: them._id, status: 'accepted' });

    const req = { user: me, body: { username: 'bob' } } as unknown as Request;
    const res = mockRes();

    await sendContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('mutual request collapses straight into acceptance instead of a duplicate pending doc', async () => {
    const me = await createUser({ username: 'alice' });
    const them = await createUser({ username: 'bob' });
    // "them" already requested "me"
    const existing = await ContactRequest.create({
      requester: them._id,
      recipient: me._id,
      status: 'pending',
    });

    const req = { user: me, body: { username: 'bob' } } as unknown as Request;
    const res = mockRes();

    await sendContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const updated = await ContactRequest.findById(existing._id);
    expect(updated?.status).toBe('accepted');
    expect(await ContactRequest.countDocuments()).toBe(1);
  });
});

describe('acceptContactRequest', () => {
  test('accepts a pending request addressed to me', async () => {
    const me = await createUser();
    const them = await createUser();
    const request = await ContactRequest.create({
      requester: them._id,
      recipient: me._id,
      status: 'pending',
    });

    const req = { user: me, params: { id: request._id.toString() } } as unknown as Request;
    const res = mockRes();

    await acceptContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((await ContactRequest.findById(request._id))?.status).toBe('accepted');
  });

  test("404s for a request that isn't addressed to me", async () => {
    const me = await createUser();
    const a = await createUser();
    const b = await createUser();
    const request = await ContactRequest.create({
      requester: a._id,
      recipient: b._id,
      status: 'pending',
    });

    const req = { user: me, params: { id: request._id.toString() } } as unknown as Request;
    const res = mockRes();

    await acceptContactRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('removeContact', () => {
  test('lets either party delete the relationship', async () => {
    const me = await createUser();
    const them = await createUser();
    const request = await ContactRequest.create({
      requester: me._id,
      recipient: them._id,
      status: 'accepted',
    });

    const req = { user: me, params: { id: request._id.toString() } } as unknown as Request;
    const res = mockRes();

    await removeContact(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(await ContactRequest.findById(request._id)).toBeNull();
  });

  test("404s if you're not a party to the request", async () => {
    const me = await createUser();
    const a = await createUser();
    const b = await createUser();
    const request = await ContactRequest.create({
      requester: a._id,
      recipient: b._id,
      status: 'accepted',
    });

    const req = { user: me, params: { id: request._id.toString() } } as unknown as Request;
    const res = mockRes();

    await removeContact(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('getContacts / getIncomingRequests', () => {
  test('getContacts returns only accepted relationships, from either direction', async () => {
    const me = await createUser();
    const acceptedAsRequester = await createUser({ displayName: 'Accepted A' });
    const acceptedAsRecipient = await createUser({ displayName: 'Accepted B' });
    const pendingOnly = await createUser({ displayName: 'Pending Only' });

    await ContactRequest.create({
      requester: me._id,
      recipient: acceptedAsRequester._id,
      status: 'accepted',
    });
    await ContactRequest.create({
      requester: acceptedAsRecipient._id,
      recipient: me._id,
      status: 'accepted',
    });
    await ContactRequest.create({
      requester: me._id,
      recipient: pendingOnly._id,
      status: 'pending',
    });

    const req = { user: me } as unknown as Request;
    const res = mockRes();

    await getContacts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = jest.mocked(res.json).mock.calls[0][0] as Array<{ displayName: string }>;
    expect(body.map((c) => c.displayName).sort()).toEqual(['Accepted A', 'Accepted B']);
  });

  test('getIncomingRequests only returns pending requests addressed to me', async () => {
    const me = await createUser();
    const requester = await createUser({ displayName: 'Wants In' });
    const other = await createUser();

    await ContactRequest.create({ requester: requester._id, recipient: me._id, status: 'pending' });
    await ContactRequest.create({ requester: me._id, recipient: other._id, status: 'pending' });

    const req = { user: me } as unknown as Request;
    const res = mockRes();

    await getIncomingRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = jest.mocked(res.json).mock.calls[0][0] as Array<{
      requester: { displayName: string };
    }>;
    expect(body).toHaveLength(1);
    expect(body[0].requester.displayName).toBe('Wants In');
  });
});

describe('areContacts', () => {
  test('true only when an accepted relationship exists, checked in either direction', async () => {
    const a = await createUser();
    const b = await createUser();
    const c = await createUser();

    await ContactRequest.create({ requester: a._id, recipient: b._id, status: 'accepted' });
    await ContactRequest.create({ requester: c._id, recipient: a._id, status: 'pending' });

    expect(await areContacts(a._id, b._id)).toBe(true);
    expect(await areContacts(b._id, a._id)).toBe(true); // direction-independent
    expect(await areContacts(a._id, c._id)).toBe(false); // pending doesn't count
  });
});
