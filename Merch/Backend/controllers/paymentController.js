const Razorpay = require('razorpay');
const crypto = require('crypto');
const neonDb = require('../config/neonDb');
const { db: firebaseDb } = require('../config/firebaseDb');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  
  try {
    const options = {
      amount: amount * 100, // Razorpay amount is in paise
      currency,
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ error: 'Some error occurred generating order' });

    res.json(order);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderDetails // e.g., { itemName, size, quantity, address, email, name, rollNo, phone, printedName }
  } = req.body;

  try {
    // 1. Verify Razorpay Signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Transaction not legit!' });
    }

    // 2. Fetch User Details or Create User for Guest Checkout
    let userId;
    let userResult = await neonDb.query('SELECT id, name, email FROM users WHERE email = $1', [orderDetails.email]);
    
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      // Auto-create user
      const insertUser = await neonDb.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [orderDetails.name || 'Guest', orderDetails.email, 'guest_checkout_no_pass']
      );
      userId = insertUser.rows[0].id;
    }

    const purchaseData = {
      userId,
      userName: orderDetails.name || 'Guest',
      userEmail: orderDetails.email,
      razorpay_order_id,
      razorpay_payment_id,
      itemName: orderDetails.itemName,
      size: orderDetails.size,
      quantity: orderDetails.quantity,
      address: orderDetails.address,
      rollNo: orderDetails.rollNo || null,
      phone: orderDetails.phone || null,
      printedName: orderDetails.printedName || null,
      status: 'success',
      createdAt: new Date().toISOString()
    };

    // 3. Save to Neon PostgreSQL
    const insertOrderText = `
      INSERT INTO orders 
      (user_id, razorpay_order_id, razorpay_payment_id, item_name, size, quantity, address, roll_no, phone, printed_name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `;
    const insertOrderValues = [
      userId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      orderDetails.itemName, 
      orderDetails.size, 
      orderDetails.quantity, 
      orderDetails.address,
      orderDetails.rollNo || null,
      orderDetails.phone || null,
      orderDetails.printedName || null
    ];
    await neonDb.query(insertOrderText, insertOrderValues);

    // 4. Save to Firebase Firestore (Dual Write for zero data loss)
    if (firebaseDb) {
      await firebaseDb.collection('purchases').doc(razorpay_payment_id).set(purchaseData);
    } else {
      console.warn("Firebase DB not initialized, skipping Firebase write.");
    }

    res.json({
      success: true,
      msg: 'Payment verified and order saved successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Server error during payment verification' });
  }
};
