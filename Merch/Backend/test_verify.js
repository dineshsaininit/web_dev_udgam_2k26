const crypto = require('crypto');

const secret = 'UzIA5Lwmrl8RJPSPMkXT8nlx';
const orderId = 'order_test123';
const paymentId = 'pay_test123';

const shasum = crypto.createHmac('sha256', secret);
shasum.update(`${orderId}|${paymentId}`);
const digest = shasum.digest('hex');

const payload = {
  razorpay_order_id: orderId,
  razorpay_payment_id: paymentId,
  razorpay_signature: digest,
  orderDetails: {
    itemName: 'Test Hoodie',
    size: 'L',
    quantity: 1,
    address: 'Campus Pick-up',
    email: 'test@student.com',
    name: 'Test Student',
    rollNo: '23CS100',
    phone: '1234567890',
    printedName: 'Tester'
  }
};

fetch('http://localhost:5000/api/payments/verify-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(async r => {
  console.log('Status:', r.status);
  const text = await r.text();
  console.log('Body:', text);
})
.catch(console.error);
