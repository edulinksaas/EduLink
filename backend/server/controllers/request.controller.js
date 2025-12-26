import crypto from 'crypto';
import { Request } from '../models/Request.js';

export const getRequests = async (req, res, next) => {
  try {
    const requests = await Request.findAll();
    res.json({ requests, total: requests.length });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await request.update({ status: 'approved' });
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await request.update({ status: 'rejected' });
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const processAbsence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await request.update({ status: 'processed' });
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const processSupplementary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await request.update({ status: 'processed' });
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const processChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await request.update({ status: 'processed' });
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const processDefer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await request.update({ status: 'processed' });
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

