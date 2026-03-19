const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("CRITICAL ERROR: Supabase credentials are missing! Check your .env file or Vercel environment variables.");
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// Security Credentials for Admin Login
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_USER || !ADMIN_PASS) {
  console.warn("WARNING: Admin credentials are not set. Admin login will fail.");
}

// Middleware
app.use(helmet()); 

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 attempts
  message: { error: 'Too many login attempts, please try again after an hour' }
});

app.use('/products', generalLimiter);
app.use('/login', adminLimiter);
app.use('/upload', adminLimiter);

app.use(cors());
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, token: "session_token_12345" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Multer in-memory storage for Vercel serverless functions
const upload = multer({ storage: multer.memoryStorage() });

// API Routes
app.get('/products', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get('/products/removed', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    const { name, price, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Basic Validation
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Invalid price. Must be a positive number.' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      throw uploadError;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // 3. Save to Supabase DB
    const { data: dbData, error: dbError } = await supabase
      .from('products')
      .insert([
        { 
          name: name.trim(), 
          price: priceNum, 
          category: category.trim(), 
          image: publicUrl, 
          description: req.body.description ? req.body.description.trim() : null 
        }
      ])
      .select();

    if (dbError) {
      console.error('Supabase DB Error:', dbError);
      throw dbError;
    }
    res.json({ message: 'Product uploaded successfully!', product: dbData[0] });
  } catch (err) {
    console.error('Upload Process Caught Error:', err);
    next(err);
  }
});

app.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Product moved to Removed section' });
  } catch (err) {
    next(err);
  }
});

app.post('/products/:id/restore', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Product restored successfully' });
  } catch (err) {
    next(err);
  }
});

app.post('/products/bulk-delete', async (req, res, next) => {
  try {
    const { ids, password } = req.body;
    
    if (password !== ADMIN_PASS) {
      return res.status(401).json({ error: 'Incorrect security password' });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }

    // Get products to find image paths for cleanup
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('image')
      .in('id', ids);

    if (fetchError) throw fetchError;

    // Cleanup storage
    for (const product of products) {
      if (product.image) {
        try {
          const url = new URL(product.image);
          const storageBucket = 'product-images';
          const searchStr = `/${storageBucket}/`;
          const index = url.pathname.indexOf(searchStr);
          
          if (index !== -1) {
            const filePath = url.pathname.substring(index + searchStr.length);
            await supabase.storage.from(storageBucket).remove([filePath]);
          }
        } catch (urlErr) {
          console.warn('Could not parse image URL for storage cleanup:', urlErr.message);
        }
      }
    }

    // Final permanent delete from DB
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (deleteError) throw deleteError;

    res.json({ message: `${ids.length} pieces permanently removed from archive` });
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// For Vercel Serverless Functions, we export the app
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}


