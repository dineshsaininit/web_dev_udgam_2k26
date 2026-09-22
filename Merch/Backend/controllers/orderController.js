const neonDb = require('../config/neonDb');

exports.getOrders = async (req, res) => {
  try {
    // Fetch orders joined with users to get the email/name from the users table, and also include roll_no, phone, printed_name
    const fetchOrdersQuery = `
      SELECT 
        o.id,
        o.razorpay_order_id,
        o.item_name,
        o.size,
        o.quantity,
        o.address,
        o.roll_no,
        o.phone,
        o.printed_name,
        o.status,
        o.created_at,
        u.name as student_name,
        u.email as student_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;

    const result = await neonDb.query(fetchOrdersQuery);
    
    // Format them for the frontend
    const formattedOrders = result.rows.map(row => ({
      id: `ORD-${row.id}`, // formatting it nicely for UI
      rawId: row.id,
      razorpay_order_id: row.razorpay_order_id,
      student: row.student_name,
      email: row.student_email,
      rollNo: row.roll_no || 'N/A',
      phone: row.phone || 'N/A',
      item: row.item_name,
      size: row.size,
      qty: row.quantity,
      address: row.address,
      printedName: row.printed_name,
      status: row.status === 'success' ? 'Ready for Pickup' : 'Pending',
      time: new Date(row.created_at).toLocaleString()
    }));

    res.status(200).json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
};
