from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.utils.timezone import get_ist_now
from app.core.database import get_db
from app.models.models import User, Settings, ManualInvoice
from app.routers.auth import get_current_user
import random
import string
import io
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

router = APIRouter()

def generate_invoice_number(db: Session) -> str:
    """Generate 8 digit invoice number with ADB prefix"""
    from app.utils.invoice_utils import generate_invoice_number as gen_invoice_num
    return gen_invoice_num(db, prefix="ADB", digits=8)

def generate_manual_invoice_pdf(invoice: ManualInvoice, settings: Settings) -> bytes:
    """Generate PDF for manual invoice"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch, leftMargin=0.75*inch, rightMargin=0.75*inch)
        
        elements = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=6,
            textColor=colors.black
        )
        
        company_style = ParagraphStyle(
            'Company',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            spaceAfter=12
        )
        
        elements.append(Paragraph("Tax Invoice", title_style))
        elements.append(Spacer(1, 0.1*inch))
        
        company_name = settings.company_name.upper() if settings else "ISPBILLING"
        company_address = settings.company_address if settings else ""
        company_phone = settings.company_phone if settings else ""
        company_email = settings.company_email if settings else ""
        company_gst = settings.company_gst if settings else ""
        
        company_info = f"""
        <b>{company_name}</b><br/>
        {company_address}<br/>
        Mobile NO: {company_phone}<br/>
        GSTIN: {company_gst}<br/>
        E-Mail: {company_email}
        """
        
        company_table = Table([[Paragraph(company_info, company_style)]], colWidths=[6.5*inch])
        company_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(company_table)
        elements.append(Spacer(1, 0.15*inch))
        
        invoice_details_data = [
            ['Invoice No:', invoice.invoice_number, 'Invoice Date:', invoice.invoice_date.strftime('%d-%m-%Y')],
            ['Total Due Amount:', f'₹{int(round(invoice.total_amount))}', 'Due Date:', invoice.due_date.strftime('%d-%m-%Y') if invoice.due_date else '']
        ]
        
        invoice_details_table = Table(invoice_details_data, colWidths=[1.5*inch, 1.75*inch, 1.5*inch, 1.75*inch])
        invoice_details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f0f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(invoice_details_table)
        elements.append(Spacer(1, 0.15*inch))
        
        buyer_info = f"""
        <b>Buyer:</b><br/>
        <b>Name:</b> {invoice.buyer_name}<br/>
        <b>Company:</b> {invoice.buyer_company}<br/>
        <b>Contact:</b> {invoice.buyer_contact}<br/>
        <b>Email:</b> {invoice.buyer_email}<br/>
        <b>Address:</b> {invoice.buyer_address}, {invoice.buyer_city}, {invoice.buyer_state}<br/>
        <b>GST:</b> {invoice.buyer_gst}
        """
        
        buyer_style = ParagraphStyle('Buyer', parent=styles['Normal'], fontSize=9, spaceAfter=12)
        buyer_table = Table([[Paragraph(buyer_info, buyer_style)]], colWidths=[6.5*inch])
        buyer_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(buyer_table)
        elements.append(Spacer(1, 0.15*inch))
        
        items = json.loads(invoice.items)
        items_data = [['S.NO.', 'Particulars', 'HSN Code', 'Qty', 'Rate', 'Amount']]
        
        for item in items:
            items_data.append([
                str(item['sl_no']),
                item['particulars'],
                item.get('hsn_code', ''),
                str(item.get('quantity', 1)),
                f"₹{int(round(item.get('price', 0)))}",
                f"₹{int(round(item.get('final_price', 0)))}"
            ])
        
        items_data.append(['', '', '', '', 'Total', f"₹{int(round(invoice.subtotal))}"])
        
        items_table = Table(items_data, colWidths=[0.5*inch, 2.5*inch, 1*inch, 0.75*inch, 1*inch, 0.75*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8e8e8')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f0f0f0')),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 0.15*inch))
        
        if invoice.cgst > 0 or invoice.sgst > 0 or invoice.igst > 0:
            tax_data = [
                ['Tax Type', 'Amount'],
                ['CGST', f"₹{int(round(invoice.cgst))}"],
                ['SGST', f"₹{int(round(invoice.sgst))}"],
                ['IGST', f"₹{int(round(invoice.igst))}"],
            ]
            
            tax_table = Table(tax_data, colWidths=[3*inch, 1.5*inch])
            tax_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8e8e8')),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(tax_table)
            elements.append(Spacer(1, 0.15*inch))
        
        total_para = Paragraph(f"<b>Balance Amount: ₹{int(round(invoice.total_amount))}</b>", styles['Heading3'])
        elements.append(total_para)
        elements.append(Spacer(1, 0.2*inch))
        
        declaration = settings.declaration if settings and settings.declaration else "We declare that this invoice shows the actual price of the goods described."
        terms = settings.terms_and_conditions if settings and settings.terms_and_conditions else "Payment due within 30 days."
        bank_name = settings.bank_name if settings else ""
        account_number = settings.account_number if settings else ""
        ifsc_code = settings.branch_ifsc if settings else ""
        
        footer_text = f"""
        <b>Declaration:</b> {declaration}<br/><br/>
        <b>Terms & Conditions:</b> {terms}<br/><br/>
        <b>Company Bank Details:</b><br/>
        Bank Name: {bank_name}<br/>
        Account Number: {account_number}<br/>
        IFSC Code: {ifsc_code}<br/><br/>
        <b>Authorised Signatory</b>
        """
        
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8)
        elements.append(Paragraph(footer_text, footer_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
        
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF generation not available. Please install reportlab."
        )

def send_invoice_email(invoice: ManualInvoice, pdf_bytes: bytes, settings: Settings):
    """Send invoice email with PDF attachment"""
    try:
        smtp_user = "no-reply@autoispbilling.com"
        smtp_password = "Login@121212"
        smtp_server = "smtp.hostinger.com"
        smtp_port = 465
        
        company_name = settings.company_name if settings else "ISPBILLING"
        company_mobile = settings.company_phone if settings else ""
        company_address = settings.company_address if settings else ""
        
        msg = MIMEMultipart()
        msg['From'] = f"ISPBILLING <{smtp_user}>"
        msg['To'] = invoice.buyer_email
        msg['Subject'] = "Invoice"
        
        body = f"""Dear {invoice.buyer_name},

