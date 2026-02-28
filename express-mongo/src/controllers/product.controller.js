// product.controller.js - Business logic for Product CRUD operations
// Controllers receive the parsed request, interact with the database via
// Mongoose models, and send back a structured JSON response.
// Keeping logic here (rather than in routes) makes each piece testable
// and the routes file stays clean and declarative.

const Product = require('../models/product.model');

// ---------------------------------------------------------------------------
// Helper: checks whether a Mongoose error is a CastError (invalid ObjectId).
// MongoDB ObjectIds are 24-character hex strings. When a route param like
// :id is something else (e.g. "abc"), Mongoose throws a CastError before
// it even hits the database. We respond with 400 Bad Request in that case.
// ---------------------------------------------------------------------------
const isCastError = (err) => err.name === 'CastError';

// ---------------------------------------------------------------------------
// listProducts - GET /api/v1/products
// Returns all products, with an optional ?category= query param filter.
// Example: GET /api/v1/products?category=electronics
// ---------------------------------------------------------------------------
const listProducts = async (req, res) => {
  try {
    // Build a filter object only when a category query param is provided
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Product.find(filter) returns all documents matching the filter.
    // An empty filter {} matches every document in the collection.
    const products = await Product.find(filter);

    // Include a count so clients don't need to measure the array length
    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching products' });
  }
};

// ---------------------------------------------------------------------------
// createProduct - POST /api/v1/products
// Creates a new product document from req.body.
// Mongoose runs schema validation before inserting the document.
// ---------------------------------------------------------------------------
const createProduct = async (req, res) => {
  try {
    // Product.create() is shorthand for new Product(data).save()
    const product = await Product.create(req.body);

    // 201 Created signals that a new resource was successfully created
    res.status(201).json(product);
  } catch (err) {
    // Mongoose ValidationError means the request body failed schema rules
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error while creating product' });
  }
};

// ---------------------------------------------------------------------------
// getProduct - GET /api/v1/products/:id
// Fetches a single product by its MongoDB ObjectId.
// Returns 404 when no document matches the given id.
// ---------------------------------------------------------------------------
const getProduct = async (req, res) => {
  try {
    // findById is a convenience wrapper around findOne({ _id: id })
    const product = await Product.findById(req.params.id);

    if (!product) {
      // Null means the id is valid but no document was found
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    if (isCastError(err)) {
      // The id string could not be cast to a valid ObjectId
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    res.status(500).json({ error: 'Server error while fetching product' });
  }
};

// ---------------------------------------------------------------------------
// updateProduct - PUT /api/v1/products/:id
// Replaces the specified fields on an existing product document.
// ---------------------------------------------------------------------------
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        // new: true returns the document AFTER the update is applied,
        // so the response reflects the final saved state.
        new: true,
        // runValidators: true re-runs the schema validators on the new
        // values, catching e.g. a negative price or invalid category.
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    if (isCastError(err)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error while updating product' });
  }
};

// ---------------------------------------------------------------------------
// deleteProduct - DELETE /api/v1/products/:id
// Removes the product document and confirms deletion with a message.
// ---------------------------------------------------------------------------
const deleteProduct = async (req, res) => {
  try {
    // findByIdAndDelete removes the document and returns the deleted doc
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 200 with a confirmation message (some APIs use 204 No Content instead)
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    if (isCastError(err)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    res.status(500).json({ error: 'Server error while deleting product' });
  }
};

module.exports = {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
