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

const sendPurchaseEmail = async (to, ticket) => {
  const mailOptions = {
    from: 'Tu ecommerce <' + process.env.GMAIL_USER + '>',
    to,
    subject: '🧾 Confirmación de compra - Ticket ' + ticket.code,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p><strong>Código:</strong> ${ticket.code}</p>
      <p><strong>Total:</strong> $${ticket.amount}</p>
      <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Correo enviado a ${to}`);
  } catch (err) {
    console.error('❌ Error al enviar correo:', err.message);
  }
};

export default sendPurchaseEmail;
