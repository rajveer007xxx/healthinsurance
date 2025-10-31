"""
Utility functions for formatting data
"""

def format_currency(amount):
    """
    Format currency amount to whole number (no decimals)
    
    Args:
        amount: Float or int amount
        
    Returns:
        int: Rounded whole number
    """
    if amount is None:
        return 0
    return int(round(float(amount)))

def format_currency_display(amount):
    """
    Format currency for display with rupee symbol
    
    Args:
        amount: Float or int amount
        
    Returns:
        str: Formatted string like "₹1234"
    """
    return f"₹{format_currency(amount)}"
