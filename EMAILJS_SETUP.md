# EmailJS Setup Guide

Your application now uses EmailJS to send email notifications when users are assigned to requests. Follow these steps to configure EmailJS:

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Click "Sign Up" and create a free account
3. Free tier includes 200 emails per month

## Step 2: Add an Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the instructions to connect your email account
5. Copy your **Service ID** (you'll need this later)

## Step 3: Create an Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use the following template structure:

**Subject:**
```
New Request Assignment - #{{request_number}}
```

**Content:**
```
Hello {{to_name}},

You have been assigned to a new request:

Request #{{request_number}}
Title: {{request_title}}
Due Date: {{due_date}}

Please log in to the tracking system to view more details.

Best regards,
Bold Code Co. Tracking System
```

4. Copy your **Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **Account** in your dashboard
2. Find your **Public Key** under API Keys
3. Copy this key (you'll need this later)

## Step 5: Configure Your .env File

Update your `.env` file with the values you copied:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace:
- `your_service_id_here` with your Service ID from Step 2
- `your_template_id_here` with your Template ID from Step 3
- `your_public_key_here` with your Public Key from Step 4

## Step 6: Restart Your Development Server

After updating the .env file, restart your development server for the changes to take effect.

## Testing

1. Create or edit a request
2. Assign it to a user who has an email address in their profile
3. Save the request
4. The assigned user should receive an email notification

## Template Variables

The following variables are available in your email template:

- `{{to_email}}` - Recipient's email address
- `{{to_name}}` - Recipient's full name
- `{{request_number}}` - Request number (e.g., 0001)
- `{{request_title}}` - Title of the request
- `{{due_date}}` - Formatted due date (or "Not specified")

## Troubleshooting

### "Email service not configured" Error

This means one or more environment variables are missing. Check that all three EmailJS variables are set in your .env file.

### Email Not Received

1. Check the browser console for error messages
2. Verify the assigned user has an email address in their profile
3. Check your spam/junk folder
4. Verify your EmailJS service is connected properly
5. Check your EmailJS dashboard for delivery logs

### Rate Limits

The free tier includes 200 emails/month. If you need more, consider upgrading your EmailJS plan.
