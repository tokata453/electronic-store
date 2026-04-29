// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eef0f2; border-radius: 12px; background-color: #ffffff;">
        
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f5;">
          <h1 style="color: #003d9b; margin: 0; font-size: 28px; letter-spacing: -0.5px;">i-Tech</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Premium Tech Curator</p>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #191c1d; margin-top: 0;">Order Confirmed!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 15px;">
            Thank you for shopping with us! We've received your order <strong>#${orderDetails.orderNumber}</strong> and are getting it ready to ship.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #eef0f2;">
            <h3 style="margin-top: 0; color: #191c1d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              ${orderDetails.items.map(item => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eef0f2; color: #333; font-size: 14px;">
                    ${item.productName} <span style="color: #888;">(x${item.quantity})</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eef0f2; text-align: right; font-weight: bold; color: #191c1d; font-size: 14px;">
                    $${parseFloat(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </table>
            
            <div style="margin-top: 20px; text-align: right; font-size: 18px; border-top: 2px solid #eef0f2; padding-top: 15px;">
              <span style="color: #666; font-size: 14px; margin-right: 10px;">Total Paid:</span>
              <strong><span style="color: #003d9b;">$${parseFloat(orderDetails.totalAmount).toFixed(2)}</span></strong>
            </div>
          </div>
          
          <p style="color: #888; font-size: 12px; text-align: center; line-height: 1.5; margin-top: 30px;">
            If you have any questions, reply to this email or contact <a href="mailto:support@itech.com" style="color: #003d9b; text-decoration: none;">support@itech.com</a>.
            <br/><br/>
            &copy; ${new Date().getFullYear()} I-TECH. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"i-Tech Store" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent: " + info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false; 
  }
};

module.exports = { sendOrderConfirmationEmail };