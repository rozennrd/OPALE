const request = require('supertest');
const express = require('express');

jest.spyOn(express.application, 'listen').mockImplementation(() => ({
  timeout: 0,
  close: jest.fn(),
}));

// Mocks must be defined before importing the app so the modules used
// when routes/controllers are registered will use the mocked implementations.
const mockGetPromotions = jest.fn();
const mockGetPromotionById = jest.fn();
const mockCreatePromotion = jest.fn();
const mockUpdatePromotion = jest.fn();
const mockDeletePromotion = jest.fn();
const mockGetLegacyPromos = jest.fn();

jest.mock('../src/middleware/authJwt', () => ({
  __esModule: true,
  default: {
    verifyToken: (req: any, res: any, next: any) => next(),
  },
}));

jest.mock('../src/domain/services/promotionService', () => ({
  __esModule: true,
  promotionService: {
    getPromotions: mockGetPromotions,
    getPromotionById: mockGetPromotionById,
    createPromotion: mockCreatePromotion,
    updatePromotion: mockUpdatePromotion,
    deletePromotion: mockDeletePromotion,
    getLegacyPromos: mockGetLegacyPromos,
  },
}));

// Import app after mocks so routes/controllers pick up the mocked modules
import app from '../src/index';

describe('Promotion endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /getPromotions', () => {
    it('should return a list of promotions on success', async () => {
      const promos = [
        { id: 1, nom: 'Promo 2025', effectifs: 30, id_cycle: '1', date_start: '2025-09-01', date_end: '2026-06-30' },
      ];
      mockGetPromotions.mockResolvedValue(promos);

      const res = await request(app).get('/getPromotions').expect(200);
      expect(res.body).toEqual(promos);
      expect(mockGetPromotions).toHaveBeenCalled();
    });

    it('should return 500 when the service throws', async () => {
      mockGetPromotions.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/getPromotions').expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /getPromoById', () => {
    it('should return a promotion when found', async () => {
      const promo = { id: 1, nom: 'Promo 2025', effectifs: 30 };
      mockGetPromotionById.mockResolvedValue(promo);

      const res = await request(app)
        .get('/getPromoById')
        .query({ id: '1' })
        .expect(200);

      expect(res.body).toEqual(promo);
      expect(mockGetPromotionById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when not found', async () => {
      const err: any = new Error('Promotion non trouvée');
      err.statusCode = 404;
      mockGetPromotionById.mockRejectedValue(err);

      const res = await request(app)
        .get('/getPromoById')
        .query({ id: '999' })
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 500 when service errors', async () => {
      mockGetPromotionById.mockRejectedValue(new Error('Unexpected'));
      const res = await request(app)
        .get('/getPromoById')
        .query({ id: '1' })
        .expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /addPromotion', () => {
    it('should create a promotion and return 201', async () => {
      mockCreatePromotion.mockResolvedValue({ id: 42 });

      const body = { nom: 'New Promo', effectifs: 20, id_cycle: '1', date_start: '2025-09-01', date_end: '2026-06-30' };
      const res = await request(app)
        .post('/addPromotion')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('insertedId', 42);
      expect(mockCreatePromotion).toHaveBeenCalledWith({
        nom: 'New Promo',
        effectifs: Number(body.effectifs),
        id_cycle: body.id_cycle,
        date_start: body.date_start,
        date_end: body.date_end,
      });
    });

    it('should return 400 when nom is missing', async () => {
      const body = { effectifs: 20 };
      const res = await request(app)
        .post('/addPromotion')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(mockCreatePromotion).not.toHaveBeenCalled();
    });

    it('should propagate service errors with status code', async () => {
      const err: any = new Error('Cycle invalide');
      err.statusCode = 400;
      mockCreatePromotion.mockRejectedValue(err);

      const body = { nom: 'Bad Promo', effectifs: 10 };
      const res = await request(app)
        .post('/addPromotion')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /updatePromotion', () => {
    it('should update a promotion and return success message', async () => {
      mockUpdatePromotion.mockResolvedValue(undefined);
      const body = { id: 1, nom: 'Updated', effectifs: 25 };
      const res = await request(app)
        .put('/updatePromotion')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(mockUpdatePromotion).toHaveBeenCalledWith(body);
    });

    it('should return 404 when promotion not found', async () => {
      const err: any = new Error('Promotion non trouvée');
      err.statusCode = 404;
      mockUpdatePromotion.mockRejectedValue(err);

      const body = { id: 999, nom: 'X' };
      const res = await request(app)
        .put('/updatePromotion')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /deletePromotion', () => {
    it('should delete a promotion and return success message', async () => {
      mockDeletePromotion.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/deletePromotion')
        .send({ id: '1' })
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(mockDeletePromotion).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deletion target not found', async () => {
      const err: any = new Error('Promotion non trouvée');
      err.statusCode = 404;
      mockDeletePromotion.mockRejectedValue(err);

      const res = await request(app)
        .delete('/deletePromotion')
        .send({ id: '999' })
        .set('Content-Type', 'application/json')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /getPromosData (legacy)', () => {
    it('should return legacy promos data', async () => {
      const legacy = { date_start: '2024-08-01', date_end: '2025-08-01', Promos: [] };
      mockGetLegacyPromos.mockResolvedValue(legacy);

      const res = await request(app).get('/getPromosData').expect(200);
      expect(res.body).toEqual(legacy);
      expect(mockGetLegacyPromos).toHaveBeenCalled();
    });
  });
});
