const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

// Order confirmation email template (Term Test Lab requirement)
exports.sendOrderConfirmation = async (order, user) => {
  const itemsList = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B4513;">Order Confirmation</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for your order! Here are the details:</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
        <strong>Order ID:</strong> ${order._id}<br>
        <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
        <strong>Status:</strong> ${order.status}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #8B4513; color: white;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div style="text-align: right; margin: 20px 0;">
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>Tax:</strong> $${order.taxPrice.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${order.shippingPrice.toFixed(2)}</p>
        <h3 style="color: #8B4513;"><strong>Grand Total:</strong> $${order.totalPrice.toFixed(2)}</h3>
      </div>

      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
        <strong>Shipping Address:</strong><br>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
        ${order.shippingAddress.country}
      </div>

      <p>We'll send you another email when your order ships.</p>
      <p>Thank you for shopping with Furniture Store!</p>
    </div>
  `;

  await exports.sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order._id}`,
    html: html,
  });
};

// Order status update email (Term Test Lab requirement)
// Order status update email with PDF attachment (Term Test Lab requirement)
exports.sendOrderStatusUpdate = async (order, user, pdfBuffer) => {
  const statusMessages = {
    Processing: 'Your order is being processed.',
    Shipped: 'Your order has been shipped!',
    Delivered: 'Your order has been delivered.',
    Cancelled: 'Your order has been cancelled.',
  };

  const itemsList = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B4513;">Order Status Update</h2>
      <p>Hi ${user.name},</p>
      <p>${statusMessages[order.status] || 'Your order status has been updated.'}</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
        <strong>Order ID:</strong> ${order._id}<br>
        <strong>Status:</strong> <span style="color: #8B4513; font-weight: bold;">${order.status}</span><br>
        ${order.trackingNumber ? `<strong>Tracking Number:</strong> ${order.trackingNumber}<br>` : ''}
      </div>

      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #8B4513; color: white;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div style="text-align: right; margin: 20px 0;">
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>Tax:</strong> $${order.taxPrice.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${order.shippingPrice.toFixed(2)}</p>
        <h3 style="color: #8B4513;"><strong>Grand Total:</strong> $${order.totalPrice.toFixed(2)}</h3>
      </div>

      <p>Please see the attached PDF receipt for complete details.</p>
      <p>Thank you for shopping with Furniture Store!</p>
    </div>
  `;

  const attachments = pdfBuffer
    ? [
        {
          filename: `receipt-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    : [];

  await exports.sendEmail({
    to: user.email,
    subject: `Order Update - #${order._id}`,
    html: html,
    attachments: attachments,
  });
};
