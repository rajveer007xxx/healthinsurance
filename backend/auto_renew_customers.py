#!/var/www/isp-manager-v2/backend/venv/bin/python3
"""
Auto Renewal Script for ISP Billing System
Runs daily at 2:30 AM IST to automatically renew customers
"""

import sys
import os
import random
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
from pathlib import Path

os.chdir('/var/www/isp-manager-v2/backend')
sys.path.insert(0, '/var/www/isp-manager-v2/backend')

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import SessionLocal, engine
from app.models.models import Customer, Plan, Invoice, Transaction, Settings, PaymentMethod, PaymentStatus, RenewalCycle
from app.utils.pdf_generator import generate_invoice_pdf
from app.utils.email_sender import send_invoice_email

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass

def calculate_billing_period(customer, period_months, new_end_date, old_end_date, renewal_date):
    """
    Calculate billing period based on customer type (prepaid/postpaid)
    
    PREPAID: Shows FUTURE period (from renewal date to new end_date)
    Example: If expired on 28-Oct and renewing on 29-Oct for 1 month, period is 29-Oct to 28-Nov
    
    POSTPAID: Shows PAST period (from day after previous end to old end_date)
    Example: If expired on 28-Oct and renewing on 29-Oct for 1 month, period is 29-Sep to 28-Oct
    """
    if customer.billing_type == "PREPAID":
        period_start = renewal_date
        period_end = new_end_date
    else:
        period_end = old_end_date
        period_start = old_end_date - timedelta(days=period_months * 30) + timedelta(days=1)
    
    return period_start, period_end

