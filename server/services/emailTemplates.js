export const emailTemplates = {
  getWelcomeTemplate: (name) => {
    return {
      subject: 'Welcome to Ember Bites!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ff5722;">Welcome to Ember Bites, ${name}!</h2>
          <p>We are thrilled to have you here. Browse our menu to order delicious meals crafted with consistency, speed, and premium quality.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}" style="background-color: #ff5722; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Order Now</a>
          </div>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Happy Eating,<br/>The Ember Bites Team</p>
        </div>
      `,
    };
  },

  getOrderPlacedTemplate: (name, orderId, amount) => {
    return {
      subject: `Order Placed Successfully - #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4caf50;">Order Placed Successfully!</h2>
          <p>Hi ${name},</p>
          <p>Your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> has been received and is being prepared.</p>
          <p>Total Paid: <strong>₹${amount}</strong></p>
          <p>Track your order status live on the platform.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/orders/${orderId}" style="background-color: #4caf50; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Track Order</a>
          </div>
          <p>Thank you for choosing Ember Bites!</p>
        </div>
      `,
    };
  },

  getOrderStatusTemplate: (name, orderId, status) => {
    return {
      subject: `Order Update - #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ff9800;">Your Order is ${status.replace('_', ' ').toUpperCase()}!</h2>
          <p>Hi ${name},</p>
          <p>Your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> status has been updated to <strong>${status.replace('_', ' ').toUpperCase()}</strong>.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/orders/${orderId}" style="background-color: #ff9800; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Track Order</a>
          </div>
          <p>Enjoy your meal!<br/>The Ember Bites Team</p>
        </div>
      `,
    };
  },

  getPasswordResetTemplate: (name, resetUrl) => {
    return {
      subject: 'Password Reset Request - Ember Bites',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ff5722;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #ff5722; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    };
  },

  getCouponIssuedTemplate: (name, code, discountValue, discountType) => {
    const valueStr = discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`;
    return {
      subject: 'Special Coupon Issued For You!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #9c27b0;">A Gift For You!</h2>
          <p>Hi ${name},</p>
          <p>We have issued a coupon code just for you: <strong>${code}</strong></p>
          <p>Get <strong>${valueStr}</strong> off on your next order!</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}" style="background-color: #9c27b0; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Use Coupon</a>
          </div>
          <p>Terms and conditions apply. Happy Ordering!</p>
        </div>
      `,
    };
  },
};
