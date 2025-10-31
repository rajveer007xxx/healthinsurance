"""
Utility functions for calculating billing periods based on prepaid/postpaid logic
"""

from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

def calculate_billing_period(billing_type, start_date, period_months, is_renewal=False, old_end_date=None):
    """
    Calculate billing period based on customer type (prepaid/postpaid)
    
    PREPAID: Shows FUTURE period (from start_date to end_date)
    - New customer: start_date to (start_date + period_months - 1 day)
    - Renewal: new start_date to (new start_date + period_months - 1 day)
    
    POSTPAID: Shows PAST period (from previous period)
    - New customer: start_date to (start_date + period_months - 1 day)
    - Renewal: (old_end_date - period_months + 1 day) to old_end_date
    
    Args:
        billing_type: "PREPAID" or "POSTPAID"
        start_date: datetime object for the start date
        period_months: int number of months
        is_renewal: bool whether this is a renewal or new subscription
        old_end_date: datetime object for the previous end date (required for postpaid renewal)
        
    Returns:
        tuple: (period_start, period_end) as datetime objects
    """
    
    if billing_type == "PREPAID":
        # Prepaid: Show future period
        period_start = start_date
        period_end = start_date + relativedelta(months=period_months) - timedelta(days=1)
        
    else:  # POSTPAID
        if is_renewal and old_end_date:
            # Postpaid renewal: Show past period
            period_end = old_end_date
            period_start = old_end_date - relativedelta(months=period_months) + timedelta(days=1)
        else:
            # Postpaid new customer: Show future period (same as prepaid for first time)
            period_start = start_date
            period_end = start_date + relativedelta(months=period_months) - timedelta(days=1)
    
    return period_start, period_end

def calculate_end_date(start_date, period_months):
    """
    Calculate end date from start date and period
    
    Args:
        start_date: datetime object
        period_months: int number of months
        
    Returns:
        datetime: end date (start_date + period_months - 1 day)
    """
    return start_date + relativedelta(months=period_months) - timedelta(days=1)
