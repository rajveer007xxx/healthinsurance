"""Update existing customers with GST numbers to enable GST invoice"""
from app.core.database import SessionLocal
from app.models.models import Customer

db = SessionLocal()

customers = db.query(Customer).filter(
    Customer.customer_gst_no != None,
    Customer.customer_gst_no != '',
).all()

print(f"Found {len(customers)} customers with GST numbers")

state_codes = {
    'Andhra Pradesh': '37',
    'Arunachal Pradesh': '12',
    'Assam': '18',
    'Bihar': '10',
    'Chhattisgarh': '22',
    'Goa': '30',
    'Gujarat': '24',
    'Haryana': '06',
    'Himachal Pradesh': '02',
    'Jharkhand': '20',
    'Karnataka': '29',
    'Kerala': '32',
    'Madhya Pradesh': '23',
    'Maharashtra': '27',
    'Manipur': '14',
    'Meghalaya': '17',
    'Mizoram': '15',
    'Nagaland': '13',
    'Odisha': '21',
    'Punjab': '03',
    'Rajasthan': '08',
    'Sikkim': '11',
    'Tamil Nadu': '33',
    'Telangana': '36',
    'Tripura': '16',
    'Uttar Pradesh': '09',
    'Uttarakhand': '05',
    'West Bengal': '19',
    'Delhi': '07',
    'Chandigarh': '04',
    'Puducherry': '34',
    'Jammu and Kashmir': '01',
    'Ladakh': '38'
}

updated_count = 0
for customer in customers:
    customer.gst_invoice_needed = True
    
    if customer.state and not customer.customer_state_code:
        customer.customer_state_code = state_codes.get(customer.state, '')
    
    updated_count += 1
    print(f"Updated: {customer.full_name} - GST: {customer.customer_gst_no}, State: {customer.state}, Code: {customer.customer_state_code}")

db.commit()
print(f"\nUpdated {updated_count} customers to enable GST invoice")
db.close()
