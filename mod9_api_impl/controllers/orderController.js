const defineOrder = require('../data/OrderModel');
const sequelize = require('../data/database');
const Order = defineOrder(sequelize);
sequelize.sync();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const block_time = 0;

const addFormats = require('ajv-formats');
const Ajv = require('ajv');
const ajv = new Ajv();
addFormats(ajv);
const schema = {
    type: 'object',
    required: ['orderDate', 'orderPrice', 'orderStatus', 'customerAcct'],
    properties: {
        orderDate:    {type: 'string', format: "date"},
        orderPrice:   {type: 'number', minimum: 0.0},
        orderStatus:  {type: 'string', enum: ["PENDING", "SHIPPED"]},
        customerAcct: {type: 'string', "minLength": 6, "maxLength": 6, "pattern": "^[0-9]+$"}
    }
}
const validate = ajv.compile(schema);

const postOrder = async (req, res) => {
    try {
        await wait(block_time);
        const valid = validate(req.body);
        if (!valid) {
            return res.status(422).json({message: 'Invalid Input'});
        }
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error creating order', error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        await wait(block_time);
        const orders = await Order.findAll();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error: error.message });
    }
};

const getOrderByID = async (req, res) => {
    try {
        await wait(block_time);
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error: error.message });
    }
};

const updateOrderByID = async (req, res) => {
    try {
        await wait(block_time);
        const valid = validate(req.body);
        if (!valid) {
            return res.status(422).json({message: 'Invalid Input'});
        }
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }
        await order.update(req.body);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        await wait(block_time);
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }
        await order.destroy();
        res.status(204).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error: error.message });
    }
};

module.exports = { postOrder, getOrders, getOrderByID, updateOrderByID, deleteOrder };
