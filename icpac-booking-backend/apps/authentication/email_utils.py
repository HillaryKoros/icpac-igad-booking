# Using replitmail integration for ICPAC Booking System OTP emails
import os
import requests
import json
from django.conf import settings


def get_auth_token():
    """Get Replit authentication token"""
    repl_identity = os.environ.get('REPL_IDENTITY')
    web_repl_renewal = os.environ.get('WEB_REPL_RENEWAL')
    
    if repl_identity:
        return f"repl {repl_identity}"
    elif web_repl_renewal:
        return f"depl {web_repl_renewal}"
    else:
        raise Exception("No authentication token found. Please set REPL_IDENTITY or ensure you're running in Replit environment.")


def send_otp_email(recipient_email, otp_code, user_name=""):
    """Send OTP verification email using Replit Mail service"""
    try:
        auth_token = get_auth_token()
        
        # Create email content
        subject = "ICPAC Booking System - Email Verification"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #034930 0%, #065f46 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }}
                .otp-box {{ background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #034930; letter-spacing: 4px; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }}
                .button {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏢 ICPAC Booking System</h1>
                    <p>Email Verification Required</p>
                </div>
                
                <div class="content">
                    <h2>Hello{" " + user_name if user_name else ""}!</h2>
                    
                    <p>Thank you for registering with the ICPAC Booking System. To complete your account setup, please verify your email address using the verification code below:</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-weight: 600; color: #065f46;">Your Verification Code</p>
                        <div class="otp-code">{otp_code}</div>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">This code expires in 10 minutes</p>
                    </div>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code is valid for 10 minutes only</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this verification, please ignore this email</li>
                    </ul>
                    
                    <p>Once verified, you'll have full access to:</p>
                    <ul>
                        <li>📅 Book meeting rooms instantly</li>
                        <li>🔒 Secure, domain-restricted access</li>
                        <li>📊 View booking history and analytics</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p><strong>ICPAC Climate Prediction and Applications Centre</strong></p>
                    <p>Email: info@icpac.net | Phone: +254 20 7095000</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        ICPAC Booking System - Email Verification
        
        Hello{" " + user_name if user_name else ""}!
        
        Thank you for registering with the ICPAC Booking System. To complete your account setup, please verify your email address using the verification code below:
        
        Your Verification Code: {otp_code}
        
        This code expires in 10 minutes.
        
        Important:
        - This code is valid for 10 minutes only
        - Do not share this code with anyone
        - If you didn't request this verification, please ignore this email
        
        Once verified, you'll have full access to book meeting rooms, view analytics, and more.
        
        ICPAC Climate Prediction and Applications Centre
        Email: info@icpac.net | Phone: +254 20 7095000
        
        This is an automated message. Please do not reply to this email.
        """
        
        # Send email using Replit Mail service
        response = requests.post(
            "https://connectors.replit.com/api/v2/mailer/send",
            headers={
                "Content-Type": "application/json",
                "X_REPLIT_TOKEN": auth_token,
            },
            json={
                "to": recipient_email,
                "subject": subject,
                "html": html_content,
                "text": text_content,
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"OTP email sent successfully to {recipient_email}")
            return True
        else:
            error_data = response.json() if response.content else {"message": "Unknown error"}
            print(f"Failed to send OTP email: {error_data.get('message', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"Error sending OTP email: {str(e)}")
        return False