const { DataTypes } = require('sequelize');

const OrderModel = {
  orderId:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderDate:    { type: DataTypes.STRING,  allowNull: false },
  orderPrice:   { type: DataTypes.REAL,    allowNull: false },
  orderStatus:  { type: DataTypes.STRING,  allowNull: false },
  customerAcct: { type: DataTypes.STRING,  allowNull: false },
};

module.exports = (sequelize) => sequelize.define('order', OrderModel);
