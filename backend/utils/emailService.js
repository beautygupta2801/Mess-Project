const nodemailer = require('nodemailer');

// Create transporter with Gmail
const createTransporter = () => {
  console.log(`Setting up email transporter for: ${process.env.EMAIL_USER}`);
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail app password
    },
    // Add timeout to prevent hanging
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, studentName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"NITJ Mess Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - NITJ Mess Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message {
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .token-box {
              background: linear-gradient(135deg, #dbeafe 0%, #d1fae5 100%);
              border: 2px dashed #2563eb;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .token-label {
              color: #1f2937;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
            }
            .token {
              font-size: 42px;
              font-weight: bold;
              color: #2563eb;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .expiry {
              color: #dc2626;
              font-size: 14px;
              margin-top: 15px;
              font-weight: 600;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 6px;
            }
            .warning-text {
              color: #92400e;
              font-size: 14px;
              margin: 0;
            }
            .footer {
              background-color: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              color: #6b7280;
              font-size: 13px;
              line-height: 1.6;
              margin: 5px 0;
            }
            .link {
              color: #2563eb;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello ${studentName || 'Student'},</p>
              
              <p class="message">
                We received a request to reset your password for your NITJ Mess Portal account. 
                Use the verification code below to reset your password.
              </p>
              
              <div class="token-box">
                <div class="token-label">Your Reset Code</div>
                <div class="token">${resetToken}</div>
                <div class="expiry">⏰ Expires in 10 minutes</div>
              </div>
              
              <div class="warning">
                <p class="warning-text">
                  <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, 
                  please ignore this email or contact support if you have concerns.
                </p>
              </div>
              
              <p class="message">
                This code will expire in <strong>10 minutes</strong> for your security. 
                If you didn't make this request, you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                <strong>NITJ Mess Management Portal</strong><br>
                Dr B R Ambedkar National Institute of Technology Jalandhar<br>
                Punjab - 144008, India
              </p>
              <p class="footer-text">
                Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" class="link">${process.env.EMAIL_USER}</a>
              </p>
              <p class="footer-text" style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${studentName || 'Student'},

We received a request to reset your password for your NITJ Mess Portal account.

Your Password Reset Code: ${resetToken}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
NITJ Mess Management Portal
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email (optional - for new registrations)
const sendWelcomeEmail = async (email, studentName, rollNo) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"NITJ Mess Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to NITJ Mess Portal! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 40px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to NITJ Mess Portal!</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1f2937;">Hello ${studentName}! 👋</p>
              <p style="color: #4b5563; line-height: 1.6;">
                Congratulations! Your account has been successfully created on the NITJ Mess Management Portal.
              </p>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #1f2937;"><strong>Name:</strong> ${studentName}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Roll Number:</strong> ${rollNo}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Email:</strong> ${email}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.6;">
                You can now access your dashboard, view meal history, apply for mess-off, and provide feedback.
              </p>
              <div style="text-align: center;">
                <a href="http://localhost:3000" class="button">Go to Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>NITJ Mess Management Portal</strong><br>Dr B R Ambedkar National Institute of Technology Jalandhar</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error - welcome email is optional
    return { success: false, error: error.message };
  }
};

// Send registration OTP email
const sendRegistrationOTP = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"NITJ Mess Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - NITJ Mess Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 40px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .otp-box { background-color: #f0f9ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp { font-size: 42px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verify Your Email</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1f2937;">Hello ${name},</p>
              <p style="color: #4b5563; line-height: 1.6;">
                Thank you for registering with NITJ Mess Portal. Please use the following One-Time Password (OTP) to verify your email address and complete your registration.
              </p>
              
              <div class="otp-box">
                <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; color: #1f2937;">Your Verification Code</div>
                <div class="otp">${otp}</div>
                <div style="color: #dc2626; font-size: 14px; margin-top: 15px; font-weight: 600;">⏰ Expires in 10 minutes</div>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                If you didn't initiate this registration, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p><strong>NITJ Mess Management Portal</strong><br>Dr B R Ambedkar National Institute of Technology Jalandhar</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendRegistrationOTP
};