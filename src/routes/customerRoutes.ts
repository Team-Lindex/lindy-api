import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  searchCustomers,
} from '../controllers/customerController';

const router = express.Router();

// GET /api/customers - Get all customers
router.get('/', getAllCustomers);

// GET /api/customers/search?name=value - Search customers by name
router.get('/search', searchCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', getCustomerById);

export default router;
