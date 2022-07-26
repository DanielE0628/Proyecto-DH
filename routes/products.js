const express = require('express');
const productsController = require("../controllers/products");
const router = express.Router();

router.get('/productos', productsController.productos); 
router.get('/detalle-productos', productsController.detallesProductos); 
//detalle prodcutos
router.get('/products/detalle/:id', productsController.function); 
//Crear-prodcutos
router.get('/products/crear', productsController.function); 




module.exports = router;