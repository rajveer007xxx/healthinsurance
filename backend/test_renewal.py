#!/usr/bin/env python3
"""
Test renewal script for Rajveer S.
"""

import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, '/home/ubuntu/isp-management-system/isp-backend-v2')

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import SessionLocal
from app.models.models import Customer, Plan, Invoice, Settings
from app.utils.pdf_generator import generate_invoice_pdf
from app.utils.email_sender import send_invoice_email

def test_renewal():
    db = SessionLocal()
    
    try:
        customer = db.query(Customer).filter(Customer.id == 1).first()
        
        if not customer:
            print("Customer not found!")
            return
        
        print(f"Found customer: {customer.full_name} ({customer.customer_id})")
        print(f"Email: {customer.email}")
        print(f"Current end date: {customer.end_date}")
        print(f"Period months: {customer.period_months}")
        
        plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
        
        if not plan:
            print("Plan not found!")
            return
        
        print(f"Plan: {plan.name} - ₹{plan.price}/month")
        
        period_months = customer.period_months or 1
        
        settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
        if not settings:
            settings = db.query(Settings).first()
        
        if settings:
            invoice_prefix = settings.invoice_prefix or "INV"
            invoice_counter = settings.invoice_counter or 1000
            invoice_number = f"{invoice_prefix}{invoice_counter}"
            settings.invoice_counter = invoice_counter + 1
            print(f"Generated invoice number: {invoice_number}")
        else:
            invoice_number = f"INV{datetime.now().strftime('%Y%m%d%H%M%S')}"
            print(f"Generated invoice number (no settings): {invoice_number}")
        
        invoice_date = datetime.now()
        due_date = datetime.now() + timedelta(days=7)
        
        if customer.billing_type == "PREPAID":
            period_start = customer.end_date
            period_end = customer.end_date + timedelta(days=period_months * 30)
        else:
            period_end = customer.end_date
            period_start = customer.end_date - timedelta(days=period_months * 30)
        
        new_end_date = customer.end_date + timedelta(days=period_months * 30)
        
        total_amount = plan.price * period_months
        
        cgst_amount = 0.0
        sgst_amount = 0.0
        igst_amount = 0.0
        
        if plan.cgst_percentage and plan.cgst_percentage > 0:
            cgst_amount = (total_amount * plan.cgst_percentage) / 100
        
        if plan.sgst_percentage and plan.sgst_percentage > 0:
            sgst_amount = (total_amount * plan.sgst_percentage) / 100
        
        if plan.igst_percentage and plan.igst_percentage > 0:
            igst_amount = (total_amount * plan.igst_percentage) / 100
        
        total_with_tax = total_amount + cgst_amount + sgst_amount + igst_amount
        
        previous_balance = db.query(func.sum(Invoice.balance_amount)).filter(
            Invoice.customer_id == customer.id
        ).scalar() or 0.0
        
        print(f"Previous balance: ₹{previous_balance}")
        print(f"New invoice amount: ₹{total_with_tax}")
        print(f"Total due: ₹{total_with_tax + previous_balance}")
        
        new_invoice = Invoice(
            invoice_number=invoice_number,
            customer_id=customer.id,
            bill_amount=total_amount,
            cgst_tax=cgst_amount,
            sgst_tax=sgst_amount,
            igst_tax=igst_amount,
            installation_charges=0.0,
            discount=0.0,
            total_amount=total_with_tax,
            paid_amount=0.0,
            balance_amount=total_with_tax,
            invoice_date=invoice_date,
            due_date=due_date,
            billing_period_start=period_start,
            billing_period_end=period_end,
            status="SENT",
            sent_type="MANUAL",
            remarks="Test renewal"
        )
        db.add(new_invoice)
        
        customer.end_date = new_end_date
        
        db.commit()
        db.refresh(new_invoice)
        
        print(f"Invoice created successfully!")
        print(f"New end date: {new_end_date}")
        
        if customer.email:
            try:
                user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
                if not user_settings:
                    user_settings = db.query(Settings).first()
                
                invoice_data = {
                    'invoice_number': new_invoice.invoice_number,
                    'invoice_date': new_invoice.invoice_date,
                    'due_date': new_invoice.due_date,
                    'bill_amount': new_invoice.bill_amount,
                    'cgst_tax': new_invoice.cgst_tax,
                    'sgst_tax': new_invoice.sgst_tax,
                    'igst_tax': new_invoice.igst_tax,
                    'discount': new_invoice.discount,
                    'total_amount': new_invoice.total_amount,
                    'paid_amount': new_invoice.paid_amount,
                    'balance_amount': new_invoice.balance_amount,
                    'billing_period_start': new_invoice.billing_period_start,
                    'billing_period_end': new_invoice.billing_period_end,
                    'plan_name': plan.name if plan else 'N/A',
                    'plan_speed': plan.speed if plan else 'N/A',
                    'previous_balance': previous_balance
                }
                
                customer_data = {
                    'customer_id': customer.customer_id,
                    'full_name': customer.full_name,
                    'email': customer.email,
                    'mobile': customer.mobile,
                    'address': customer.address or '',
                    'city': customer.city or '',
                    'state': customer.state or '',
                    'pincode': customer.pincode or '',
                    'customer_gst_no': customer.customer_gst_no or '',
                    'customer_state_code': customer.customer_state_code or '',
                    'gst_invoice_needed': customer.gst_invoice_needed or False
                }
                
                company_data = {
                    'name': user_settings.company_name if user_settings else 'ISP Billing Services',
                    'address': user_settings.company_address if user_settings else '',
                    'phone': user_settings.company_phone if user_settings else '',
                    'email': user_settings.company_email if user_settings else 'billing@ispbilling.in',
                    'gstin': user_settings.company_gst if user_settings else '',
                    'state': user_settings.company_state if user_settings else '',
                    'code': user_settings.company_code if user_settings else '',
                    'bank_name': user_settings.bank_name if user_settings else '',
                    'account_number': user_settings.account_number if user_settings else '',
                    'ifsc_code': user_settings.branch_ifsc if user_settings else '',
                    'declaration': user_settings.declaration if user_settings else '',
                    'terms_and_conditions': user_settings.terms_and_conditions if user_settings else ''
                }
                
                print(f"Generating PDF invoice...")
                pdf_buffer = generate_invoice_pdf(invoice_data, customer_data, company_data)
                
                print(f"Sending email to {customer.email}...")
                send_invoice_email(
                    to_email=customer.email,
                    customer_name=customer.full_name,
                    customer_id=customer.customer_id,
                    invoice_number=new_invoice.invoice_number,
                    pdf_buffer=pdf_buffer,
                    company_name=company_data['name'],
                    company_mobile=company_data['phone'],
                    company_address=company_data['address'],
                    smtp_host="smtp.hostinger.com",
                    smtp_port=465,
                    smtp_user="billing@ispbilling.in",
                    smtp_password="Login@121212"
                )
                
                print(f"✅ Invoice sent successfully to {customer.email}")
            except Exception as email_error:
                print(f"❌ Email failed: {str(email_error)}")
                import traceback
                traceback.print_exc()
        else:
            print("No email address for customer")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting test renewal for Rajveer S...")
    test_renewal()
    print("Test renewal completed!")
