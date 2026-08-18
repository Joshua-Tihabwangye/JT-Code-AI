import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import PasswordField from '@/auth/PasswordField';
import EmailField from '@/auth/EmailField';
import SocialButtons from '@/auth/SocialButtons';
import { supabase } from '@/lib/supabase';

type OAuthStrategy = 'google' | 'github';

const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Korea, North',
  'Korea, South',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

const countryToTimezones: Record<string, string[]> = {
  'United States': ['America/Anchorage', 'America/Chicago', 'America/Denver', 'America/Detroit', 'America/Houston', 'America/Indiana/Indianapolis', 'America/Kentucky/Louisville', 'America/Los_Angeles', 'America/New_York', 'America/Phoenix', 'America/Port_Au'],

  'Canada': ['America/Blanc-Sablon', 'America/St_Johns', 'America/Halifax', 'America/Goose_Bay', 'America/Moncton', 'America/Toronto', 'America/Winnipeg', 'America/Regina', 'America/Edmonton', 'America/Vancouver', 'America/Whitehorse', 'America/Yellowknife'],

  'United Kingdom': ['Europe/London'],

  'Germany': ['Europe/Berlin'],

  'France': ['Europe/Paris'],

  'India': ['Asia/Kolkata'],

  'China': ['Asia/Shanghai'],

  'Japan': ['Asia/Tokyo'],

  'Australia': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Hobart', 'Australia/Perth'],

  'Brazil': ['America/Fortaleza', 'America/Sao_Paulo', 'America/Boa_Ventura'],

  'Russia': ['Europe/Moscow', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Irkutsk', 'Asia/Krasnoyarsk', 'Asia/Vladivostok'],

  ' Mexico': ['America/Mexico_City', 'America/Cancun', 'America/Guadalajara'],

  'South Africa': ['Africa/Johannesburg'],

  'Egypt': ['Africa/Cairo'],

  'Argentina': ['America/Argentina/Buenos_Aires', 'America/Argentina/Cordoba', 'America/Argentina/Mendoza'],

  'Chile': ['America/Santiago', 'America/Punta_Arenas', 'America/South_Point'],

  'Colombia': ['America/Bogota', 'America/Bogota'],

  'Spain': ['Europe/Madrid', 'Atlantic/Canary'],

  'Italy': ['Europe/Rome'],

  'Poland': ['Europe/Warsaw'],

  'Netherlands': ['Europe/Amsterdam'],

  'Sweden': ['Europe/Stockholm'],

  default: ['UTC'],
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [contact, setContact] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (country && countryToTimezones[country]) {
      setTimezone(countryToTimezones[country][0] || 'UTC');
    }
  }, [country]);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!accepted) {
      setErrorMsg('Please agree to the Terms and Privacy Policy.');
      return;
    }
    if (!country) {
      setErrorMsg('Please select a country.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            contact: contact || '',
            country: country,
            timezone: timezone || '',
          },
        },
      });
      if (error) {
        setErrorMsg(error.message || 'Unable to create your account.');
      } else if (data.session) {
        void navigate('/app/chat');
      } else {
        setVerifyEmail(email);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuth = async (strategy: OAuthStrategy) => {
    setErrorMsg('');
    if (!accepted) {
      setErrorMsg('Please agree to the Terms and Privacy Policy before continuing.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: strategy,
      options: {
        redirectTo: window.location.origin + '/sso-callback',
      },
    });
    if (error) setErrorMsg(error.message || 'Unable to start OAuth sign up.');
  };

  return (
    <AuthLayout>
      {verifyEmail ? (
        <div className="auth-card auth-card--signup">
          <div className="auth-card__heading auth-card__heading--signup">
            <h2>Check your email</h2>
            <p>
              We've sent a verification link to <strong>{verifyEmail}</strong>. Click the link in the
              email to activate your account, then sign in.
            </p>
          </div>
          <Link to="/sign-in" className="primary-button primary-button--link">Go to sign in</Link>
        </div>
      ) : (
        <div className="auth-card auth-card--signup">
        <div className="auth-card__heading auth-card__heading--signup">
          <h2>Create your account</h2>
          <p>Start your journey with JT-Code</p>
        </div>

        <SocialButtons
          onGoogle={() => startOAuth('google')}
          onGithub={() => startOAuth('github')}
          disabled={isLoading}
        />

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={(event) => void handleSignUp(event)} className="auth-form auth-form--compact">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              autoComplete="given-name"
              className="auth-input"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
              className="auth-input"
              required
            />
          </div>

          <EmailField
            id="signup-email"
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <PasswordField
            id="signup-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+"
              autoComplete="tel"
              className="auth-input"
              required
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="auth-select"
              required
            >
              <option value="" disabled>
                Select country
              </option>
              {countries.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="auth-select"
            >
              <option value="" disabled>
                Select timezone
              </option>
              {countryToTimezones[country] && countryToTimezones[country].map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
              {country && !countryToTimezones[country] && (
                <option value="UTC">UTC</option>
              )}
            </select>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+"
              autoComplete="tel"
              className="auth-input"
              required
            />
          </div>

          <label className="checkbox-row checkbox-row--terms">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
            <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></span>
          </label>

          {errorMsg && <div className="form-error">{errorMsg}</div>}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__switch auth-card__switch--signup">
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </p>
        </div>
      )}
    </AuthLayout>
  );
}

export function SignUpPageContainer() {
  return <SignUpPage />;
}