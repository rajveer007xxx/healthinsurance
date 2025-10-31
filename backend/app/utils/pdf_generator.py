from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import io
import os

def format_date_ddmmyyyy(date_str):
    """Convert date string to DD/MM/YYYY format"""
    if not date_str:
        return ''
    try:
        if isinstance(date_str, str):
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            date_obj = date_str
        return date_obj.strftime('%d/%m/%Y')
    except:
        return str(date_str)[:10]

def format_date_readable(date_str):
    """Format date string to readable format like '29th Oct'"""
    if not date_str:
        return ""
    try:
        if isinstance(date_str, str):
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            date_obj = date_str
        
        day = date_obj.day
        if 10 <= day % 100 <= 20:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
        
        month = date_obj.strftime('%b')  # Short month name (Jan, Feb, etc.)
        return f"{day}{suffix} {month}"
    except:
        return str(date_str)

def generate_invoice_pdf(invoice_data, customer_data, company_data):
    """Generate a PDF invoice matching the FIBERNET broadband template exactly"""
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.3*inch, bottomMargin=0.3*inch, leftMargin=0.5*inch, rightMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title - INVOICE
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, textColor=colors.black, alignment=TA_CENTER, spaceAfter=6, fontName='Helvetica-Bold')
    elements.append(Paragraph("<b>INVOICE</b>", title_style))
    elements.append(Spacer(1, 0.1*inch))
    
    company_style = ParagraphStyle('Company', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, spaceAfter=2)
    
    gst_invoice_needed = customer_data.get('gst_invoice_needed', False)
    
    logo_element = None
    company_logo_path = company_data.get('logo_path', '')
    if company_logo_path and os.path.exists(company_logo_path):
        try:
            logo_element = Image(company_logo_path, width=1*inch, height=0.5*inch)
        except:
            logo_element = None
    
    company_info_parts = [
        f"<b>{company_data.get('name', 'ISP BILLING').upper()}</b>",
        company_data.get('address', ''),
        f"Mobile NO-{company_data.get('phone', '')}",
        f"E-Mail : {company_data.get('email', '')}"
    ]
    
    if gst_invoice_needed:
        company_info_parts.insert(3, f"GSTIN :- {company_data.get('gstin', 'N/A')}")
        if company_data.get('state'):
            company_info_parts.append(f"State : {company_data.get('state')}")
        if company_data.get('code'):
            company_info_parts.append(f"State Code : {company_data.get('code')}")
    
    company_info = "<br/>".join(company_info_parts)
    
    invoice_label_style = ParagraphStyle('InvoiceLabel', parent=styles['Normal'], fontSize=8, alignment=TA_LEFT)
    invoice_value_style = ParagraphStyle('InvoiceValue', parent=styles['Normal'], fontSize=8, alignment=TA_LEFT)
    
    invoice_boxes = [
        [Paragraph("<b>Invoice No</b>", invoice_label_style), Paragraph(invoice_data.get('invoice_number', ''), invoice_value_style)],
        [Paragraph("<b>Dated</b>", invoice_label_style), Paragraph(format_date_ddmmyyyy(invoice_data.get('invoice_date', '')), invoice_value_style)],
        [Paragraph("<b>Total Due Amount</b>", invoice_label_style), Paragraph(f"₹ {int(round(invoice_data.get('total_due_amount', invoice_data.get('balance_amount', 0))))}", invoice_value_style)],
        [Paragraph("<b>Due Date</b>", invoice_label_style), Paragraph("Immediately", invoice_value_style)]
    ]
    
    invoice_table = Table(invoice_boxes, colWidths=[1.5*inch, 2*inch])
    invoice_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    if logo_element:
        company_content = Table([[logo_element], [Paragraph(company_info, company_style)]], colWidths=[3.5*inch])
        company_content.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
    else:
        company_content = Paragraph(company_info, company_style)
    
    header_boxes = [[
        company_content,
        invoice_table
    ]]
    
    header_table = Table(header_boxes, colWidths=[3.5*inch, 3.5*inch])
    header_table.setStyle(TableStyle([
        ('BOX', (0, 0), (0, 0), 0.5, colors.black),
        ('LEFTPADDING', (0, 0), (0, 0), 8),
        ('RIGHTPADDING', (0, 0), (0, 0), 8),
        ('TOPPADDING', (0, 0), (0, 0), 6),
        ('BOTTOMPADDING', (0, 0), (0, 0), 6),
        ('LEFTPADDING', (1, 0), (1, 0), 0),
        ('RIGHTPADDING', (1, 0), (1, 0), 0),
        ('TOPPADDING', (1, 0), (1, 0), 0),
        ('BOTTOMPADDING', (1, 0), (1, 0), 0),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.1*inch))
    
    buyer_style = ParagraphStyle('Buyer', parent=styles['Normal'], fontSize=9, spaceAfter=2)
    
    billing_type = customer_data.get('billing_type', 'PREPAID')
    service_type = customer_data.get('service_type', 'Broadband')
    
    buyer_info_parts = [
        f"<b>Buyer</b>",
        f"{customer_data.get('full_name', '')}  ({customer_data.get('mobile', '')})",
        f"Customer ID: {customer_data.get('customer_id', '')}",
        f"<b>Billing Type: {billing_type}</b>",
        f"<b>Category: {service_type}</b>",
        f"<b>BILLING ADDRESS:</b>{customer_data.get('address', '')}",
        customer_data.get('mobile', '')
    ]
    
    if gst_invoice_needed and customer_data.get('customer_gst_no'):
        buyer_info_parts.append(f"GSTIN :- {customer_data.get('customer_gst_no', '')}")
        if customer_data.get('state'):
            buyer_info_parts.append(f"<b>State :</b> {customer_data.get('state', '')}")
        if customer_data.get('customer_state_code'):
            buyer_info_parts.append(f"<b>Code :</b> {customer_data.get('customer_state_code', '')}")
    
    buyer_info = "<br/>".join(buyer_info_parts)
    buyer_data = [[Paragraph(buyer_info, buyer_style)]]
    
    buyer_table = Table(buyer_data, colWidths=[7*inch])
    buyer_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(buyer_table)
    elements.append(Spacer(1, 0.1*inch))
    
    # Items table header
    items_header = [['S.NO.', 'Description of Goods', 'HSN/SAC', 'Quantity', 'Rate Per', 'Disc. %', 'Amount']]
    
    period_start_formatted = format_date_ddmmyyyy(invoice_data.get('billing_period_start', ''))
    period_end_formatted = format_date_ddmmyyyy(invoice_data.get('billing_period_end', ''))
    
    plan_name = invoice_data.get('plan_name', 'Broadband Service')
    plan_speed = invoice_data.get('plan_speed', '')
    bill_amount = invoice_data.get('bill_amount', 0)
    cgst_tax = invoice_data.get('cgst_tax', 0)
    sgst_tax = invoice_data.get('sgst_tax', 0)
    igst_tax = invoice_data.get('igst_tax', 0)
    total_with_tax = bill_amount + cgst_tax + sgst_tax + igst_tax
    
    if plan_name == 'Addon Service':
        description = plan_speed
    else:
        description = f"{plan_name}\nPERIOD {period_start_formatted} to {period_end_formatted}"
    
    items_data_rows = [
        [
            '1',
            description,
            '998422',
            '1 nos',
            f"{total_with_tax:.0f}",
            '0',
            f"{total_with_tax:.0f}"
        ]
    ]
    
    previous_balance = invoice_data.get('previous_balance', 0)
    unpaid_invoice_numbers = invoice_data.get('unpaid_invoice_numbers', [])
    
    if previous_balance != 0:
        unpaid_invoices_text = f"Previous Balance"
        if unpaid_invoice_numbers:
            unpaid_invoices_text += f"\n(Unpaid Invoices: {', '.join(unpaid_invoice_numbers)})"
        
        items_data_rows.append([
            '2',
            unpaid_invoices_text,
            '998422',
            '1 nos',
            f"{previous_balance:.0f}",
            '0',
            f"{previous_balance:.0f}"
        ])
    
    items_table = Table(items_header + items_data_rows, colWidths=[0.4*inch, 2.8*inch, 0.7*inch, 0.7*inch, 0.9*inch, 0.6*inch, 0.9*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(items_table)
    
    total_amount = total_with_tax + previous_balance
    total_row = [['', '', '', '', '', 'Total', f"{total_amount:.0f}"]]
    total_table = Table(total_row, colWidths=[0.4*inch, 2.8*inch, 0.7*inch, 0.7*inch, 0.9*inch, 0.6*inch, 0.9*inch])
    total_table.setStyle(TableStyle([
        ('ALIGN', (5, 0), (6, 0), 'CENTER'),
        ('FONTNAME', (5, 0), (6, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (5, 0), (6, 0), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(total_table)
    elements.append(Spacer(1, 0.08*inch))
    
    amount_words = number_to_words(int(total_amount))
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, spaceAfter=2)
    elements.append(Paragraph(f"<b>Amount Chargeable (in words)</b> E. & O.E", small_style))
    elements.append(Paragraph(f"<b>{amount_words} ONLY</b>", small_style))
    elements.append(Spacer(1, 0.08*inch))
    
    cgst_rate = (cgst_tax / bill_amount * 100) if bill_amount > 0 else 0
    sgst_rate = (sgst_tax / bill_amount * 100) if bill_amount > 0 else 0
    igst_rate = (igst_tax / bill_amount * 100) if bill_amount > 0 else 0
    total_tax = cgst_tax + sgst_tax + igst_tax
    
    tax_data = [
        ['HSN/SAC', 'Taxable Value', 'IGST Tax', '', 'SGST Tax', '', 'CGST Tax', '', 'Total Tax\nAmount'],
        ['', '', 'Rate', 'Amount', 'Rate', 'Amount', 'Rate', 'Amount', ''],
        ['998422', f"{bill_amount:.0f}", f'{igst_rate:.1f}%', f'{igst_tax:.0f}', f'{sgst_rate:.1f}%', f'{sgst_tax:.0f}', f'{cgst_rate:.1f}%', f'{cgst_tax:.0f}', f'{total_tax:.0f}']
    ]
    
    tax_table = Table(tax_data, colWidths=[0.7*inch, 0.9*inch, 0.5*inch, 0.7*inch, 0.5*inch, 0.7*inch, 0.5*inch, 0.7*inch, 0.9*inch])
    tax_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 1), colors.lightgrey),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('SPAN', (0, 0), (0, 1)),
        ('SPAN', (1, 0), (1, 1)),
        ('SPAN', (2, 0), (3, 0)),
        ('SPAN', (4, 0), (5, 0)),
        ('SPAN', (6, 0), (7, 0)),
        ('SPAN', (8, 0), (8, 1)),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(tax_table)
    elements.append(Spacer(1, 0.08*inch))
    
    tax_words = number_to_words(int(total_tax)) if total_tax > 0 else "Zero"
    elements.append(Paragraph(f"<b>Tax Amount (in words) :</b> {tax_words}", small_style))
    elements.append(Paragraph(f"<b>Balance : {invoice_data.get('balance_amount', 0):.0f}</b>", small_style))
    elements.append(Spacer(1, 0.08*inch))
    
    declaration_text = company_data.get('declaration', 'Thanks for your business. Hope you are enjoying our services.')
    terms_text = company_data.get('terms_and_conditions', '1. Kindly Pay Your Total Due Amount Before/Till Due Date to Avoid Late Payment Charges.<br/>2. Cheque Bounce Penalty will be 500 Rupees Per Cheque.<br/>3. No Refund will be made after Payment Submission.<br/>4. No Refund will be made if User Paid Annual subscription.')
    
    footer_left = f"""<b>Declaration</b><br/>
{declaration_text}<br/><br/>
<b>Terms & Conditions:-</b><br/>
{terms_text}"""
    
    footer_right = f"""<b>Company Bank Details</b><br/>
Bank Name: {company_data.get('bank_name', 'N/A')}<br/>
A/c No. {company_data.get('account_number', 'N/A')}<br/>
Branch & IFS Code: {company_data.get('ifsc_code', 'N/A')}<br/><br/>
<b>for {company_data.get('name', 'ISP BILLING').upper()}</b><br/><br/><br/>
Authorised Signatory"""
    
    footer_data = [[
        Paragraph(footer_left, ParagraphStyle('FooterLeft', parent=styles['Normal'], fontSize=7, leading=9)),
        Paragraph(footer_right, ParagraphStyle('FooterRight', parent=styles['Normal'], fontSize=7, alignment=TA_RIGHT, leading=9))
    ]]
    
    footer_table = Table(footer_data, colWidths=[3.8*inch, 3.2*inch])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(footer_table)
    
    # Build PDF
    doc.build(elements)
    
    buffer.seek(0)
    return buffer

def number_to_words(num):
    """Convert number to words"""
    if num == 0:
        return "Zero"
    
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    
    if num < 10:
        return ones[num]
    elif num < 20:
        return teens[num - 10]
    elif num < 100:
        return tens[num // 10] + (" " + ones[num % 10] if num % 10 != 0 else "")
    elif num < 1000:
        return ones[num // 100] + " Hundred" + (" " + number_to_words(num % 100) if num % 100 != 0 else "")
    elif num < 100000:
        return number_to_words(num // 1000) + " Thousand" + (" " + number_to_words(num % 1000) if num % 1000 != 0 else "")
    else:
        return str(num)

def generate_receipt_pdf(payment_data, customer_data, company_data):
    """Generate a PDF receipt for payment with company logo"""
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch, leftMargin=0.5*inch, rightMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Add company logo at top if available
    logo_element = None
    company_logo_path = company_data.get('logo_path', '')
    if company_logo_path and os.path.exists(company_logo_path):
        try:
            logo_element = Image(company_logo_path, width=1.5*inch, height=0.75*inch)
            logo_element.hAlign = 'CENTER'
            elements.append(logo_element)
            elements.append(Spacer(1, 0.1*inch))
        except:
            pass
    
    # Title - PAYMENT RECEIPT
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=20, textColor=colors.black, alignment=TA_CENTER, spaceAfter=12, fontName='Helvetica-Bold')
    elements.append(Paragraph("<b>PAYMENT RECEIPT</b>", title_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Company info
    company_style = ParagraphStyle('Company', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, spaceAfter=4)
    company_info_parts = [
        f"<b>{company_data.get('name', 'ISP BILLING').upper()}</b>",
        company_data.get('address', ''),
        f"Mobile: {company_data.get('phone', '')} | Email: {company_data.get('email', '')}"
    ]
    company_info = "<br/>".join(company_info_parts)
    elements.append(Paragraph(company_info, company_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Receipt details box
    receipt_style = ParagraphStyle('Receipt', parent=styles['Normal'], fontSize=10, alignment=TA_LEFT)
    
    receipt_details = [
        [Paragraph("<b>Receipt No:</b>", receipt_style), Paragraph(payment_data.get('payment_id', 'N/A'), receipt_style)],
        [Paragraph("<b>Date:</b>", receipt_style), Paragraph(format_date_ddmmyyyy(payment_data.get('payment_date', '')), receipt_style)],
        [Paragraph("<b>Payment Method:</b>", receipt_style), Paragraph(payment_data.get('payment_method', 'N/A'), receipt_style)],
        [Paragraph("<b>Reference No:</b>", receipt_style), Paragraph(payment_data.get('payment_reference', 'N/A'), receipt_style)]
    ]
    
    receipt_table = Table(receipt_details, colWidths=[2*inch, 4*inch])
    receipt_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
    ]))
    elements.append(receipt_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Customer details
    customer_style = ParagraphStyle('Customer', parent=styles['Normal'], fontSize=10, alignment=TA_LEFT)
    
    customer_details = [
        [Paragraph("<b>Customer Name:</b>", customer_style), Paragraph(customer_data.get('full_name', 'N/A'), customer_style)],
        [Paragraph("<b>Customer ID:</b>", customer_style), Paragraph(customer_data.get('customer_id', 'N/A'), customer_style)],
        [Paragraph("<b>Mobile:</b>", customer_style), Paragraph(customer_data.get('mobile', 'N/A'), customer_style)],
        [Paragraph("<b>Address:</b>", customer_style), Paragraph(customer_data.get('address', 'N/A'), customer_style)]
    ]
    
    customer_table = Table(customer_details, colWidths=[2*inch, 4*inch])
    customer_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
    ]))
    elements.append(customer_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Payment amount - highlighted
    amount_style = ParagraphStyle('Amount', parent=styles['Normal'], fontSize=14, alignment=TA_CENTER, textColor=colors.HexColor('#006400'), fontName='Helvetica-Bold')
    amount_received = int(round(payment_data.get('amount', 0)))
    elements.append(Paragraph(f"<b>Amount Received: ₹{amount_received}</b>", amount_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Amount in words
    amount_words = number_to_words(amount_received)
    words_style = ParagraphStyle('Words', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, spaceAfter=4)
    elements.append(Paragraph(f"<i>({amount_words} Rupees Only)</i>", words_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Remarks if any
    remarks = payment_data.get('remarks', '')
    if remarks:
        remarks_style = ParagraphStyle('Remarks', parent=styles['Normal'], fontSize=9, alignment=TA_LEFT)
        elements.append(Paragraph(f"<b>Remarks:</b> {remarks}", remarks_style))
        elements.append(Spacer(1, 0.2*inch))
    
    # Footer
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.grey)
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("Thank you for your payment!", footer_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(f"This is a computer-generated receipt and does not require a signature.", footer_style))
    
    # Build PDF
    doc.build(elements)
    
    buffer.seek(0)
    return buffer
