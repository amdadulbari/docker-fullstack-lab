// product.model.js - Mongoose schema and model for a Product document
// A Mongoose model wraps a MongoDB collection and lets us interact with
// documents using JavaScript objects instead of raw MongoDB queries.

const mongoose = require('mongoose');

/**
 * productSchema - Defines the shape and validation rules for a Product document.
 *
 * { timestamps: true } tells Mongoose to automatically add and manage
 * two fields on every document:
 *   - createdAt: set once when the document is first inserted
 *   - updatedAt: updated every time the document is saved/updated
 */
const productSchema = new mongoose.Schema(
  {
    // name - The display name of the product.
    // trim removes leading/trailing whitespace before saving.
    // maxlength prevents excessively long names.
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },

    // description - An optional longer description of the product.
    // Defaults to an empty string so the field is always present in responses.
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // price - The cost of the product in the base currency unit (e.g., USD).
    // min: 0 prevents negative prices at the database validation layer.
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // category - Constrains the product to one of the allowed categories.
    // The enum validator rejects any value not in the list at save time.
    category: {
      type: String,
      trim: true,
      enum: {
        values: ['electronics', 'clothing', 'books', 'food', 'other'],
        message: '{VALUE} is not a supported category',
      },
      default: 'other',
    },

    // inStock - A simple boolean flag indicating availability.
    // Defaults to true so new products are available immediately.
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    // timestamps: true instructs Mongoose to automatically manage
    // createdAt and updatedAt fields — no manual date handling needed.
    timestamps: true,
  }
);

// Create and export the Mongoose model.
// 'Product' becomes the collection name 'products' in MongoDB (lowercased + pluralized).
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
