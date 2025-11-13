const PDFDocument = require('pdfkit');

// @desc    Generate PDF receipt (Term Test Lab - 10pts)
exports.generatePDFReceipt = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('FURNITURE STORE', { align: 'center' })
        .fontSize(10)
        .text('Order Receipt', { align: 'center' })
        .moveDown();

      // Order Info
      doc
        .fontSize(12)
        .text(`Order ID: ${order._id}`, { continued: false })
        .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
        .text(`Status: ${order.status}`)
        .moveDown();

      // Shipping Address
      doc
        .fontSize(14)
        .text('Shipping Address:', { underline: true })
        .fontSize(10)
        .text(order.shippingAddress.street)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`)
        .text(order.shippingAddress.country)
        .moveDown();

      // Table Header
      doc
        .fontSize(12)
        .text('Order Items:', { underline: true })
        .moveDown(0.5);

      // Table
      const tableTop = doc.y;
      const itemX = 50;
      const qtyX = 300;
      const priceX = 370;
      const totalX = 450;

      doc
        .fontSize(10)
        .text('Item', itemX, tableTop, { bold: true })
        .text('Qty', qtyX, tableTop)
        .text('Price', priceX, tableTop)
        .text('Total', totalX, tableTop);

      doc
        .moveTo(itemX, tableTop + 15)
        .lineTo(520, tableTop + 15)
        .stroke();

      let y = tableTop + 25;

      // Order Items
      order.orderItems.forEach((item) => {
        const itemTotal = item.price * item.quantity;

        doc
          .fontSize(9)
          .text(item.name, itemX, y, { width: 230 })
          .text(item.quantity.toString(), qtyX, y)
          .text(`$${item.price.toFixed(2)}`, priceX, y)
          .text(`$${itemTotal.toFixed(2)}`, totalX, y);

        y += 25;
      });

      // Line before totals
      doc
        .moveTo(itemX, y)
        .lineTo(520, y)
        .stroke();

      y += 10;

      // Subtotal, Tax, Shipping
      const subtotal = order.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      doc
        .fontSize(10)
        .text('Subtotal:', priceX, y)
        .text(`$${subtotal.toFixed(2)}`, totalX, y);

      y += 20;

      doc
        .text('Tax:', priceX, y)
        .text(`$${order.taxPrice.toFixed(2)}`, totalX, y);

      y += 20;

      doc
        .text('Shipping:', priceX, y)
        .text(`$${order.shippingPrice.toFixed(2)}`, totalX, y);

      y += 20;

      // Grand Total
      doc
        .fontSize(12)
        .text('Grand Total:', priceX, y, { bold: true })
        .text(`$${order.totalPrice.toFixed(2)}`, totalX, y);

      // Footer
      doc
        .moveDown(3)
        .fontSize(8)
        .text('Thank you for your purchase!', { align: 'center' })
        .text('For questions, contact support@furniturestore.com', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
