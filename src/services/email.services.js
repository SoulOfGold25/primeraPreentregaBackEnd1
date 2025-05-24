import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,       //  correo
    pass: process.env.GMAIL_PASS        // clave de aplicación
  }
});

const sendPurchaseEmail = async (to, ticket, purchasedProducts = [], noStock = []) => {
  const fecha = new Date(ticket.purchase_datetime).toLocaleString();

  const purchasedLines = purchasedProducts.map(p =>
    `• ${p.title} - $${p.price} x ${p.quantity} = $${(p.price * p.quantity).toFixed(2)}`
  ).join("\n");

  const noStockLines = noStock.length
    ? "\n⚠️ Productos sin stock:\n" + noStock.map(p =>
        `• ${p.title} (Stock actual: ${p.stock})`
      ).join("\n")
    : "";

  const plainText = `
Gracias por tu compra.

🧾 Código de ticket: ${ticket.code}
📅 Fecha: ${fecha}
💳 Total pagado: $${ticket.amount}

🛒 Productos comprados:
${purchasedLines}${noStockLines}

Saludos,
Tu ecommerce.
  `.trim();

  const mailOptions = {
    from: 'Tu ecommerce <' + process.env.GMAIL_USER + '>',
    to,
    subject: '🧾 Confirmación de compra - Ticket ' + ticket.code,
    text: plainText, // 📩 Texto plano alternativo
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p><strong>Código:</strong> ${ticket.code}</p>
      <p><strong>Total:</strong> $${ticket.amount}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>

      <h3>Productos comprados:</h3>
      <ul>
        ${purchasedProducts.map(p => `<li>${p.title} - $${p.price} x ${p.quantity}</li>`).join('')}
      </ul>

      ${noStock.length > 0 ? `
        <h3 style="color: red;">⚠️ Productos sin stock:</h3>
        <ul>
          ${noStock.map(p => `<li>${p.title} (Stock: ${p.stock})</li>`).join('')}
        </ul>
      ` : ''}
    `
  };

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 Correo generado:");
      console.log("Para:", to);
      console.log("Asunto:", mailOptions.subject);
      console.log("Texto plano:\n", plainText);
    }
    
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Correo enviado a ${to}`);
  } catch (err) {
    console.error('❌ Error al enviar correo:', err.message);
  }
};


export default sendPurchaseEmail;
