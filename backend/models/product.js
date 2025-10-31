const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Product = sequelize.define('Product', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  precio: { type: DataTypes.FLOAT, allowNull: false }
});

module.exports = Product;
