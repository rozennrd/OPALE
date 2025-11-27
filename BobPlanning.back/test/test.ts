// @ts-ignore
import request from 'supertest';
import app from '../src/index';

jest.mock('../src/middleware/authJwt', () => ({
  verifyToken: (req: any, res: any, next: any) => next(),
}));

describe('GET /getPromosData', () => {
  let server: any;

  beforeAll((done) => {
    server = app.listen(4000, () => done());
  });

  afterAll((done) => {
    server.close(() => done());
  });

  it('should return promos data', async () => {
    const res = await request(server).get('/getPromosData');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('Promos');
  });
});
