const express = require('express');
const router = express.Router();
const { postOrder, getOrders, getOrderByID, updateOrderByID, deleteOrder } = require('../controllers/orderController');

router.post('/', postOrder);
router.get('/', getOrders);
router.get('/:id', getOrderByID);
router.patch('/:id', updateOrderByID);
router.delete('/:id', deleteOrder);

module.exports = router;