Thank you for your business with {invoice.buyer_company if invoice.buyer_company else 'us'}, please find attached your invoice.

This is an automatically generated message to confirm your invoice. Please do not reply to this e-mail, but you may wish to save it for your records.

Should you have any questions about your invoice, feel free to call {company_name} & {company_mobile}.

Regards,
{company_name}
{company_address}
"""
        
        msg.attach(MIMEText(body, 'plain'))
        
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(pdf_bytes)
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename=invoice_{invoice.invoice_number}.pdf')
        msg.attach(part)
        
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.post("/")
def create_manual_invoice(
    invoice_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create and send manual invoice"""
    try:
        settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
        if not settings:
            settings = db.query(Settings).first()
        
        invoice_number = generate_invoice_number(db)
        
        invoice_date = datetime.fromisoformat(invoice_data.get('invoice_date')) if invoice_data.get('invoice_date') else get_ist_now()
        due_date = datetime.fromisoformat(invoice_data.get('due_date')) if invoice_data.get('due_date') else (invoice_date + timedelta(days=30))
        
        invoice = ManualInvoice(
            invoice_number=invoice_number,
            user_id=current_user.id,
            buyer_name=invoice_data.get('buyer_name'),
            buyer_company=invoice_data.get('buyer_company', ''),
            buyer_contact=invoice_data.get('buyer_contact'),
            buyer_email=invoice_data.get('buyer_email'),
            buyer_address=invoice_data.get('buyer_address'),
            buyer_city=invoice_data.get('buyer_city'),
            buyer_state=invoice_data.get('buyer_state'),
            buyer_gst=invoice_data.get('buyer_gst', ''),
            invoice_date=invoice_date,
            due_date=due_date,
            items=json.dumps(invoice_data.get('items', [])),
            subtotal=invoice_data.get('total_amount', 0),
            cgst=invoice_data.get('cgst', 0),
            sgst=invoice_data.get('sgst', 0),
            igst=invoice_data.get('igst', 0),
            total_amount=invoice_data.get('total_amount', 0),
            status="SENT",
            sent_date=get_ist_now()
        )
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        pdf_bytes = generate_manual_invoice_pdf(invoice, settings)
        
        send_invoice_email(invoice, pdf_bytes, settings)
        
        return {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "sent_date": invoice.sent_date.isoformat(),
            "customer_name": invoice.buyer_name,
            "customer_email": invoice.buyer_email,
            "total_amount": invoice.total_amount,
            "status": invoice.status
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create invoice: {str(e)}")

@router.get("/")
def get_manual_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all manual invoices"""
    invoices = db.query(ManualInvoice).filter(
        ManualInvoice.user_id == current_user.id
    ).order_by(ManualInvoice.created_at.desc()).offset(skip).limit(limit).all()
    
    return [{
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "sent_date": inv.sent_date.isoformat() if inv.sent_date else None,
        "customer_name": inv.buyer_name,
        "customer_email": inv.buyer_email,
        "total_amount": inv.total_amount,
        "status": inv.status
    } for inv in invoices]

@router.get("/{invoice_id}/pdf")
def download_manual_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download manual invoice PDF"""
    invoice = db.query(ManualInvoice).filter(
        ManualInvoice.id == invoice_id,
        ManualInvoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = db.query(Settings).first()
    
    pdf_bytes = generate_manual_invoice_pdf(invoice, settings)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice.invoice_number}.pdf"}
    )

