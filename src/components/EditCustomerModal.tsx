import { useState, useEffect } from 'react'
import api from '../utils/api'
import { X, Save } from 'lucide-react'
import { formatDate } from '../utils/dateFormate'
import { generatePaymentId } from '../utils/constants'

interface CustomerForm {
  category: string
  customer_id: string
  username: string
  password: string
  full_name: string
  nickname: string
  email: string
  phone: string
  mobile: string
  customer_gst_no: string
  customer_state_code: string
  gst_invoice_needed: boolean
  id_proof_type: string
  id_proof_no: string
  alternate_mobile: string
  
  house_number: string
  address: string
  locality_id: number | null
  state: string
  city: string
  pincode: string
  
  service_type: string
  billing_type: string
  no_of_connections: number
  auto_renew: boolean
  caf_no: string
  mac_address: string
  mac_address_detail: string
  ip_address: string
  vendor: string
  modem_no: string
  modem_no_detail: string
  stb_security_amount: number | string
  plan_id: number | null
  period_months: number
  start_date: string
  end_date: string
  
  plan_amount: number | string
  cgst_tax: number | string
  sgst_tax: number | string
  igst_tax: number | string
  total_bill_amount: number | string
  amount_paid: number | string
  installation_charges: number | string
  discount: number | string
  balance: number | string
  payment_method: string
  payment_id: string
  remarks: string
}