def auto_renew_customers():
    """Main function to auto-renew eligible customers"""
    db = get_db()
    
    try:
        today = get_ist_now().date()
        
        customers = db.query(Customer).filter(
            Customer.status == "ACTIVE",
            Customer.auto_renew == True,
            Customer.end_date <= datetime.combine(today, datetime.max.time())
        ).all()
        
        print(f"[{get_ist_now()}] Found {len(customers)} customers eligible for auto-renewal")
        
        renewed_count = 0
        failed_count = 0
        
        for customer in customers:
            try:
                plan = db.query(Plan).filter(Plan.id == customer.plan_id).first()
                
                if not plan:
                    print(f"[{get_ist_now()}] Customer {customer.customer_id}: No plan found, skipping")
                    failed_count += 1
                    continue
                
                period_months = customer.period_months or 1
                
                old_end_date = customer.end_date
                renewal_date = old_end_date + timedelta(days=1)
                new_end_date = customer.end_date + timedelta(days=period_months * 30)
                
                period_start, period_end = calculate_billing_period(customer, period_months, new_end_date, old_end_date, renewal_date)
                
                settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
                if not settings:
                    settings = db.query(Settings).first()
                
                invoice_prefix = settings.invoice_prefix if settings else "INV"
                
                while True:
                    random_number = random.randint(1000000000, 99999999999)
                    invoice_number = f"{invoice_prefix}{random_number}"
                    if len(invoice_number) > 11:
                        invoice_number = invoice_number[:11]
                    existing_invoice = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
                    if not existing_invoice:
                        break
                
                if customer.billing_type == "PREPAID":
                    invoice_date = renewal_date
                    due_date = renewal_date + timedelta(days=7)
                else:
                    invoice_date = renewal_date
                    due_date = renewal_date + timedelta(days=7)
                
                total_amount = round(plan.price * period_months)
                
                cgst_amount = 0
                sgst_amount = 0
                igst_amount = 0
                
                if plan.cgst_percentage and plan.cgst_percentage > 0:
                    cgst_amount = round((total_amount * plan.cgst_percentage) / 100)
                
                if plan.sgst_percentage and plan.sgst_percentage > 0:
                    sgst_amount = round((total_amount * plan.sgst_percentage) / 100)
                
                if plan.igst_percentage and plan.igst_percentage > 0:
                    igst_amount = round((total_amount * plan.igst_percentage) / 100)
                
                total_with_tax = round(total_amount + cgst_amount + sgst_amount + igst_amount)
                
                previous_balance = db.query(func.sum(Invoice.balance_amount)).filter(
                    Invoice.customer_id == customer.id
                ).scalar() or 0
                
                old_unpaid_invoices = db.query(Invoice).filter(
                    Invoice.customer_id == customer.id,
                    Invoice.balance_amount > 0
                ).all()
                
                from app.models.models import AddonBill
                old_addon_bills = db.query(AddonBill).filter(
                    AddonBill.customer_id == customer.id,
                    AddonBill.balance_amount > 0
                ).all()
                
                addon_balance = db.query(func.sum(AddonBill.balance_amount)).filter(
                    AddonBill.customer_id == customer.id
                ).scalar() or 0
                
                total_previous_balance = previous_balance + addon_balance
                
                for old_invoice in old_unpaid_invoices:
                    old_invoice.paid_amount = old_invoice.total_amount
                    old_invoice.balance_amount = 0
                    old_invoice.status = "PAID"
                
                for addon in old_addon_bills:
                    addon.paid_amount = addon.total_amount
                    addon.balance_amount = 0
                    addon.status = "PAID"
                
                new_invoice = Invoice(
                    invoice_number=invoice_number,
                    customer_id=customer.id,
                    bill_amount=total_amount,
                    cgst_tax=cgst_amount,
                    sgst_tax=sgst_amount,
                    igst_tax=igst_amount,
                    installation_charges=0,
                    discount=0,
                    total_amount=total_with_tax,
                    paid_amount=0,
                    balance_amount=total_with_tax + total_previous_balance,
                    invoice_date=invoice_date,
                    due_date=due_date,
                    billing_period_start=period_start,
                    billing_period_end=period_end,
                    status="SENT",
                    sent_type="AUTO",
                    remarks="Auto-renewed subscription"
                )
                db.add(new_invoice)
                
                customer.end_date = new_end_date
                
                new_cycle = RenewalCycle(
                    customer_id=customer.id,
                    cycle_start=renewal_date,
                    cycle_end=new_end_date
                )
                db.add(new_cycle)
                
                db.commit()
                db.refresh(new_invoice)
                db.refresh(new_cycle)
                
                # Calculate balance after renewal
                invoice_balance = db.query(func.sum(Invoice.balance_amount)).filter(
                    Invoice.customer_id == customer.id
                ).scalar() or 0
                
                renewal_transaction = Transaction(
                    transaction_id=f"RNW{invoice_number}",
                    customer_id=customer.id,
                    cycle_id=new_cycle.id,
                    transaction_type="RENEWAL",
                    amount=total_with_tax,
                    balance_after=invoice_balance,
                    description=f"Auto-renewal for {period_months} month(s) - Invoice {invoice_number}",
                    transaction_date=get_ist_now()
                )
                db.add(renewal_transaction)
                
                db.commit()
                
                if customer.email:
                    try:
                        from app.models.models import Company
                        company = db.query(Company).filter(Company.id == customer.company_id).first()
                        
                        if not company:
                            company = db.query(Company).first()
                        
                        total_due_amount = new_invoice.total_amount + total_previous_balance
                        
                        unpaid_invoice_numbers = [inv.invoice_number for inv in old_unpaid_invoices]
                        
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
                            'previous_balance': total_previous_balance,
                            'total_due_amount': total_due_amount,
                            'unpaid_invoice_numbers': unpaid_invoice_numbers
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
                            'gst_invoice_needed': customer.gst_invoice_needed or False,
                            'billing_type': customer.billing_type or 'PREPAID'
                        }
                        
                        user_settings = db.query(Settings).filter(Settings.user_id == customer.created_by).first()
                        if not user_settings:
                            user_settings = db.query(Settings).first()
                        
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
                            'terms_and_conditions': user_settings.terms_and_conditions if user_settings else '',
                            'logo_path': user_settings.company_logo if user_settings and user_settings.company_logo else ''
                        }
                        
                        pdf_buffer = generate_invoice_pdf(invoice_data, customer_data, company_data)
                        
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
                            smtp_user="no-reply@autoispbilling.com",
                            smtp_password="Login@121212"
                        )
                        
                        print(f"[{get_ist_now()}] Customer {customer.customer_id}: Renewed and invoice sent to {customer.email}")
                    except Exception as email_error:
                        print(f"[{get_ist_now()}] Customer {customer.customer_id}: Renewed but email failed - {str(email_error)}")
                else:
                    print(f"[{get_ist_now()}] Customer {customer.customer_id}: Renewed but no email address")
                
                renewed_count += 1
                
            except Exception as customer_error:
                print(f"[{get_ist_now()}] Customer {customer.customer_id}: Failed to renew - {str(customer_error)}")
                failed_count += 1
                db.rollback()
                continue
        
        print(f"[{get_ist_now()}] Auto-renewal completed: {renewed_count} successful, {failed_count} failed")
        
    except Exception as e:
        print(f"[{get_ist_now()}] Auto-renewal script error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print(f"[{get_ist_now()}] Starting auto-renewal script...")
    auto_renew_customers()
    print(f"[{get_ist_now()}] Auto-renewal script finished")
