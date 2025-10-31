import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { t, i18n } = useTranslation();
  const [userType, setUserType] = useState('ADMIN');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'mr', name: 'मराठी (Marathi)' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://82.29.162.153/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginId,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== userType) {
          setError(`Please select ${data.user.role} as user type`);
          setLoading(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            loginId,
            userType
          }));
        }

        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onLoginSuccess(data.user);
      } else {
        setError(data.detail || t('invalidCredentials'));
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <button
          onClick={() => setShowLanguageModal(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Globe size={20} />
          <span className="text-sm font-medium">{t('language')}</span>
        </button>
        
        <h1 className="text-lg font-bold text-blue-600">{t('login')}</h1>
        
        <button
          onClick={() => setShowHelpModal(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <HelpCircle size={20} />
          <span className="text-sm font-medium">{t('help')}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">AIS</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">AutoISPBilling</h2>
            <p className="text-gray-600">{t('welcome')}</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* User Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="userType">{t('selectUserType')}</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t('admin')}</SelectItem>
                  <SelectItem value="EMPLOYEE">{t('employee')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Login ID */}
            <div className="space-y-2">
              <Label htmlFor="loginId">{t('loginId')}</Label>
              <Input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder={t('loginId')}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  {t('rememberMe')}
                </label>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('forgotPassword')}
              </button>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={loading || !loginId || !password}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Loading...' : t('loginButton')}
            </Button>

            {/* Terms & Privacy */}
            <div className="text-center text-xs text-gray-600 space-y-1">
              <p>
                {t('byLoggingIn')}{' '}
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  {t('termsConditions')}
                </button>
              </p>
              <p>
                {t('readOur')}{' '}
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  {t('privacyPolicy')}
                </button>
              </p>
            </div>

            {/* Helpline */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                {t('helpline')}: <a href="tel:+919826384268" className="text-blue-600 font-medium">+91 98263 84268</a>
              </p>
            </div>
          </div>

          {/* Image Gallery Placeholder */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">Image {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Language Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('language')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-3 text-left rounded-lg border ${
                  i18n.language === lang.code
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('helpTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="font-semibold">{t('faqTitle')}</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm">Q: How do I reset my password?</p>
                <p className="text-sm text-gray-600">A: Contact your administrator or call our helpline at +91 98263 84268.</p>
              </div>
              <div>
                <p className="font-medium text-sm">Q: What if I forgot my login ID?</p>
                <p className="text-sm text-gray-600">A: Please contact your administrator for assistance.</p>
              </div>
              <div>
                <p className="font-medium text-sm">Q: How do I enable location services?</p>
                <p className="text-sm text-gray-600">A: Go to Settings → Apps → AutoISPBilling → Permissions → Location and enable it.</p>
              </div>
              <div>
                <p className="font-medium text-sm">Q: Who can I contact for technical support?</p>
                <p className="text-sm text-gray-600">A: Call our helpline at +91 98263 84268 or email support@autoispbilling.com</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('termsTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700">
            <p>Welcome to AutoISPBilling. By using this application, you agree to the following terms and conditions:</p>
            <h4 className="font-semibold">1. Acceptance of Terms</h4>
            <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
            <h4 className="font-semibold">2. Use License</h4>
            <p>Permission is granted to use this application for business purposes only. This is the grant of a license, not a transfer of title.</p>
            <h4 className="font-semibold">3. User Responsibilities</h4>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            <h4 className="font-semibold">4. Location Tracking</h4>
            <p>For employees, this application tracks your location during work hours for operational purposes. By logging in, you consent to location tracking.</p>
            <h4 className="font-semibold">5. Data Security</h4>
            <p>We implement security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
            <h4 className="font-semibold">6. Modifications</h4>
            <p>We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the new terms.</p>
            <p className="pt-2">For questions about these terms, contact us at +91 98263 84268.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('privacyTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700">
            <p>AutoISPBilling is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>
            <h4 className="font-semibold">1. Information We Collect</h4>
            <p>We collect information you provide directly, including name, email, phone number, and login credentials. For employees, we also collect location data during work hours.</p>
            <h4 className="font-semibold">2. How We Use Your Information</h4>
            <p>Your information is used to provide and improve our services, authenticate users, track employee locations for operational purposes, and communicate important updates.</p>
            <h4 className="font-semibold">3. Location Data</h4>
            <p>Employee location data is collected only during work hours and is used for operational tracking, route optimization, and attendance verification. Location data is stored securely and accessed only by authorized administrators.</p>
            <h4 className="font-semibold">4. Data Security</h4>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data.</p>
            <h4 className="font-semibold">5. Data Sharing</h4>
            <p>We do not sell or share your personal information with third parties except as required by law or with your explicit consent.</p>
            <h4 className="font-semibold">6. Your Rights</h4>
            <p>You have the right to access, correct, or delete your personal information. Contact your administrator or our support team for assistance.</p>
            <h4 className="font-semibold">7. Contact Us</h4>
            <p>For privacy concerns or questions, contact us at +91 98263 84268 or email privacy@autoispbilling.com</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPasswordModal} onOpenChange={setShowForgotPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('forgotPassword')}</DialogTitle>
            <DialogDescription>
              Please contact your administrator or call our helpline for password reset assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Helpline Number</p>
              <a href="tel:+919826384268" className="text-lg font-bold text-blue-600">
                +91 98263 84268
              </a>
            </div>
            <Button onClick={() => setShowForgotPasswordModal(false)} className="w-full">
              {t('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
