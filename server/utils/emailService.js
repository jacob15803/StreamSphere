const nodemailer = require("nodemailer");

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

// Send OTP Email
const sendOTPEmail = async (email, otp, isNewUser = false) => {
  try {
    const transporter = createTransporter();

    const subject = isNewUser
      ? "Welcome! Your OTP for Registration"
      : "Your OTP for Login";
    const message = isNewUser
      ? `Welcome! Your OTP for completing registration is: ${otp}. This OTP is valid for 10 minutes.`
      : `Your OTP for login is: ${otp}. This OTP is valid for 10 minutes.`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: white; border-radius: 5px; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .warning { color: #d32f2f; font-size: 14px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isNewUser ? "Welcome!" : "Login Verification"}</h1>
            </div>
            <div class="content">
              <p>${isNewUser ? "Thank you for signing up!" : "Hello!"}</p>
              <p>${message}</p>
              <div class="otp">${otp}</div>
              <p class="warning">⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.</p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Your Media App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Send Welcome Email after successful registration
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Welcome to Our Media Platform!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, ${name}! 🎉</h1>
            </div>
            <div class="content">
              <p>Thank you for joining our media platform!</p>
              <p>You now have access to thousands of movies and series. Start exploring and add your favorites to your wishlist!</p>
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Browse our extensive library of movies and series</li>
                <li>Create your personalized wishlist</li>
                <li>Track your watch history</li>
                <li>Get personalized recommendations</li>
              </ul>
              <p>Happy watching!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Media App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent: " + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
