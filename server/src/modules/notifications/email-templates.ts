// Branded HTML email templates for Phoenix Vapers

export const emailTemplates = {
  orderConfirmation: (order: any) => ({
    subject: `Order Confirmed: #${order.number} - Phoenix Vapers`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #101512; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #1cad60 0%, #0f7a46 100%); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: black; margin: 0; }
            .content { padding: 30px; }
            .order-number { font-size: 18px; font-weight: bold; color: #1cad60; margin-top: 10px; }
            .item { border-top: 1px solid #e1e7e3; padding: 15px 0; display: flex; justify-content: space-between; }
            .item:first-of-type { border-top: none; }
            .total { border-top: 2px solid #1cad60; padding-top: 15px; margin-top: 15px; font-weight: bold; font-size: 18px; }
            .button { display: inline-block; background: #1cad60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
            .footer { background: #f6f9f7; padding: 20px; text-align: center; font-size: 12px; color: #5c665f; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔥 Phoenix Vapers</div>
              <div style="font-size: 14px; margin-top: 10px;">Thank you for your order</div>
            </div>
            <div class="content">
              <p>Hi ${order.customerName},</p>
              <p>Your order has been confirmed and we're getting it ready for delivery.</p>
              <div class="order-number">Order #${order.number}</div>

              <h3 style="margin-top: 25px; color: #101512;">Order Details</h3>
              ${order.items.map((item: any) => `
                <div class="item">
                  <span>${item.name} × ${item.qty}</span>
                  <span>£${(item.lineTotalMinor / 100).toFixed(2)}</span>
                </div>
              `).join('')}

              <div class="total">
                <div style="display: flex; justify-content: space-between;">
                  <span>Total</span>
                  <span>£${(order.totalMinor / 100).toFixed(2)}</span>
                </div>
              </div>

              <p style="margin-top: 25px; color: #5c665f; font-size: 14px;">
                📦 Your order will be sent via Royal Mail Tracked 24. You'll receive a tracking number when it ships.
              </p>

              <a href="https://phoenixvapers.co.uk/account/orders/${order.number}" class="button">Track Your Order</a>
            </div>
            <div class="footer">
              <p>Phoenix Vapers | UK Age-Verified Vape Retail</p>
              <p>© 2026 Phoenix Vapers. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderShipped: (order: any, trackingNumber: string) => ({
    subject: `Your Order is On The Way - #${order.number}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #101512; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #1cad60; color: white; padding: 30px; text-align: center; }
            .tracking-box { background: #e7f4ec; border-left: 4px solid #1cad60; padding: 20px; margin: 20px; }
            .tracking-number { font-size: 20px; font-weight: black; color: #1cad60; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📦 Your Order is Shipped!</h2>
            </div>
            <div style="padding: 30px;">
              <p>Hi ${order.customerName},</p>
              <p>Great news! Your order #${order.number} has been dispatched and is on its way to you.</p>

              <div class="tracking-box">
                <p style="margin: 0 0 10px 0; color: #5c665f; font-size: 12px; text-transform: uppercase;">Tracking Number</p>
                <div class="tracking-number">${trackingNumber}</div>
              </div>

              <p>Track your package:</p>
              <a href="https://tracking.royalmail.com/tracking?query=${trackingNumber}" style="color: #1cad60; text-decoration: underline;">View tracking details</a>

              <p style="margin-top: 20px; padding: 15px; background: #f6f9f7; border-radius: 8px; font-size: 14px;">
                Estimated delivery: 1-2 working days<br>
                All orders come with free tracking and signature required for age verification.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  deliveryConfirmation: (order: any) => ({
    subject: `Delivered: Order #${order.number}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
            .success-box { background: #e7f4ec; border: 2px solid #1cad60; border-radius: 8px; padding: 20px; text-align: center; }
            .checkmark { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body style="margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div class="success-box">
              <div class="checkmark">✓</div>
              <h2 style="color: #1cad60; margin: 0;">Delivered Successfully</h2>
              <p style="color: #5c665f; margin-top: 10px;">Your order #${order.number} has been delivered</p>
            </div>

            <div style="margin-top: 30px; padding: 20px;">
              <h3>Questions or Issues?</h3>
              <p>If you didn't receive your package or have any concerns, please contact our team:</p>
              <p>
                📧 <a href="mailto:orders@phoenixvapers.co.uk">orders@phoenixvapers.co.uk</a><br>
                📞 01733 887900<br>
                🕐 Weekdays 8am-4pm GMT
              </p>

              <h3 style="margin-top: 30px;">Leave a Review</h3>
              <p>We'd love to hear about your experience with Phoenix Vapers.</p>
              <a href="https://phoenixvapers.co.uk/account/reviews" style="background: #1cad60; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">Leave Feedback</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  reviewRequest: (customerName: string, orderNumber: string) => ({
    subject: `How was your Phoenix Vapers order?`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #101512; }
            .container { max-width: 600px; margin: 0 auto; padding: 30px; }
            .stars { font-size: 32px; letter-spacing: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Share Your Experience</h2>
            <p>Hi ${customerName},</p>
            <p>We'd love to know what you thought about your recent order from Phoenix Vapers (Order #${orderNumber}).</p>

            <div style="text-align: center;">
              <p>How would you rate your experience?</p>
              <div class="stars">★ ★ ★ ★ ★</div>
              <a href="https://phoenixvapers.co.uk/account/reviews?order=${orderNumber}" style="background: #1cad60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">Leave a Review</a>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #5c665f;">
              Your feedback helps us improve and helps other customers make informed decisions.
            </p>
          </div>
        </body>
      </html>
    `,
  }),

  passwordReset: (resetLink: string) => ({
    subject: `Reset Your Phoenix Vapers Password`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #101512;">
          <div style="max-width: 600px; margin: 0 auto; padding: 30px;">
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your Phoenix Vapers password. This link expires in 24 hours.</p>
            <a href="${resetLink}" style="background: #1cad60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; margin: 20px 0;">Reset Password</a>
            <p style="font-size: 12px; color: #5c665f;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  }),
};
