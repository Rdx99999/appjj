import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, Product, User } from './types';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  credentials: true,
}));

app.get('/', (c) => c.json({ message: 'E-commerce API v1', version: '1.0.0' }));

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Register new seller
app.post('/auth/register', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  
  try {
    // Check if email already exists
    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(body.email)
      .first();
    
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    await c.env.DB.prepare(
      'INSERT INTO users (id, name, email, role, gst_no, shop_name, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id, 
      body.name, 
      body.email, 
      'seller', 
      body.gstNo || null, 
      body.shopName, 
      body.address, 
      'pending'
    ).run();
    
    return c.json({ id, message: 'Registration successful. Please upload KYC documents.' });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Login (simplified - in production use proper auth)
app.post('/auth/login', async (c) => {
  const body = await c.req.json();
  
  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(body.email)
      .first() as User | null;
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // In production, verify password hash here
    return c.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        shop_name: user.shop_name,
        gst_no: user.gst_no
      },
      token: 'simple-token-' + user.id // Simplified token
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get user by ID
app.get('/auth/user/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first() as User | null;
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(user);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// ============================================
// KYC DOCUMENTS ENDPOINTS
// ============================================

// Upload KYC document
app.post('/kyc/upload', async (c) => {
  const formData = await c.req.formData();
  const userId = formData.get('userId') as string;
  const documentType = formData.get('documentType') as string;
  const file = formData.get('file') as File;
  
  if (!userId || !documentType || !file) {
    return c.json({ error: 'Missing required fields' }, 400);
  }
  
  try {
    // Upload file to R2
    const fileName = `kyc/${userId}/${documentType}-${Date.now()}-${file.name}`;
    await c.env.R2.put(fileName, file);
    
    // Get public URL (in production, configure R2 with custom domain)
    const documentUrl = `https://ecommerce-storage.r2.dev/${fileName}`;
    
    // Save to database
    const docId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO kyc_documents (id, user_id, document_type, document_url, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(docId, userId, documentType, documentUrl, 'pending').run();
    
    return c.json({ id: docId, documentUrl, message: 'Document uploaded successfully' });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get KYC documents for a user
app.get('/kyc/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM kyc_documents WHERE user_id = ?'
    ).bind(userId).all();
    
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get all pending KYC documents (admin)
app.get('/kyc/pending', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT kd.*, u.name, u.email, u.shop_name 
      FROM kyc_documents kd 
      JOIN users u ON kd.user_id = u.id 
      WHERE kd.status = 'pending'
    `).all();
    
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Approve/Reject KYC document
app.post('/kyc/verify', async (c) => {
  const { documentId, status, rejectionReason } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'UPDATE kyc_documents SET status = ? WHERE id = ?'
    ).bind(status, documentId).run();
    
    // If rejecting, add rejection reason
    if (status === 'rejected' && rejectionReason) {
      await c.env.DB.prepare(
        'UPDATE kyc_documents SET document_url = document_url || ? WHERE id = ?'
      ).bind(`|rejection:${rejectionReason}`, documentId).run();
    }
    
    // Check if all documents for user are approved
    const doc = await c.env.DB.prepare('SELECT user_id FROM kyc_documents WHERE id = ?')
      .bind(documentId)
      .first();
    
    if (doc) {
      const { results } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM kyc_documents WHERE user_id = ? AND status = "approved"'
      ).bind(doc.user_id).all();
      
      const { results: totalDocs } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM kyc_documents WHERE user_id = ?'
      ).bind(doc.user_id).all();
      
      // If all documents approved, verify user
      const approvedCount = (results[0] as { count: number })?.count || 0;
      const totalCount = (totalDocs[0] as { count: number })?.count || 0;
      if (approvedCount === totalCount && totalCount > 0) {
        await c.env.DB.prepare(
          'UPDATE users SET status = "verified" WHERE id = ?'
        ).bind(doc.user_id).run();
      }
    }
    
    return c.json({ success: true, message: `Document ${status}` });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// ============================================
// CATEGORIES ENDPOINTS
// ============================================

// Get all categories
app.get('/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM categories ORDER BY name').all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get category by ID
app.get('/categories/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const category = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
      .bind(id)
      .first();
    
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    return c.json(category);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Create category (admin)
app.post('/categories', async (c) => {
  const { name, image_url } = await c.req.json();
  const id = crypto.randomUUID();
  
  try {
    await c.env.DB.prepare(
      'INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)'
    ).bind(id, name, image_url).run();
    
    return c.json({ id, name, image_url });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Update category (admin)
app.put('/categories/:id', async (c) => {
  const id = c.req.param('id');
  const { name, image_url } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'UPDATE categories SET name = ?, image_url = ? WHERE id = ?'
    ).bind(name, image_url, id).run();
    
    return c.json({ id, name, image_url });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Delete category (admin)
app.delete('/categories/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// ============================================
// PRODUCTS ENDPOINTS
// ============================================

// Get all products
app.get('/products', async (c) => {
  const categoryId = c.req.query('categoryId');
  const sellerId = c.req.query('sellerId');
  
  try {
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    let params: any[] = [];
    let conditions: string[] = [];
    
    if (categoryId) {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
    }
    
    if (sellerId) {
      conditions.push('p.seller_id = ?');
      params.push(sellerId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get product by ID
app.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
      .bind(id)
      .first();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json(product);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Create product (admin)
app.post('/products', async (c) => {
  const p = await c.req.json();
  const id = crypto.randomUUID();
  
  try {
    await c.env.DB.prepare(
      'INSERT INTO products (id, category_id, name, description, price, unit, image_url, stock, discount, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id, 
      p.categoryId, 
      p.name, 
      p.description, 
      p.price, 
      p.unit, 
      p.imageUrl, 
      p.stock, 
      p.discount,
      p.sellerId || null
    ).run();
    
    return c.json({ id, ...p });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Update product (admin)
app.put('/products/:id', async (c) => {
  const id = c.req.param('id');
  const p = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, unit = ?, image_url = ?, stock = ?, discount = ? WHERE id = ?'
    ).bind(
      p.categoryId, 
      p.name, 
      p.description, 
      p.price, 
      p.unit, 
      p.imageUrl, 
      p.stock, 
      p.discount,
      id
    ).run();
    
    return c.json({ id, ...p });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Delete product (admin)
app.delete('/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Upload product image
app.post('/products/upload-image', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }
  
  try {
    const fileName = `products/${Date.now()}-${file.name}`;
    await c.env.R2.put(fileName, file);
    
    const imageUrl = `https://ecommerce-storage.r2.dev/${fileName}`;
    
    return c.json({ imageUrl });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// ============================================
// ORDERS ENDPOINTS
// ============================================

// Get all orders
app.get('/orders', async (c) => {
  const userId = c.req.query('userId');
  const status = c.req.query('status');
  
  try {
    let query = 'SELECT o.*, u.name as user_name, u.shop_name FROM orders o JOIN users u ON o.user_id = u.id';
    let params: any[] = [];
    let conditions: string[] = [];
    
    if (userId) {
      conditions.push('o.user_id = ?');
      params.push(userId);
    }
    
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get order by ID with items
app.get('/orders/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?')
      .bind(id)
      .first();
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Get order items
    const { results: items } = await c.env.DB.prepare(`
      SELECT oi.*, p.name as product_name, p.image_url 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `).bind(id).all();
    
    return c.json({ ...order, items });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Create order
app.post('/orders', async (c) => {
  const { userId, items } = await c.req.json();
  const orderId = crypto.randomUUID();
  
  try {
    // Calculate total amount
    let totalAmount = 0;
    const productPromises = items.map(async (item: any) => {
      const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
        .bind(item.productId)
        .first() as Product | null;
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      
      const price = product.price * (1 - product.discount / 100);
      totalAmount += price * item.quantity;
      
      return { product, price };
    });
    
    const productResults = await Promise.all(productPromises);
    
    // Create order
    await c.env.DB.prepare(
      'INSERT INTO orders (id, user_id, total_amount, status) VALUES (?, ?, ?, ?)'
    ).bind(orderId, userId, totalAmount, 'pending').run();
    
    // Create order items and update stock
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { product, price } = productResults[i];
      
      const orderItemId = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)'
      ).bind(orderItemId, orderId, item.productId, item.quantity, price).run();
      
      // Update product stock
      await c.env.DB.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ?'
      ).bind(item.quantity, item.productId).run();
    }
    
    return c.json({ id: orderId, totalAmount, message: 'Order created successfully' });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Update order status (admin)
app.put('/orders/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'UPDATE orders SET status = ? WHERE id = ?'
    ).bind(status, id).run();
    
    return c.json({ success: true, message: `Order status updated to ${status}` });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all sellers
app.get('/admin/sellers', async (c) => {
  const status = c.req.query('status');
  
  try {
    let query = 'SELECT * FROM users WHERE role = "seller"';
    let params: any[] = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get pending sellers
app.get('/admin/pending-sellers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT u.*, 
        (SELECT COUNT(*) FROM kyc_documents WHERE user_id = u.id AND status = 'pending') as pending_docs,
        (SELECT COUNT(*) FROM kyc_documents WHERE user_id = u.id AND status = 'approved') as approved_docs
      FROM users u 
      WHERE u.role = 'seller' AND u.status = 'pending'
      ORDER BY u.created_at DESC
    `).all();
    
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Verify seller (admin)
app.post('/admin/verify-seller', async (c) => {
  const { userId, status, rejectionReason } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'UPDATE users SET status = ? WHERE id = ?'
    ).bind(status, userId).run();
    
    // If rejecting, update all pending documents
    if (status === 'rejected') {
      await c.env.DB.prepare(
        'UPDATE kyc_documents SET status = "rejected" WHERE user_id = ? AND status = "pending"'
      ).bind(userId).run();
    }
    
    return c.json({ success: true, message: `Seller ${status}` });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Get dashboard stats (admin)
app.get('/admin/dashboard', async (c) => {
  try {
    const [totalSellers, pendingSellers, totalProducts, totalOrders, pendingOrders] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = "seller"').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = "seller" AND status = "pending"').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM products').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "pending"').first(),
    ]);
    
    const totalRevenue = await c.env.DB.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"').first();
    
    return c.json({
      totalSellers: (totalSellers as { count: number })?.count || 0,
      pendingSellers: (pendingSellers as { count: number })?.count || 0,
      totalProducts: (totalProducts as { count: number })?.count || 0,
      totalOrders: (totalOrders as { count: number })?.count || 0,
      pendingOrders: (pendingOrders as { count: number })?.count || 0,
      totalRevenue: (totalRevenue as { total: number })?.total || 0,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

export default app;
