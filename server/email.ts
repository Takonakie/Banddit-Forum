import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Banddit Forum" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Verify Your Email Address for Banddit',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Banddit!</h2>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #ff4500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};