const indianStates = [
  { name: 'Andaman and Nicobar Islands', code: '35' },
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' },
  { name: 'Bihar', code: '10' },
  { name: 'Chandigarh', code: '04' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
  { name: 'Delhi', code: '07' },
  { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' },
  { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Jammu and Kashmir', code: '01' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Ladakh', code: '38' },
  { name: 'Lakshadweep', code: '31' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' },
  { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' },
  { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' },
  { name: 'Puducherry', code: '34' },
  { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' },
  { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'West Bengal', code: '19' }
];

const indianCities: Record<string, string[]> = {
  'Andaman and Nicobar Islands': ['Car Nicobar', 'Diglipur', 'Havelock Island', 'Mayabunder', 'Neil Island', 'Port Blair', 'Rangat'],
  'Andhra Pradesh': ['Adoni', 'Anantapur', 'Bhimavaram', 'Chittoor', 'Dharmavaram', 'Eluru', 'Gudivada', 'Guntakal', 'Guntur', 'Hindupur', 'Kadapa', 'Kakinada', 'Kurnool', 'Machilipatnam', 'Madanapalle', 'Nandyal', 'Narasaraopet', 'Nellore', 'Ongole', 'Proddatur', 'Rajahmundry', 'Srikakulam', 'Tadepalligudem', 'Tadipatri', 'Tenali', 'Tirupati', 'Vijayawada', 'Visakhapatnam', 'Vizianagaram'],
  'Arunachal Pradesh': ['Along', 'Bomdila', 'Changlang', 'Itanagar', 'Naharlagun', 'Namsai', 'Pasighat', 'Roing', 'Seppa', 'Tawang', 'Tezu', 'Ziro'],
  'Assam': ['Barpeta', 'Bongaigaon', 'Dhubri', 'Dibrugarh', 'Diphu', 'Goalpara', 'Golaghat', 'Guwahati', 'Haflong', 'Hailakandi', 'Hojai', 'Jorhat', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Mangaldoi', 'Morigaon', 'Nagaon', 'Nalbari', 'North Lakhimpur', 'Rangia', 'Sibsagar', 'Silchar', 'Sivasagar', 'Tezpur', 'Tinsukia', 'Tinsukia'],
  'Bihar': ['Arrah', 'Aurangabad', 'Bagaha', 'Begusarai', 'Bettiah', 'Bhagalpur', 'Bihar Sharif', 'Buxar', 'Chhapra', 'Danapur', 'Darbhanga', 'Dehri', 'Gaya', 'Hajipur', 'Jamalpur', 'Jehanabad', 'Katihar', 'Khagaria', 'Kishanganj', 'Madhubani', 'Motihari', 'Munger', 'Muzaffarpur', 'Nawada', 'Patna', 'Purnia', 'Saharsa', 'Samastipur', 'Sasaram', 'Sitamarhi', 'Siwan', 'Supaul'],
  'Chandigarh': ['Chandigarh', 'Mani Majra', 'Panchkula', 'Sector 17', 'Sector 22', 'Sector 35'],
  'Chhattisgarh': ['Ambikapur', 'Bhatapara', 'Bhilai', 'Bilaspur', 'Chirmiri', 'Dalli-Rajhara', 'Dhamtari', 'Durg', 'Jagdalpur', 'Korba', 'Mahasamund', 'Manendragarh', 'Mungeli', 'Naila Janjgir', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sakti', 'Tilda Newra'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Moti Daman', 'Nani Daman', 'Silvassa'],
  'Delhi': ['Central Delhi', 'Chandni Chowk', 'Connaught Place', 'Dwarka', 'East Delhi', 'Janakpuri', 'Karol Bagh', 'Laxmi Nagar', 'Mayur Vihar', 'Najafgarh', 'Narela', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Pitampura', 'Preet Vihar', 'Rohini', 'Saket', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'Vasant Kunj', 'West Delhi'],
  'Goa': ['Bicholim', 'Canacona', 'Cuncolim', 'Curchorem', 'Mapusa', 'Margao', 'Panaji', 'Pernem', 'Ponda', 'Quepem', 'Sanguem', 'Sanquelim', 'Valpoi', 'Vasco da Gama'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Bharuch', 'Bhavnagar', 'Bhuj', 'Botad', 'Dahod', 'Deesa', 'Gandhinagar', 'Godhra', 'Jamnagar', 'Jetpur', 'Junagadh', 'Kalol', 'Mehsana', 'Morbi', 'Nadiad', 'Navsari', 'Palanpur', 'Patan', 'Porbandar', 'Rajkot', 'Surat', 'Surendranagar', 'Vadodara', 'Valsad', 'Vapi', 'Veraval'],
  'Haryana': ['Ambala', 'Bahadurgarh', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gohana', 'Gurgaon', 'Hansi', 'Hisar', 'Jind', 'Kaithal', 'Karnal', 'Mandi Dabwali', 'Narnaul', 'Narwana', 'Palwal', 'Panchkula', 'Panipat', 'Pehowa', 'Pinjore', 'Rewari', 'Rohtak', 'Samalkha', 'Shahbad', 'Sirsa', 'Sonipat', 'Thanesar', 'Tohana', 'Yamunanagar'],
  'Himachal Pradesh': ['Arki', 'Baddi', 'Bilaspur', 'Chamba', 'Dalhousie', 'Dharamshala', 'Hamirpur', 'Joginder Nagar', 'Kangra', 'Kasauli', 'Kullu', 'Manali', 'Mandi', 'Nahan', 'Nalagarh', 'Nurpur', 'Palampur', 'Paonta Sahib', 'Rampur', 'Shimla', 'Solan', 'Sundarnagar', 'Una'],
  'Jammu and Kashmir': ['Anantnag', 'Awantipora', 'Bandipora', 'Baramulla', 'Bijbehara', 'Budgam', 'Doda', 'Ganderbal', 'Handwara', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Pulwama', 'Punch', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Sopore', 'Srinagar', 'Udhampur'],
  'Jharkhand': ['Adityapur', 'Bokaro', 'Chaibasa', 'Chatra', 'Chirkunda', 'Deoghar', 'Dhanbad', 'Dumka', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamshedpur', 'Jamtara', 'Koderma', 'Latehar', 'Lohardaga', 'Medininagar', 'Mihijam', 'Pakur', 'Phusro', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Simdega'],
  'Karnataka': ['Bagalkot', 'Bangalore', 'Belgaum', 'Bellary', 'Bhadravati', 'Bidar', 'Bijapur', 'Chikmagalur', 'Chitradurga', 'Davanagere', 'Gadag-Betigeri', 'Gangavati', 'Gulbarga', 'Hassan', 'Hospet', 'Hubli', 'Kolar', 'Mandya', 'Mangalore', 'Mysore', 'Raichur', 'Ranibennur', 'Robertson Pet', 'Shimoga', 'Tumkur', 'Udupi'],
  'Kerala': ['Alappuzha', 'Chalakudy', 'Ernakulam', 'Idukki', 'Kalamassery', 'Kanhangad', 'Kannur', 'Kasaragod', 'Kayamkulam', 'Kochi', 'Kollam', 'Kottayam', 'Koyilandy', 'Kozhikode', 'Malappuram', 'Muvattupuzha', 'Neyyattinkara', 'Palakkad', 'Parappanangadi', 'Pathanamthitta', 'Payyanur', 'Perinthalmanna', 'Ponnani', 'Tanur', 'Thalassery', 'Thiruvananthapuram', 'Thrippunithura', 'Thrissur', 'Vatakara', 'Wayanad'],
  'Ladakh': ['Drass', 'Kargil', 'Khaltse', 'Leh', 'Nubra', 'Nyoma', 'Zanskar'],
  'Lakshadweep': ['Agatti', 'Amini', 'Andrott', 'Bitra', 'Chetlat', 'Kadmat', 'Kalpeni', 'Kavaratti', 'Kiltan', 'Minicoy'],
  'Madhya Pradesh': ['Agar', 'Alirajpur', 'Alot', 'Amarpatan', 'Ambah', 'Ambikapur', 'Anuppur', 'Ashok Nagar', 'Ashoknagar', 'Badnagar', 'Bahoriband', 'Baihar', 'Baikunthpur', 'Balaghat', 'Bamori', 'Barhi', 'Barwani', 'Basoda', 'Begamganj', 'Beohari', 'Berasia', 'Betul', 'Bhanpura', 'Bhind', 'Bhitarwar', 'Bhopal', 'Biaora', 'Burhanpur', 'Chanderi', 'Chhatarpur', 'Chhindwara', 'Dabra', 'Damoh', 'Datia', 'Deori', 'Dewas', 'Dhar', 'Dharamjaigarh', 'Dimani', 'Dindori', 'Gadarwara', 'Garoth', 'Gotegaon', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Isagarh', 'Itarsi', 'Jabalpur', 'Jaithari', 'Jaora', 'Jashpur', 'Jhabua', 'Kareli', 'Karera', 'Katni', 'Khandwa', 'Khargone', 'Kharsia', 'Khurai', 'Kotma', 'Kunkuri', 'Kurwai', 'Lailunga', 'Lanji', 'Mahidpur', 'Maihar', 'Malhargarh', 'Manasa', 'Mandla', 'Mandsaur', 'Manendragarh', 'Mauganj', 'Mhow', 'Morena', 'Multai', 'Mungaoli', 'Murwara', 'Nagda', 'Nagod', 'Nainpur', 'Narsinghpur', 'Neemuch', 'Pandhurna', 'Panna', 'Pathalgaon', 'Pichhore', 'Pithampur', 'Porsa', 'Pratappur', 'Premnagar', 'Pushprajgarh', 'Raghogarh', 'Raigarh', 'Raisen', 'Rajgarh', 'Ratlam', 'Rehli', 'Rewa', 'Sabalgarh', 'Sagar', 'Sarangarh', 'Sarni', 'Satna', 'Sausar', 'Sehore', 'Sendhwa', 'Seoni', 'Shahdol', 'Shahpura', 'Shajapur', 'Shamgarh', 'Sheopur', 'Shivpuri', 'Shujalpur', 'Sidhi', 'Singrauli', 'Sironj', 'Sitamau', 'Susner', 'Susner', 'Suwasra', 'Tarana', 'Tendukheda', 'Tikamgarh', 'Timarni', 'Tirodi', 'Ujjain', 'Unhel', 'Vidisha', 'Vijaypur', 'Vijayraghavgarh', 'Wadrafnagar', 'Waraseoni'],
  'Maharashtra': ['Achalpur', 'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Barshi', 'Beed', 'Bhusawal', 'Chandrapur', 'Dhule', 'Gondia', 'Jalgaon', 'Kamptee', 'Kolhapur', 'Latur', 'Malegaon', 'Mumbai', 'Nagpur', 'Nanded', 'Nashik', 'Navi Mumbai', 'Osmanabad', 'Parbhani', 'Pune', 'Sangli', 'Satara', 'Solapur', 'Thane', 'Wardha', 'Yavatmal'],
  'Manipur': ['Bishnupur', 'Churachandpur', 'Imphal', 'Jiribam', 'Kakching', 'Mayang Imphal', 'Moreh', 'Senapati', 'Tamenglong', 'Thoubal', 'Ukhrul'],
  'Meghalaya': ['Baghmara', 'Jowai', 'Mairang', 'Nongpoh', 'Nongstoin', 'Resubelpara', 'Shillong', 'Tura', 'Williamnagar'],
  'Mizoram': ['Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip'],
  'Nagaland': ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Angul', 'Balangir', 'Balasore', 'Barbil', 'Bargarh', 'Baripada', 'Berhampur', 'Bhadrak', 'Bhawanipatna', 'Bhubaneswar', 'Cuttack', 'Dhenkanal', 'Jatani', 'Jeypore', 'Jharsuguda', 'Kendujhar', 'Koraput', 'Paradip', 'Phulbani', 'Puri', 'Rayagada', 'Rourkela', 'Sambalpur', 'Sunabeda', 'Talcher'],
  'Puducherry': ['Ariankuppam', 'Karaikal', 'Mahe', 'Oulgaret', 'Puducherry', 'Villianur', 'Yanam'],
  'Punjab': ['Abohar', 'Amritsar', 'Barnala', 'Batala', 'Bathinda', 'Chandigarh', 'Faridkot', 'Fazilka', 'Firozpur', 'Gobindgarh', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Khanna', 'Kharar', 'Ludhiana', 'Malerkotla', 'Mandi Gobindgarh', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Nabha', 'Pathankot', 'Patiala', 'Phagwara', 'Rajpura', 'Sangrur', 'Sunam'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Barmer', 'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Churu', 'Hanumangarh', 'Jaipur', 'Jhunjhunu', 'Jodhpur', 'Kishangarh', 'Kota', 'Ladnu', 'Makrana', 'Nagaur', 'Nimbahera', 'Nokha', 'Pali', 'Rajsamand', 'Ratangarh', 'Sardarshahar', 'Sawai Madhopur', 'Sikar', 'Sri Ganganagar', 'Sujangarh', 'Suratgarh', 'Tonk', 'Udaipur'],
  'Sikkim': ['Gangtok', 'Gyalshing', 'Jorethang', 'Mangan', 'Namchi', 'Pelling', 'Rangpo', 'Singtam'],
  'Tamil Nadu': ['Arakkonam', 'Aruppukkottai', 'Chennai', 'Coimbatore', 'Coonoor', 'Erode', 'Kancheepuram', 'Kumarapalayam', 'Madurai', 'Nagapattinam', 'Nagercoil', 'Neyveli', 'Pollachi', 'Pudukkottai', 'Rajapalayam', 'Ranipet', 'Salem', 'Sivakasi', 'Thanjavur', 'Theni', 'Tiruchengode', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Tiruvannamalai', 'Udhagamandalam', 'Vaniyambadi', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Bhongir', 'Bodhan', 'Farooqnagar', 'Hyderabad', 'Jagtial', 'Jangaon', 'Kamareddy', 'Karimnagar', 'Khammam', 'Kothagudem', 'Mahbubnagar', 'Mancherial', 'Mandamarri', 'Medak', 'Miryalaguda', 'Nalgonda', 'Nirmal', 'Nizamabad', 'Palwancha', 'Ramagundam', 'Siddipet', 'Suryapet', 'Vikarabad', 'Warangal'],
  'Tripura': ['Agartala', 'Ambassa', 'Belonia', 'Dharmanagar', 'Kailasahar', 'Khowai', 'Ranir Bazar', 'Sabroom', 'Sonamura', 'Udaipur'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Amroha', 'Ayodhya', 'Bareilly', 'Bulandshahr', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Ghaziabad', 'Gorakhpur', 'Hapur', 'Hardoi', 'Jhansi', 'Kanpur', 'Lucknow', 'Mathura', 'Maunath Bhanjan', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Noida', 'Rampur', 'Saharanpur', 'Sambhal', 'Shahjahanpur', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Champawat', 'Dehradun', 'Haldwani', 'Haridwar', 'Jaspur', 'Kashipur', 'Kotdwar', 'Manglaur', 'Mussoorie', 'Nainital', 'Pauri', 'Pithoragarh', 'Ramnagar', 'Rishikesh', 'Roorkee', 'Rudraprayag', 'Rudrapur', 'Tehri']
};

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: number
  onSuccess: () => void
}

export default function EditCustomerModal({ isOpen, onClose, customerId, onSuccess }: EditCustomerModalProps) {
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(true)
  const [localities, setLocalities] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<CustomerForm>({
    category: 'prepaid',
    customer_id: '',
    username: '',
    password: 'password123',
    full_name: '',
    nickname: '',
    email: '',
    phone: '',
    mobile: '',
    customer_gst_no: '',
    customer_state_code: '',
    gst_invoice_needed: false,
    id_proof_type: 'AADHAR_CARD',
    id_proof_no: '',
    alternate_mobile: '',
    
    house_number: '',
    address: '',
    locality_id: null,
    state: '',
    city: '',
    pincode: '',
    
    service_type: 'BROADBAND',
    billing_type: 'PREPAID',
    no_of_connections: 1,
    auto_renew: false,
    caf_no: '',
    mac_address: '',
    mac_address_detail: '',
    ip_address: '',
    vendor: '',
    modem_no: '',
    modem_no_detail: '',
    stb_security_amount: '',
    plan_id: null,
    period_months: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    
    plan_amount: '',
    cgst_tax: '',
    sgst_tax: '',
    igst_tax: '',
    total_bill_amount: '',
    amount_paid: '',
    installation_charges: '',
    discount: '',
    balance: '',
    payment_method: 'cash',
    payment_id: '',
    remarks: ''
  })

  useEffect(() => {
    if (isOpen && customerId) {
      fetchLocalities()
      fetchPlans()
      fetchCustomer()
      setActiveTab(1)
    }
    
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault()
      }
    }
    
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen, customerId])

  useEffect(() => {
    if (formData.start_date && formData.period_months) {
      const startDate = new Date(formData.start_date)
      const startDay = startDate.getDate()
      
      if (startDay === 1) {
        startDate.setMonth(startDate.getMonth() + formData.period_months)
        startDate.setDate(0)
      } else {
        startDate.setDate(startDate.getDate() + (formData.period_months * 30))
      }
      
      setFormData(prev => ({ ...prev, end_date: startDate.toISOString().split('T')[0] }))
    }
  }, [formData.start_date, formData.period_months])

  useEffect(() => {
    const periodMonths = Number(formData.period_months) || 1
    const basePlanAmount = Number(formData.plan_amount) || 0
    const baseCgstTax = Number(formData.cgst_tax) || 0
    const baseSgstTax = Number(formData.sgst_tax) || 0
    const baseIgstTax = Number(formData.igst_tax) || 0
    
    const planAmount = basePlanAmount * periodMonths
    const cgstTax = baseCgstTax * periodMonths
    const sgstTax = baseSgstTax * periodMonths
    const igstTax = baseIgstTax * periodMonths
    const installationCharges = Number(formData.installation_charges) || 0
    const stbSecurityAmount = Number(formData.stb_security_amount) || 0
    const discount = Number(formData.discount) || 0
    const amountPaid = Number(formData.amount_paid) || 0
    
    const total = Number((planAmount + cgstTax + sgstTax + igstTax + installationCharges + stbSecurityAmount - discount).toFixed(2))
    const balance = Number((total - amountPaid).toFixed(2))
    setFormData(prev => ({ ...prev, total_bill_amount: total, balance }))
  }, [formData.plan_amount, formData.cgst_tax, formData.sgst_tax, formData.igst_tax, formData.installation_charges, formData.stb_security_amount, formData.discount, formData.amount_paid, formData.period_months])

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${customerId}`)
      const customer = response.data
      setFormData({
        category: customer.category || 'prepaid',
        customer_id: customer.customer_id || '',
        username: customer.username || '',
        password: '',
        full_name: customer.full_name || '',
        nickname: customer.nickname || '',
        email: customer.email || '',
        phone: customer.phone || '',
        mobile: customer.mobile || '',
        customer_gst_no: customer.customer_gst_no || '',
        customer_state_code: customer.customer_state_code || '',
        gst_invoice_needed: customer.gst_invoice_needed || false,
        id_proof_type: customer.id_proof_type || 'AADHAR_CARD',
        id_proof_no: customer.id_proof_no || '',
        alternate_mobile: customer.alternate_mobile || '',
        house_number: customer.house_number || '',
        address: customer.address || '',
        locality_id: customer.locality_id || null,
        state: customer.state || '',
        city: customer.city || '',
        pincode: customer.pincode || '',
        service_type: customer.service_type || 'BROADBAND',
        billing_type: customer.billing_type || 'PREPAID',
        no_of_connections: customer.no_of_connections || 1,
        auto_renew: customer.auto_renew || false,
        caf_no: customer.caf_no || '',
        mac_address: customer.mac_address || '',
        mac_address_detail: customer.mac_address_detail || '',
        ip_address: customer.ip_address || '',
        vendor: customer.vendor || '',
        modem_no: customer.modem_no || '',
        modem_no_detail: customer.modem_no_detail || '',
        stb_security_amount: customer.stb_modem_security_amount || '',
        plan_id: customer.plan_id || null,
        period_months: customer.period_months || 1,
        start_date: customer.start_date || new Date().toISOString().split('T')[0],
        end_date: customer.end_date || '',
        plan_amount: customer.plan_amount || '',
        cgst_tax: customer.cgst_tax || '',
        sgst_tax: customer.sgst_tax || '',
        igst_tax: customer.igst_tax || '',
        total_bill_amount: customer.total_bill_amount || '',
        amount_paid: customer.amount_paid || '',
        installation_charges: customer.installation_charges || '',
        discount: customer.discount || '',
        balance: customer.balance || '',
        payment_method: customer.payment_method ? customer.payment_method.toLowerCase() : 'cash',
        payment_id: customer.payment_id || '',
        remarks: customer.remarks || ''
      })
    } catch (error) {
      console.error('Error fetching customer:', error)
      alert('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocalities = async () => {
    try {
      const response = await api.get('/localities/')
      setLocalities(response.data)
    } catch (error) {
      console.error('Error fetching localities:', error)
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/')
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const handlePlanChange = (planId: number) => {
    const selectedPlan = plans.find(p => p.id === planId)
    if (selectedPlan) {
      const cgstAmount = (selectedPlan.price * (selectedPlan.cgst_percentage || 0)) / 100
      const sgstAmount = (selectedPlan.price * (selectedPlan.sgst_percentage || 0)) / 100
      const igstAmount = (selectedPlan.price * (selectedPlan.igst_percentage || 0)) / 100
      
      setFormData(prev => ({
        ...prev,
        plan_id: planId,
        plan_amount: selectedPlan.price,
        cgst_tax: cgstAmount,
        sgst_tax: sgstAmount,
        igst_tax: igstAmount
      }))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...(formData.customer_id ? { customer_id: formData.customer_id } : {}),
        username: formData.username,
        ...(formData.password ? { password: formData.password } : {}),
        full_name: formData.full_name,
        nickname: formData.nickname || null,
        email: formData.email || null,
        mobile: formData.mobile,
        alternate_mobile: formData.alternate_mobile || null,
        customer_gst_no: formData.customer_gst_no || null,
        customer_state_code: formData.customer_state_code || null,
        gst_invoice_needed: formData.gst_invoice_needed || false,
        id_proof_type: formData.id_proof_type || null,
        id_proof_no: formData.id_proof_no || null,
        house_number: formData.house_number || null,
        address: formData.address || null,
        locality_id: formData.locality_id || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        service_type: formData.service_type,
        no_of_connections: formData.no_of_connections || 1,
        company_id: null,
        auto_renew: formData.auto_renew || false,
        caf_no: formData.caf_no || null,
        mac_address: formData.mac_address || null,
        mac_address_detail: formData.mac_address_detail || null,
        ip_address: formData.ip_address || null,
        vendor: formData.vendor || null,
        modem_no: formData.modem_no || null,
        modem_no_detail: formData.modem_no_detail || null,
        stb_modem_security_amount: Number(formData.stb_security_amount) || 0,
        plan_id: formData.plan_id,
        period_months: formData.period_months || 1,
        start_date: formData.start_date,
        billing_type: formData.billing_type,
        assigned_employee_id: null,
        cgst_tax: Number(formData.cgst_tax) || 0,
        sgst_tax: Number(formData.sgst_tax) || 0,
        igst_tax: Number(formData.igst_tax) || 0,
        installation_charges: Number(formData.installation_charges) || 0,
        discount: Number(formData.discount) || 0,
        amount_paid: Number(formData.amount_paid) || 0,
        payment_method: formData.payment_method ? formData.payment_method.toUpperCase() : null,
        payment_id: formData.payment_id || null
      }
      
      console.log('Updating customer data:', payload)
      await api.put(`/customers/${customerId}`, payload)
      
      alert('Customer updated successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating customer:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      setFieldErrors({})
      
      let errorMessage = 'Error updating customer'
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const newFieldErrors: Record<string, string> = {}
          const errorMessages: string[] = []
          
          error.response.data.detail.forEach((err: any) => {
            const fieldPath = err.loc?.join(' -> ') || 'Field'
            const fieldName = err.loc?.[err.loc.length - 1] || 'unknown'
            const errorMsg = err.msg
            
            newFieldErrors[fieldName] = errorMsg
            errorMessages.push(`${fieldPath}: ${errorMsg}`)
          })
          
          setFieldErrors(newFieldErrors)
          errorMessage = `Validation Error:\n${errorMessages.join('\n')}`
          console.error('Validation errors:', errorMessages.join('\n'))
          console.error('Field errors:', newFieldErrors)
        } else {
          errorMessage = error.response.data.detail
        }
      }
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getFieldClass = (fieldName: string, baseClass: string = 'w-full px-3 py-2 border ') => {
    if (fieldErrors[fieldName]) {
      return `${baseClass} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500`
    }
    return `${baseClass} border-gray-300`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Customer</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Customer'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">

        {/* Tabs */}
        <div className="bg-white shadow ">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab(1)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 1
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                General Information
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 2
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Address Detail
              </button>
              <button
                onClick={() => setActiveTab(3)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 3
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Billing Detail
              </button>
              <button
                onClick={() => setActiveTab(4)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 4
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Detail
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab 1: General Information */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  >
                    <option value="prepaid">Prepaid</option>
                    <option value="postpaid">Postpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID (Auto-generated)</label>
                  <input
                    type="text"
                    value={formData.customer_id}
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
                    readOnly
                    placeholder="Generating..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Name *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={getFieldClass('username')}
                    required
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={getFieldClass('full_name')}
                    required
                  />
                  {fieldErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer GST No.</label>
                  <input
                    type="text"
                    value={formData.customer_gst_no}
                    onChange={(e) => setFormData({ ...formData, customer_gst_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                  <select
                    value={formData.id_proof_type}
                    onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  >
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="SERVICE_ID_CARD">Service ID Card</option>
                    <option value="AADHAR_CARD">Aadhar Card</option>
                    <option value="PASSBOOK">Passbook of Govt Bank</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof No</label>
                  <input
                    type="text"
                    value={formData.id_proof_no}
                    onChange={(e) => setFormData({ ...formData, id_proof_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
                  <input
                    type="tel"
                    value={formData.alternate_mobile}
                    onChange={(e) => setFormData({ ...formData, alternate_mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Address Detail */}
            {activeTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Number *</label>
                  <input
                    type="text"
                    value={formData.house_number}
                    onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality *</label>
                  <select
                    value={formData.locality_id || ''}
                    onChange={(e) => setFormData({ ...formData, locality_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  >
                    <option value="">Select Locality</option>
                    {localities.map(locality => (
                      <option key={locality.id} value={locality.id}>{locality.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const selectedState = indianStates.find(s => s.name === e.target.value);
                      setFormData({ 
                        ...formData, 
                        state: e.target.value,
                        customer_state_code: selectedState?.code || '',
                        city: '' // Reset city when state changes
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state.code} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    disabled={!formData.state || !indianCities[formData.state]}
                    required
                  >
                    <option value="">Select City</option>
                    {formData.state && indianCities[formData.state]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Billing Detail */}
            {activeTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  >
                    <option value="broadband">Broadband</option>
                    <option value="cable_tv">Cable TV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto Renew? *</label>
                  <select
                    value={formData.auto_renew ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, auto_renew: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAF NO</label>
                  <input
                    type="text"
                    value={formData.caf_no}
                    onChange={(e) => setFormData({ ...formData, caf_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300  "
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                  <input
                    type="text"
                    value={formData.mac_address}
                    onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modem No</label>
                  <input
                    type="text"
                    value={formData.modem_no}
                    onChange={(e) => setFormData({ ...formData, modem_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">STB/Modem Security Amount</label>
                  <input
                    type="number"
                    value={formData.stb_security_amount}
                    onChange={(e) => setFormData({ ...formData, stb_security_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Invoice Needed</label>
                  <select
                    value={formData.gst_invoice_needed ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, gst_invoice_needed: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
                  <select
                    value={formData.plan_id || ''}
                    onChange={(e) => handlePlanChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.total_amount ? plan.total_amount.toFixed(2) : plan.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period (Months) *</label>
                  <input
                    type="number"
                    value={formData.period_months}
                    onChange={(e) => setFormData({ ...formData, period_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    min="1"
                    max="24"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 "
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: {formatDate(formData.start_date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: {formatDate(formData.end_date)}</p>
                </div>
              </div>
            )}

            {/* Tab 4: Payment Detail */}
            {activeTab === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount * (for {formData.period_months} month{formData.period_months > 1 ? 's' : ''})</label>
                  <input
                    type="number"
                    value={(Number(formData.plan_amount) || 0) * (Number(formData.period_months) || 1)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGST Tax (for {formData.period_months} month{formData.period_months > 1 ? 's' : ''})</label>
                  <input
                    type="number"
                    value={(Number(formData.cgst_tax) || 0) * (Number(formData.period_months) || 1)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SGST Tax (for {formData.period_months} month{formData.period_months > 1 ? 's' : ''})</label>
                  <input
                    type="number"
                    value={(Number(formData.sgst_tax) || 0) * (Number(formData.period_months) || 1)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IGST Tax (for {formData.period_months} month{formData.period_months > 1 ? 's' : ''})</label>
                  <input
                    type="number"
                    value={(Number(formData.igst_tax) || 0) * (Number(formData.period_months) || 1)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Bill Amount *</label>
                  <input
                    type="number"
                    value={formData.total_bill_amount}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Amount</label>
                  <input
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e) => {
                      const amount = Number(e.target.value)
                      setFormData({ ...formData, amount_paid: amount })
                      if (amount > 0 && formData.payment_method && !formData.payment_id) {
                        setFormData(prev => ({ ...prev, amount_paid: amount, payment_id: generatePaymentId(prev.payment_method) }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">STB/Modem Deposit</label>
                  <input
                    type="number"
                    value={formData.stb_security_amount}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Installation Charges</label>
                  <input
                    type="number"
                    value={formData.installation_charges}
                    onChange={(e) => setFormData({ ...formData, installation_charges: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    value={formData.balance}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => {
                      const method = e.target.value
                      setFormData({ ...formData, payment_method: method })
                      if (Number(formData.amount_paid) > 0 && method) {
                        setFormData(prev => ({ ...prev, payment_method: method, payment_id: generatePaymentId(method) }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 "
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="paytm">Paytm</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="googlepay">GooglePay</option>
                    <option value="cheque">Cheque</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID (Auto-generated)</label>
                  <input
                    type="text"
                    value={formData.payment_id}
                    onChange={(e) => setFormData({ ...formData, payment_id: e.target.value })}
                    placeholder="Will be generated based on payment method"
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 "
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setActiveTab(Math.max(1, activeTab - 1))}
                disabled={activeTab === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {activeTab === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#008B8B] text-white  hover:bg-[#006666] disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Customer'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab(Math.min(4, activeTab + 1))}
                  className="px-4 py-2 bg-[#008B8B] text-white  hover:bg-[#006666]"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
