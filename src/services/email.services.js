import transporter from '../config/mailer.js';

export async function sendPurchaseEmail(to, ticket) {
  const mailOptions = {
    from: `"Ecommerce App" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🎟️ Ticket de compra ${ticket.code}`,
    html: `
      <h2>Gracias por tu compra 🎉</h2>
      <p><strong>Código:</strong> ${ticket.code}</p>
      <p><strong>Total:</strong> $${ticket.amount}</p>
      <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado a", to);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
}
