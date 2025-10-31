"""
Invoice utility functions for generating invoice numbers and related operations.
"""
import random
from sqlalchemy.orm import Session
from typing import Optional


def generate_invoice_number(db: Session, prefix: str = "ADB", digits: int = 8, max_attempts: int = 100) -> str:
    """
    Generate a unique invoice number with specified prefix and number of digits.
    
    Args:
        db: Database session for checking uniqueness
        prefix: Invoice number prefix (default: "ADB")
        digits: Number of random digits to generate (default: 8)
        max_attempts: Maximum attempts to generate unique number (default: 100)
    
    Returns:
        Unique invoice number in format: {prefix}{random_digits}
        Example: ADB12345678
    
    Raises:
        RuntimeError: If unable to generate unique invoice number after max_attempts
    """
    from app.models.models import Invoice, ManualInvoice
    
    for attempt in range(max_attempts):
        min_value = 10 ** (digits - 1)
        max_value = (10 ** digits) - 1
        random_number = random.randint(min_value, max_value)
        invoice_number = f"{prefix}{random_number}"
        
        invoice_exists = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
        manual_invoice_exists = db.query(ManualInvoice).filter(ManualInvoice.invoice_number == invoice_number).first()
        
        if not invoice_exists and not manual_invoice_exists:
            return invoice_number
    
    raise RuntimeError(f"Unable to generate unique invoice number after {max_attempts} attempts")


def format_invoice_number_for_display(invoice_number: str) -> str:
    """
    Format invoice number for display purposes.
    
    Args:
        invoice_number: Raw invoice number
    
    Returns:
        Formatted invoice number
    """
    return invoice_number.upper()
