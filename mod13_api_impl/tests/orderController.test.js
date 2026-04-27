jest.mock('../data/OrderModel', () => jest.fn());
jest.mock('../data/database', () => ({
  sync: jest.fn(),
}));

const defineOrder = require('../data/OrderModel');

const mockOrderModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

defineOrder.mockReturnValue(mockOrderModel);

const { postOrder, getOrders, getOrderByID, updateOrderByID, deleteOrder } = require('../controllers/orderController');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const validOrder = {
  orderDate: '2024-01-01',
  orderPrice: 100,
  orderStatus: 'PENDING',
  customerAcct: '123456'
};

describe('Order Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postOrder', () => {

    it('creates order with valid input (201)', async () => {
        const req = { body: validOrder };
        const res = mockResponse();
        mockOrderModel.create.mockResolvedValue(validOrder);
        await postOrder(req, res);

        expect(mockOrderModel.create).toHaveBeenCalledWith(validOrder);
        expect(res.status.mock.calls[0][0]).toBe(201);
        expect(res.json.mock.calls[0][0]).toEqual(validOrder);
    });

    it('returns 422 for invalid input (bad types)', async () => {
        const req = {
            body: {
            orderDate: 'not-a-date',
            orderPrice: -10,
            orderStatus: 'INVALID',
            customerAcct: 'abc'
            }
        };
        const res = mockResponse();
        await postOrder(req, res);
        expect(res.status.mock.calls[0][0]).toBe(422);
        expect(mockOrderModel.create).not.toHaveBeenCalled();
    });

    it('accepts boundary values (price = 0)', async () => {
        const req = {
            body: { ...validOrder, orderPrice: 0 }
        };
        const res = mockResponse();
        mockOrderModel.create.mockResolvedValue(req.body);

        await postOrder(req, res);
        expect(res.status.mock.calls[0][0]).toBe(201);
    });

    it('handles DB error (400)', async () => {
        const req = { body: validOrder };
        const res = mockResponse();

        mockOrderModel.create.mockRejectedValue(new Error('DB fail'));

        await postOrder(req, res);

        expect(res.status.mock.calls[0][0]).toBe(400);
    });

    it('accepts customerAcct at exact length boundary (6)', async () => {
        const req = {
            body: { ...validOrder, customerAcct: '999999' }
        };
        const res = mockResponse();
        mockOrderModel.create.mockResolvedValue(req.body);

        await postOrder(req, res);
        expect(res.status.mock.calls[0][0]).toBe(201);
    });

    it('returns 422 for empty body', async () => {
        const req = { body: {} };
        const res = mockResponse();

        await postOrder(req, res);
        expect(res.status.mock.calls[0][0]).toBe(422);
    });

    it('returns 422 and does NOT call DB', async () => {
        const req = { body: { bad: 'data' } };
        const res = mockResponse();

        await postOrder(req, res);
        expect(res.status.mock.calls[0][0]).toBe(422);
        expect(mockOrderModel.create).not.toHaveBeenCalled();
    });

  });

  describe('getOrders', () => {

    it('returns all orders (200)', async () => {
        const res = mockResponse();
        const orders = [validOrder];
        mockOrderModel.findAll.mockResolvedValue(orders);

        await getOrders({}, res);
        expect(mockOrderModel.findAll).toHaveBeenCalledTimes(1);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0]).toContain(validOrder);
    });

    it('handles DB error (500)', async () => {
        const res = mockResponse();
        mockOrderModel.findAll.mockRejectedValue(new Error('fail'));

        await getOrders({}, res);
        expect(res.json.mock.calls[0][0].message).toContain('Error');
    });

  });

  describe('getOrderByID', () => {

    it('returns order if found (200)', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        mockOrderModel.findByPk.mockResolvedValue(validOrder);

        await getOrderByID(req, res);
        expect(mockOrderModel.findByPk).toHaveBeenCalledWith(1);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0]).toEqual(validOrder);
    });

    it('returns 404 if not found', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        mockOrderModel.findByPk.mockResolvedValue(null);

        await getOrderByID(req, res);
        expect(res.status.mock.calls[0][0]).toBe(404);
    });

    it('handles DB error (500)', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        mockOrderModel.findByPk.mockRejectedValue(new Error('fail'));

        await getOrderByID(req, res);
        expect(res.json.mock.calls[0][0].message).toContain('Error');
    });

  });

  describe('updateOrderByID', () => {

    it('updates order (200)', async () => {
        const req = { params: { id: 1 }, body: validOrder };
        const res = mockResponse();
        const mockOrder = {
            update: jest.fn().mockResolvedValue(true)
        };
        mockOrderModel.findByPk.mockResolvedValue(mockOrder);

        await updateOrderByID(req, res);
        expect(mockOrderModel.findByPk).toHaveBeenCalledWith(1);
        expect(mockOrder.update).toHaveBeenCalledWith(validOrder);
        expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('returns 422 for invalid input', async () => {
        const req = {
            params: { id: 1 },
            body: { orderPrice: -5 }
        };
        const res = mockResponse();

        await updateOrderByID(req, res);
        expect(res.status.mock.calls[0][0]).toBe(422);
    });

    it('returns 404 if order not found', async () => {
        const req = { params: { id: 1 }, body: validOrder };
        const res = mockResponse();
        mockOrderModel.findByPk.mockResolvedValue(null);

        await updateOrderByID(req, res);
        expect(res.status.mock.calls[0][0]).toBe(404);
    });

    it('handles DB error (500)', async () => {
        const req = { params: { id: 1 }, body: validOrder };
        const res = mockResponse();
        mockOrderModel.findByPk.mockRejectedValue(new Error('fail'));

        await updateOrderByID(req, res);
        expect(res.json.mock.calls[0][0].message).toContain('Error');
    });

    it('updates order correctly', async () => {
        const req = { params: { id: 1 }, body: validOrder };
        const res = mockResponse();
        const mockOrder = {
            update: jest.fn().mockResolvedValue(true)
        };
        mockOrderModel.findByPk.mockResolvedValue(mockOrder);

        await updateOrderByID(req, res);
        expect(mockOrderModel.findByPk).toHaveBeenCalledWith(1);
        expect(mockOrder.update).toHaveBeenCalledWith(validOrder);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0]).toEqual(mockOrder);
    });

  });

  describe('deleteOrder', () => {

    it('deletes order (204)', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        const mockOrder = {
            destroy: jest.fn().mockResolvedValue(true)
        };
        mockOrderModel.findByPk.mockResolvedValue(mockOrder);

        await deleteOrder(req, res);
        expect(mockOrderModel.findByPk).toHaveBeenCalledWith(1);
        expect(mockOrder.destroy).toHaveBeenCalled();
        expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('returns 404 if not found', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        mockOrderModel.findByPk.mockResolvedValue(null);

        await deleteOrder(req, res);
        expect(res.status.mock.calls[0][0]).toBe(404);
    });

    it('handles DB error (500)', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        mockOrderModel.findByPk.mockRejectedValue(new Error('fail'));

        await deleteOrder(req, res);
        expect(res.json.mock.calls[0][0].message).toContain('Error');
    });

  });

});
