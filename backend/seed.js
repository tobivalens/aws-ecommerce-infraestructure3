require('dotenv').config();
const { sequelize } = require('./models');
const Product = require('./models/product');

const productos = [
  { nombre: "El Principito", descripcion: "Clásico de Antoine de Saint-Exupéry", precio: 35000, imagen: 'img/principito.jpeg'},
  { nombre: "Cien años de soledad", descripcion: "Gabriel García Márquez", precio: 58000, imagen: 'img/cienañosdesoledad.jpg' },
  { nombre: "Don Quijote de la Mancha", descripcion: "Miguel de Cervantes", precio: 42000, imagen: 'img/donquijote.jpg' },
  { nombre: "Rayuela", descripcion: "Julio Cortázar", precio: 39000, imagen: 'img/rayuela_JC.png' }
];

async function go(){
  try{
    await sequelize.sync({ force: true }); // fuerza recrear tablas
    await Product.bulkCreate(productos);
    console.log('Seed completado');
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
}

go();
