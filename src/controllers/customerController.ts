import { Request, Response } from 'express';
import Customer from '../models/Customer';

// Get all customers
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find();
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get single customer by ID
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(req.params.id);
    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Search customers by name
export const searchCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;
    
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Please provide a name to search',
      });
      return;
    }

    const customers = await Customer.find({
      $or: [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
