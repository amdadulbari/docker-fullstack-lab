// product.routes.js - Route definitions for the Products resource
// This file is intentionally thin: it only maps HTTP methods + paths to
// controller functions. All business logic lives in the controller.
// This separation makes the codebase easy to navigate and maintain.

const { Router } = require('express');
const {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const router = Router();

// ---------------------------------------------------------------------------
// Collection routes — operate on the /products collection as a whole
// ---------------------------------------------------------------------------

// GET  /api/v1/products         → list all products (supports ?category= filter)
// POST /api/v1/products         → create a new product
router.route('/products')
  .get(listProducts)
  .post(createProduct);

// ---------------------------------------------------------------------------
// Resource routes — operate on a single product identified by :id
// ---------------------------------------------------------------------------

// GET    /api/v1/products/:id   → fetch one product
// PUT    /api/v1/products/:id   → replace/update one product
// DELETE /api/v1/products/:id   → remove one product
router.route('/products/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
