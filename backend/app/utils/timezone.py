from datetime import datetime
import pytz

# Indian Standard Time timezone
IST = pytz.timezone('Asia/Kolkata')

def get_ist_now():
    """Get current datetime in IST timezone as naive datetime"""
    ist_time = datetime.now(IST)
    return ist_time.replace(tzinfo=None)

def utc_to_ist(utc_dt):
    """Convert UTC datetime to IST"""
    if utc_dt is None:
        return None
    if utc_dt.tzinfo is None:
        # Assume UTC if no timezone info
        utc_dt = pytz.utc.localize(utc_dt)
    return utc_dt.astimezone(IST)

def ist_to_utc(ist_dt):
    """Convert IST datetime to UTC"""
    if ist_dt is None:
        return None
    if ist_dt.tzinfo is None:
        # Assume IST if no timezone info
        ist_dt = IST.localize(ist_dt)
    return ist_dt.astimezone(pytz.utc)