@router.post("/preview")
def preview_invoice_before_send(
    invoice_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview invoice before sending (temporary invoice for preview)"""
    try:
        settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
        if not settings:
            settings = db.query(Settings).first()
        
        invoice_date = datetime.fromisoformat(invoice_data.get('invoice_date')) if invoice_data.get('invoice_date') else get_ist_now()
        due_date = datetime.fromisoformat(invoice_data.get('due_date')) if invoice_data.get('due_date') else (invoice_date + timedelta(days=30))
        
        temp_invoice = ManualInvoice(
            invoice_number=invoice_data.get('invoice_number', 'PREVIEW'),
            user_id=current_user.id,
            buyer_name=invoice_data.get('buyer_name'),
            buyer_company=invoice_data.get('buyer_company', ''),
            buyer_contact=invoice_data.get('buyer_contact'),
            buyer_email=invoice_data.get('buyer_email'),
            buyer_address=invoice_data.get('buyer_address'),
            buyer_city=invoice_data.get('buyer_city'),
            buyer_state=invoice_data.get('buyer_state'),
            buyer_gst=invoice_data.get('buyer_gst', ''),
            invoice_date=invoice_date,
            due_date=due_date,
            items=json.dumps(invoice_data.get('items', [])),
            subtotal=invoice_data.get('total_amount', 0),
            cgst=invoice_data.get('cgst', 0),
            sgst=invoice_data.get('sgst', 0),
            igst=invoice_data.get('igst', 0),
            total_amount=invoice_data.get('total_amount', 0),
            status="PREVIEW"
        )
        
        pdf_bytes = generate_manual_invoice_pdf(temp_invoice, settings)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=invoice_preview.pdf"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")

@router.post("/{invoice_id}/resend")
def resend_manual_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend manual invoice email"""
    invoice = db.query(ManualInvoice).filter(
        ManualInvoice.id == invoice_id,
        ManualInvoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = db.query(Settings).first()
    
    pdf_bytes = generate_manual_invoice_pdf(invoice, settings)
    send_invoice_email(invoice, pdf_bytes, settings)
    
    return {"message": "Invoice resent successfully"}

@router.delete("/{invoice_id}")
def delete_manual_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete manual invoice"""
    invoice = db.query(ManualInvoice).filter(
        ManualInvoice.id == invoice_id,
        ManualInvoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db.delete(invoice)
    db.commit()
    
    return {"message": "Invoice deleted successfully"}
