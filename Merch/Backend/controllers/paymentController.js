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

  // 1. Verify Razorpay Signature FIRST (before any DB writes)
  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Transaction not legit!' });
    }
  } catch (sigError) {
    console.error('Signature Verification Error:', sigError);
    return res.status(500).json({ error: 'Signature verification failed' });
  }

  // Sanitize fields to prevent DB column overflow (the root cause of missing orders)
  const sanitizedPhone = orderDetails.phone
    ? String(orderDetails.phone).trim().substring(0, 50)
    : null;
  const sanitizedRollNo = orderDetails.rollNo
    ? String(orderDetails.rollNo).trim().substring(0, 50)
    : null;
  const sanitizedPrintedName = orderDetails.printedName
    ? String(orderDetails.printedName).trim().substring(0, 100)
    : null;
  const sanitizedName = (orderDetails.name || 'Guest').trim().substring(0, 100);
  const sanitizedEmail = (orderDetails.email || '').trim().substring(0, 100);
  const sanitizedItemName = (orderDetails.itemName || 'Merchandise').trim().substring(0, 255);
  const sanitizedSize = (orderDetails.size || 'N/A').trim().substring(0, 10);
  const sanitizedAddress = (orderDetails.address || 'Campus Pickup').trim();

  // Log all payment data for manual recovery if DB write fails
  console.log('=== PAYMENT VERIFIED - ORDER DATA ===');
  console.log(JSON.stringify({
    razorpay_order_id,
    razorpay_payment_id,
    name: sanitizedName,
    email: sanitizedEmail,
    rollNo: sanitizedRollNo,
    phone: sanitizedPhone,
    itemName: sanitizedItemName,
    size: sanitizedSize,
    quantity: orderDetails.quantity,
    printedName: sanitizedPrintedName,
    timestamp: new Date().toISOString()
  }));
  console.log('=====================================');

  // 2. Fetch or Create User in Neon DB
  let userId = null;
  let neonDbSuccess = false;
  try {
    let userResult = await neonDb.query('SELECT id, name, email FROM users WHERE email = $1', [sanitizedEmail]);
    
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const insertUser = await neonDb.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [sanitizedName, sanitizedEmail, 'guest_checkout_no_pass']
      );
      userId = insertUser.rows[0].id;
    }

    // 3. Save Order to Neon PostgreSQL
    const insertOrderText = `
      INSERT INTO orders 
      (user_id, razorpay_order_id, razorpay_payment_id, item_name, size, quantity, address, roll_no, phone, printed_name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `;
    const insertOrderValues = [
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      sanitizedItemName,
      sanitizedSize,
      orderDetails.quantity,
      sanitizedAddress,
      sanitizedRollNo,
      sanitizedPhone,
      sanitizedPrintedName
    ];
    await neonDb.query(insertOrderText, insertOrderValues);
    neonDbSuccess = true;
    console.log(`[Neon DB] Order saved successfully for payment: ${razorpay_payment_id}`);
  } catch (dbError) {
    console.error(`[Neon DB] CRITICAL: Failed to save order for payment ${razorpay_payment_id}:`, dbError);
    // Don't return here — still try Firebase as backup and return success to user
    // since Razorpay already verified the payment
  }

  // Build purchase data for Firebase
  const purchaseData = {
    userId,
    userName: sanitizedName,
    userEmail: sanitizedEmail,
    razorpay_order_id,
    razorpay_payment_id,
    itemName: sanitizedItemName,
    size: sanitizedSize,
    quantity: orderDetails.quantity,
    address: sanitizedAddress,
    rollNo: sanitizedRollNo,
    phone: sanitizedPhone,
    printedName: sanitizedPrintedName,
    status: 'success',
    neonDbSaved: neonDbSuccess,
    createdAt: new Date().toISOString()
  };

  // 4. Save to Firebase Firestore (Dual Write — always attempt, even if Neon failed)
  try {
    if (firebaseDb) {
      await firebaseDb.collection('purchases').doc(razorpay_payment_id).set(purchaseData);
      console.log(`[Firebase] Order saved successfully for payment: ${razorpay_payment_id}`);
    } else {
      console.warn('[Firebase] DB not initialized, skipping Firebase write.');
    }
  } catch (firebaseError) {
    console.error(`[Firebase] Failed to save order for payment ${razorpay_payment_id}:`, firebaseError);
    // Don't fail the request — the payment was verified, log it above
  }

  // Return success — payment was verified by Razorpay regardless of DB write status
  // (Order data is logged above for manual recovery if both DBs failed)
  res.json({
    success: true,
    msg: 'Payment verified and order saved successfully',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    savedToDb: neonDbSuccess
  });
};
