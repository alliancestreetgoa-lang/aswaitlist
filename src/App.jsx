import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  CheckCircle2, ShieldCheck, Bell, Compass, Users, Building2, Landmark,
  Quote, Globe, Star, ChevronDown, ChevronUp, Check, ArrowRight, BadgeCheck,
  Mail, Phone,
} from 'lucide-react';
import './App.css';
import { runScrollAnimations } from './scrollAnimations';

gsap.registerPlugin(useGSAP);

const BOOKING_URL = 'https://www.alliancestreet.ae';

// Vite only rewrites asset paths it can see (CSS url(), imports). Plain
// strings in JSX and inline styles need the base prefix applied by hand,
// or they 404 when the site is served from a subpath (GitHub Pages).
const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;

// alliancestreet.ae background palette (dark canvas)
const BG = '#0A0A0A';
const BONE = '#EDEAE3';
const BONE_DIM = '#9A9A9F';
const LINE = 'rgba(255,255,255,0.11)';

// white "paperwork" card palette (form, testimonials, stat cards)
const WHITE = '#FFFFFF';
const CARD_INK = '#111113';
const CARD_MUTED = '#55555C';
const CARD_FAINT = '#7C7C84';
const CARD_LABEL = '#3A3A42';
const CARD_BORDER = '#E7E7EC';
const INPUT_BORDER = '#D8D8DE';

// dark-glass form palette (hero signup card sits over the skyline photo)
const GLASS_FIELD = 'rgba(18,18,20,0.88)';
const GLASS_FIELD_BORDER = 'rgba(255,255,255,0.22)';
const GLASS_DIVIDER = 'rgba(255,255,255,0.16)';
const GLASS_DIM = '#CFCFD4';   // dim text that still clears AA over the photo
const GLASS_PANEL = 'rgba(18,18,20,0.60)';

// alternating section tone: sections run black -> white -> black -> ...
const LIGHT_BG = '#FFFFFF';

const COUNTRIES = [
  { code: 'GB', label: 'United Kingdom (+44)', dial: '+44' },
  { code: 'IE', label: 'Ireland (+353)', dial: '+353' },
  { code: 'DE', label: 'Germany (+49)', dial: '+49' },
  { code: 'FR', label: 'France (+33)', dial: '+33' },
  { code: 'NL', label: 'Netherlands (+31)', dial: '+31' },
  { code: 'ES', label: 'Spain (+34)', dial: '+34' },
  { code: 'IT', label: 'Italy (+39)', dial: '+39' },
  { code: 'CH', label: 'Switzerland (+41)', dial: '+41' },
  { code: 'AE', label: 'United Arab Emirates (+971)', dial: '+971' },
  { code: 'US', label: 'United States (+1)', dial: '+1' },
  { code: 'ZA', label: 'South Africa (+27)', dial: '+27' },
  { code: 'IN', label: 'India (+91)', dial: '+91' },
];

const FAQS = [
  ['Is this the final webinar registration?', 'No. This is the priority list. Registration details are sent separately once the next session date is confirmed.'],
  ['Does joining guarantee a place?', 'No. Places are limited and applicants are shortlisted based on relevance to the session topic.'],
  ['Is it free to join?', 'Yes. Joining the priority list is free and carries no obligation.'],
  ['Why do I need to verify my WhatsApp number?', 'Verification makes sure webinar updates reach the correct person and reduces false or duplicate entries.'],
  ['When will I receive an update?', 'You will hear from us as soon as the next session date is released, by email and WhatsApp.'],
  ['Can I speak with someone before the webinar?', 'Yes. After joining the waitlist, you may book a consultation if your situation is time-sensitive.'],
];

const TESTIMONIALS = [
  { quote: 'We’ve got our visas, bank accounts start to be opened, and we’ve just really benefited from his full ground knowledge of the, UK, tax and banking system and the same in The UAE. And, I wouldn’t feel happier in anyone else’s hands!', name: 'Charlotte', company: 'Henley Finance' },
  { quote: 'They are providing all of the education and resources that you need to understand that you’re making a really good decision for your life and your business. So if you’re on the fence, don’t hesitate. Just reach out, and then they’re more than happy to help you.', name: 'Phaibion', company: 'Royal Energy Marketing' },
  { quote: 'I could see that he understood the needs and requirements of our company. We embarked on the process, arrived in The UAE, and it’s been a seamless flow of meetings, and we have everything in place for our new business life in The UAE.', name: 'Richard', company: 'Padbrook Finance' },
];

function initials(name) {
  return name.trim().charAt(0).toUpperCase();
}

function Avatar({ name }) {
  return (
    <span style={{
      width: 52, height: 52, borderRadius: 999, flex: 'none',
      background: 'rgba(228,20,26,0.09)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
        fontSize: 20, color: '#E4141A',
      }}>{initials(name)}</span>
    </span>
  );
}

function Logo() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img className="asc-logo-mark" src={asset("images/logo.png")} alt="Alliance Street" style={{ height: 34, width: 'auto', display: 'block', flex: 'none' }} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 20, lineHeight: 1, color: BONE }}>Alliance Street</span>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.34em', fontSize: 11, lineHeight: 1, color: BONE_DIM }}>Group</span>
      </span>
    </span>
  );
}

function Header() {
  return (
    <header className="asc-pad" style={{
      position: 'sticky', top: 0, zIndex: 40, display: 'flex', flexWrap: 'wrap',
      alignItems: 'center', justifyContent: 'space-between', gap: '16px 24px',
      padding: '14px 48px', background: 'rgba(10,10,10,.92)', backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${LINE}`,
    }}>
      <a href="#top"><Logo /></a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span className="asc-support" style={{ fontSize: 15, color: BONE_DIM }}>Already need support?</span>
        <a href={BOOKING_URL} target="_blank" rel="noopener" className="asc-book-link" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.04em', fontSize: 17, color: WHITE, background: '#E4141A',
          borderRadius: 10, padding: '12px 24px',
        }}>Book a Call</a>
      </div>
    </header>
  );
}

function StepBar({ n, active }) {
  return <div style={{ height: 4, borderRadius: 999, background: active ? '#E4141A' : 'rgba(255,255,255,0.20)' }} />;
}

function WebinarForm() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('GB');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verifySent, setVerifySent] = useState(false);
  const [error, setError] = useState('');

  const dialCode = (COUNTRIES.find((c) => c.code === country) || COUNTRIES[0]).dial;
  const fullPhone = `${dialCode} ${phone || '—'}`;

  const onVerify = () => {
    if (!phone.trim()) return setError('Enter your WhatsApp number first.');
    setVerifySent(true);
    setError('');
  };

  const onContinue = () => {
    if (!firstName.trim() || !lastName.trim()) return setError('Please add your first and last name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Please enter a valid work email address.');
    if (!verifySent) return setError('Select "Verify WhatsApp Number" to receive your code.');
    setStep(2);
    setError('');
  };

  const onConfirmCode = () => {
    if (code.length !== 6) return setError('Enter the full six-digit code.');
    setStep(3);
    setError('');
  };

  const onBack = () => { setStep(1); setError(''); };

  const stepLabel = ['Contact details', 'Verification', 'Confirmed'][step - 1];
  const verifyNote = error || (verifySent
    ? 'A one-time six-digit code is on its way to your WhatsApp. Select Continue to enter it.'
    : 'Number not verified. Select "Verify WhatsApp Number" and we will send a one-time six-digit code to that number.');
  const codeHint = error || 'Didn’t arrive? Codes can take up to a minute.';

  return (
    <div id="form" className="asc-form-card hero-form" style={{
      position: 'sticky', top: 96,
      borderRadius: 22, padding: '24px 26px 22px',
      color: BONE,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', fontSize: 15, color: '#E4141A' }}>Step {step} of 3</span>
        <span style={{ fontSize: 15, color: GLASS_DIM }}>{stepLabel}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
        <StepBar active />
        <StepBar active={step >= 2} />
        <StepBar active={step >= 3} />
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <div className="asc-names" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15, color: BONE }}>First name
              <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(''); }}
                style={{ width: '100%', height: 38, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 10, padding: '0 14px', fontSize: 16, color: BONE, background: GLASS_FIELD }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15, color: BONE }}>Last name
              <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setError(''); }}
                style={{ width: '100%', height: 38, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 10, padding: '0 14px', fontSize: 16, color: BONE, background: GLASS_FIELD }} />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15, color: BONE }}>Work email address
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={{ width: '100%', height: 38, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 10, padding: '0 14px', fontSize: 16, color: BONE, background: GLASS_FIELD }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15, color: BONE }}>Country
            <select value={country} onChange={(e) => { setCountry(e.target.value); setError(''); }}
              style={{ width: '100%', height: 38, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 10, padding: '0 12px', fontSize: 16, color: BONE, background: GLASS_FIELD }}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15, color: BONE }}>
            WhatsApp number
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 38, minWidth: 56, flex: 'none', padding: '0 12px', borderRadius: 10, background: GLASS_FIELD, border: `1px solid ${GLASS_FIELD_BORDER}`, fontWeight: 600, fontSize: 16, color: BONE }}>{dialCode}</span>
              <input type="tel" placeholder="7700 900123" aria-label="WhatsApp number" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }}
                style={{ flex: '1 1 130px', minWidth: 0, height: 38, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 10, padding: '0 14px', fontSize: 16, color: BONE, background: GLASS_FIELD }} />
              <button type="button" onClick={onVerify} className="asc-verify-btn" style={{
                flex: '0 1 auto', height: 38, padding: '0 16px', border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 10,
                background: GLASS_FIELD, color: BONE, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{verifySent ? 'Code sent' : 'Verify WhatsApp Number'}</button>
            </div>
            <span style={{ fontSize: 13, color: GLASS_DIM }}>Country code is preselected from your country.</span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: GLASS_PANEL, border: `1px solid ${GLASS_DIVIDER}`, borderRadius: 12, padding: '11px 14px' }}>
            <ShieldCheck size={18} style={{ color: '#E4141A', flex: 'none', marginTop: 2 }} />
            <span style={{ fontSize: 14, lineHeight: 1.5, color: BONE }}>{verifyNote}</span>
          </div>

          <span style={{ fontSize: 14, color: GLASS_DIM }}>We verify your number to make sure webinar updates reach the correct person.</span>

          <button type="button" onClick={onContinue} className="asc-cta-primary" style={{
            width: '100%', height: 46, border: 0, borderRadius: 12, background: '#E4141A', color: WHITE,
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
            fontSize: 20, cursor: 'pointer', boxShadow: '0 8px 24px rgba(228,20,26,.28)',
          }}>Continue</button>

          <span style={{ fontSize: 12, lineHeight: 1.5, color: GLASS_DIM }}>Your details will be used to assess whether the upcoming webinar is relevant to you. Selected participants will receive registration information by email and WhatsApp.</span>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 26 }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.02em', fontSize: 26, color: BONE }}>Confirm your number</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: GLASS_DIM }}>Enter the six-digit code we sent to <strong style={{ color: BONE }}>{fullPhone}</strong> on WhatsApp.</p>
          </div>
          <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" aria-label="Six-digit verification code" value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            style={{ width: '100%', height: 60, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 12, padding: '0 18px', fontFamily: "'Anton',sans-serif", fontSize: 30, letterSpacing: '.42em', color: BONE, background: GLASS_FIELD }} />
          <span style={{ fontSize: 14, color: GLASS_DIM }}>{codeHint}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="button" onClick={onConfirmCode} className="asc-cta-primary" style={{
              width: '100%', height: 46, border: 0, borderRadius: 12, background: '#E4141A', color: WHITE,
              fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
              fontSize: 20, cursor: 'pointer', boxShadow: '0 8px 24px rgba(228,20,26,.28)',
            }}>Confirm &amp; join the list</button>
            <button type="button" onClick={onBack} className="asc-cta-ghost" style={{
              width: '100%', height: 38, border: `1px solid ${GLASS_FIELD_BORDER}`, borderRadius: 12, background: 'rgba(255,255,255,0.08)',
              color: BONE, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.04em', fontSize: 16, cursor: 'pointer',
            }}>Back to details</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 30, alignItems: 'flex-start' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 999, background: '#E4141A' }}>
            <Check size={28} style={{ color: WHITE }} />
          </span>
          <h2 style={{ margin: 0, fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 36, lineHeight: 1, color: BONE }}>You&apos;re on the list</h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: GLASS_DIM }}>Thank you, {firstName || 'there'}. Your interest has been recorded. When the next live session is released, shortlisted applicants receive the registration details by email and WhatsApp first.</p>
          <div style={{ width: '100%', borderTop: `1px solid ${GLASS_DIVIDER}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, color: GLASS_DIM }}>Confirmation sent to</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: BONE }}>{email || '—'}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: BONE }}>{fullPhone}</span>
          </div>
          <a href={BOOKING_URL} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 17, color: '#E4141A' }}>
            Book a call in the meantime <ArrowRight size={18} />
          </a>
        </div>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="asc-pad asc-sec asc-hero" style={{
      position: 'relative', overflow: 'hidden', padding: '20px 48px 24px', background: BG,
      minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center',
    }}>
      {/* Parallax layer: over-sized top and bottom so it can drift without
          exposing an edge. Separate from the scrim so only this moves. */}
      <div className="asc-hero-bg" aria-hidden="true" style={{
        position: 'absolute', top: '-12%', left: 0, right: 0, bottom: '-12%',
        backgroundImage: `url('${asset('images/hero-dubai-skyline.jpg')}')`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        willChange: 'transform',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.80) 42%, rgba(10,10,10,0.35) 100%)',
          'linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.15) 45%, rgba(10,10,10,0.96) 100%)',
        ].join(', '),
      }} />
      <div className="asc-hero-grid" style={{ position: 'relative', zIndex: 1, width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,.95fr)', gap: 56, alignItems: 'center', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', border: '1px solid rgba(228,20,26,0.5)', background: 'rgba(228,20,26,0.12)', borderRadius: 999, padding: '9px 18px' }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: '#E4141A', display: 'block' }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', fontSize: 14, color: BONE }}>Priority Access Webinar Series</span>
          </div>

          <h1 className="hero-title" style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(40px,4.2vw,68px)', lineHeight: 0.94, letterSpacing: '.005em', color: BONE, textWrap: 'balance' }}>
            Join the Priority List for Our Next <span style={{ color: '#E4141A' }}>Live Webinar</span>
          </h1>

          <div className="hero-rule" style={{ width: 64, height: 3, background: '#E4141A' }} />

          <p className="hero-copy" style={{ margin: 0, maxWidth: 560, fontSize: 17, lineHeight: 1.55, color: BONE_DIM, textWrap: 'pretty' }}>Alliance Street hosts private live sessions for UK and internationally active business owners who want to understand UAE company structures, international tax considerations, banking, relocation, and business expansion more clearly.</p>

          <p className="hero-copy" style={{ margin: 0, maxWidth: 560, fontSize: 17, lineHeight: 1.55, color: BONE_DIM, textWrap: 'pretty' }}>Register your interest below. When the next session is released, shortlisted applicants will be among the first to receive the registration details.</p>

          <div className="asc-checks hero-checks" style={{ display: 'flex', flexWrap: 'wrap', gap: 22, marginTop: 2 }}>
            {['Free to join', 'Priority notification', 'No obligation'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} style={{ color: '#E4141A' }} />
                <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 500, fontSize: 17, color: BONE }}>{t}</span>
              </div>
            ))}
          </div>

          <div className="asc-stat-card hero-stat asc-card" style={{ marginTop: 4, display: 'inline-flex', flexWrap: 'wrap', gap: 30, alignSelf: 'flex-start', background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: '16px 24px', boxShadow: '0 10px 30px rgba(228,20,26,.14)' }}>
            {[[0, '%', 'Personal income tax'], [100, '%', 'Foreign ownership'], [8, ' HRS', 'London to Dubai']].map(([value, suffix, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="stat-number" data-count={value} data-suffix={suffix} style={{ fontFamily: "'Anton',sans-serif", fontSize: 28, lineHeight: 1, color: '#E4141A' }}>0{suffix}</span>
                <span style={{ fontSize: 12, letterSpacing: '.10em', textTransform: 'uppercase', color: CARD_MUTED }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <WebinarForm />
      </div>
    </section>
  );
}

function Why() {
  const items = [
    [Bell, 'Priority Notification', 'Be among the first to know when the next webinar date is announced.'],
    [Compass, 'Practical Guidance', 'Learn through real business scenarios, common structuring mistakes, and practical examples.'],
    [Users, 'Live Access', 'Shortlisted attendees may receive access to live explanations and Q&A opportunities.'],
  ];
  return (
    <section id="why" className="asc-pad asc-sec" style={{ padding: '88px 48px 96px', background: LIGHT_BG }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 44 }}>
        <h2 className="split-head" style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)', lineHeight: 1, letterSpacing: '.005em', color: CARD_INK }}>
          Why join the <span style={{ color: '#E4141A' }}>priority list</span>
        </h2>
        <div className="asc-why-grid js-why-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 28 }}>
          {items.map(([Icon, title, body]) => (
            <div key={title} className="asc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 18, padding: '28px 28px 32px', boxShadow: '0 10px 30px rgba(228,20,26,.14)' }}>
              <span className="asc-icon-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 999, background: 'rgba(228,20,26,0.09)' }}>
                <Icon size={22} style={{ color: '#E4141A' }} />
              </span>
              <h3 style={{ margin: 0, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', fontSize: 24, lineHeight: 1.1, color: CARD_INK }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#4A4A52', textWrap: 'pretty' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cover() {
  const items = [
    [Building2, 'How UAE business structures work'],
    [Compass, 'When a UAE setup may or may not make sense'],
    [ShieldCheck, 'Common international tax and compliance mistakes'],
    [Landmark, 'Banking, relocation, and growth considerations'],
  ];
  return (
    <section id="cover" className="asc-pad asc-sec" style={{ position: 'relative', overflow: 'hidden', padding: '88px 48px 96px', background: BG }}>
      <div className="cover-glow" aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(110% 80% at 85% 0%,rgba(228,20,26,0.10) 0%,rgba(10,10,10,0) 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 className="split-head" style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)', lineHeight: 1, color: BONE }}>
          What the webinar <span style={{ color: '#E4141A' }}>may cover</span>
        </h2>
        <div className="asc-cover-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 24 }}>
          {items.map(([Icon, text]) => (
            <div key={text} className="cover-item asc-card" style={{ display: 'flex', alignItems: 'center', gap: 20, background: WHITE, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 10px 30px rgba(228,20,26,.14)', borderRadius: 18, padding: '24px 26px' }}>
              <span className="asc-icon-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 999, background: 'rgba(228,20,26,0.09)', flex: 'none' }}>
                <Icon size={22} style={{ color: '#E4141A' }} />
              </span>
              <span style={{ fontSize: 19, lineHeight: 1.4, color: CARD_INK }}>{text}</span>
            </div>
          ))}
        </div>
        <span className="reveal" style={{ fontSize: 14, color: BONE_DIM }}>Final webinar topics may vary depending on the session.</span>
      </div>
    </section>
  );
}

function Host() {
  return (
    <section id="host" className="asc-pad asc-sec" style={{ padding: '96px 48px', background: LIGHT_BG }}>
      <div className="asc-host-grid" style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,.8fr) minmax(0,1.2fr)', gap: 72, alignItems: 'center' }}>
        <div className="host-portrait" style={{ width: '100%', aspectRatio: '4/5', borderRadius: 22, overflow: 'hidden', boxShadow: '0 18px 44px rgba(228,20,26,.28)' }}>
          <img src={asset("images/host-portrait.webp")} alt="Stallone Shaikh, Founder of Alliance Street Group" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div className="host-copy" style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', fontSize: 14, color: '#F43A3F' }}>Your host</span>
          <h2 style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)', lineHeight: 1, color: CARD_INK }}>Hosted by Stallone Shaikh</h2>
          <span style={{ fontSize: 19, color: CARD_MUTED }}>Founder, Alliance Street Group</span>
          <div style={{ width: 64, height: 3, background: '#E4141A', margin: '6px 0' }} />
          <p style={{ margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.65, color: CARD_MUTED, textWrap: 'pretty' }}>Stallone works with entrepreneurs, internationally active businesses, and investors seeking practical guidance on UAE company formation, banking, international expansion, and compliant cross-border business structures.</p>
          <a href="#top" className="asc-cta-pill-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 10, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 17, color: CARD_INK, background: WHITE, border: `1px solid ${INPUT_BORDER}`, borderRadius: 999, padding: '14px 28px' }}>Learn More About Alliance Street</a>
        </div>
      </div>
    </section>
  );
}

function Credibility() {
  const stats = [
    [Globe, 'Countries served', '[Placeholder — list of countries to be confirmed]'],
    [Building2, 'Industries supported', '[Placeholder — industries to be confirmed]'],
    [Star, 'Reviews and ratings', '[Placeholder — Google / Trustpilot rating widget]'],
  ];
  return (
    <section id="credibility" className="asc-pad asc-sec" style={{ padding: '88px 48px 96px', background: BG }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className="split-head" style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)', lineHeight: 1, color: BONE }}>
            Credibility and <span style={{ color: '#E4141A' }}>reach</span>
          </h2>
          <p className="reveal" style={{ margin: 0, maxWidth: 660, fontSize: 17, lineHeight: 1.6, color: BONE_DIM, textWrap: 'pretty' }}>Clients who have completed the process with Alliance Street, in their own words.</p>
        </div>
        <div className="asc-why-grid js-testimonials" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 28, alignItems: 'stretch' }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="asc-glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 18, borderRadius: 18, padding: 28 }}>
              <Quote size={26} style={{ color: '#E4141A' }} />
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.62, color: CARD_LABEL, textWrap: 'pretty' }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14, paddingTop: 6, borderTop: '1px solid #EFEFF3' }}>
                <Avatar name={t.name} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 20, lineHeight: 1, color: CARD_INK }}>{t.name}</span>
                  <span style={{ fontSize: 15, color: CARD_MUTED }}>{t.company}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="asc-why-grid js-credstats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 28 }}>
          {stats.map(([Icon, title, body]) => (
            <div key={title} className="asc-glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 18, padding: 28 }}>
              <Icon className="asc-icon-badge" size={24} style={{ color: '#E4141A' }} />
              <h3 style={{ margin: 0, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', fontSize: 22, color: CARD_INK }}>{title}</h3>
              <span style={{ fontSize: 16, lineHeight: 1.55, color: CARD_MUTED }}>{body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(5);
  return (
    <section id="faq" className="asc-pad asc-sec" style={{ padding: '88px 48px 104px', background: LIGHT_BG }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
        <h2 className="split-head" style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)', lineHeight: 1, color: CARD_INK }}>
          Frequently asked <span style={{ color: '#E4141A' }}>questions</span>
        </h2>
        <div className="js-faq" style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="asc-faq-row" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
                  background: 'none', border: 0, padding: '22px 0', cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 600, fontSize: 19, lineHeight: 1.4, color: CARD_INK }}>{q}</span>
                  {isOpen ? <ChevronUp size={20} style={{ color: CARD_FAINT, flex: 'none' }} /> : <ChevronDown size={20} style={{ color: CARD_FAINT, flex: 'none' }} />}
                </button>
                {isOpen && <p style={{ margin: 0, padding: '0 0 24px', maxWidth: 820, fontSize: 17, lineHeight: 1.6, color: CARD_MUTED, textWrap: 'pretty' }}>{a}</p>}
              </div>
            );
          })}
          <div style={{ borderTop: `1px solid ${CARD_BORDER}` }} />
        </div>
      </div>
    </section>
  );
}

function Book() {
  return (
    <section id="book" className="asc-pad asc-sec" style={{ position: 'relative', overflow: 'hidden', padding: '104px 48px 112px', background: BG }}>
      <div className="book-glow" aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 100% at 50% 0%,rgba(228,20,26,0.12) 0%,rgba(10,10,10,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
        <BadgeCheck className="book-icon" size={40} style={{ color: '#E4141A' }} />
        <h2 className="split-head" style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(34px,3.6vw,56px)', lineHeight: 1, color: BONE }}>
          Would You Rather <span style={{ color: '#E4141A' }}>Not Wait?</span>
        </h2>
        <p className="reveal" style={{ margin: 0, maxWidth: 720, fontSize: 19, lineHeight: 1.6, color: BONE_DIM, textWrap: 'pretty' }}>If you are currently considering a UAE company, international structure, relocation, banking solution, or business expansion, you can speak with our team before the webinar.</p>
        <div className="asc-cta-row book-cta" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <a href={BOOKING_URL} target="_blank" rel="noopener" className="asc-book-link" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 19, color: WHITE,
            background: '#E4141A', borderRadius: 999, padding: '17px 34px', boxShadow: '0 0 30px rgba(228,20,26,.45)',
          }}>Book a Consultation</a>
          <a href="#form" className="asc-cta-pill-outline" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 19, color: BONE,
            background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '17px 34px',
          }}>I&apos;ll Wait for the Webinar</a>
        </div>
        <span className="reveal" style={{ fontSize: 14, color: BONE_DIM }}>Choose a convenient time to discuss your current situation with an Alliance Street adviser.</span>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="asc-pad asc-sec-sm" style={{ padding: '72px 48px 40px', background: BG, borderTop: `1px solid ${LINE}` }}>
      <div className="asc-footer-grid reveal-group" style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)', gap: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 420 }}>
          <Logo />
          <span style={{ fontSize: 16, lineHeight: 1.6, color: BONE_DIM, textWrap: 'pretty' }}>Company formation, international structuring, banking and relocation guidance for internationally active business owners.</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <a href="mailto:info@alliancestreet.ae" className="asc-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 16, color: BONE }}>
              <Mail size={18} style={{ color: '#E4141A', flex: 'none' }} />info@alliancestreet.ae
            </a>
            <a href="tel:+97142627928" className="asc-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 16, color: BONE }}>
              <Phone size={18} style={{ color: '#E4141A', flex: 'none' }} />+971 4 262 7928
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.20em', fontSize: 13, color: BONE_DIM }}>Legal</span>
          <a href="#top" style={{ fontSize: 16, color: BONE_DIM }}>Privacy Policy</a>
          <a href="#top" style={{ fontSize: 16, color: BONE_DIM }}>Terms and Conditions</a>
          <a href="mailto:info@alliancestreet.ae" style={{ fontSize: 16, color: BONE_DIM }}>Contact</a>
          <a href="https://www.alliancestreet.ae" target="_blank" rel="noopener" style={{ fontSize: 16, color: BONE_DIM }}>Website</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.20em', fontSize: 13, color: BONE_DIM }}>Follow</span>
          <a href="https://www.linkedin.com/company/79507309/admin/dashboard/" target="_blank" rel="noopener" style={{ fontSize: 16, color: BONE_DIM }}>LinkedIn</a>
          <a href="https://www.instagram.com/alliancestreetconsultancy/" target="_blank" rel="noopener" style={{ fontSize: 16, color: BONE_DIM }}>Instagram</a>
          <a href="https://www.youtube.com/@Alliancestreetconsultancy22" target="_blank" rel="noopener" style={{ fontSize: 16, color: BONE_DIM }}>YouTube</a>
        </div>
      </div>
      <div style={{ maxWidth: 1360, margin: '44px auto 0', paddingTop: 24, borderTop: `1px solid ${LINE}`, display: 'flex', flexWrap: 'wrap', gap: '16px 32px', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, lineHeight: 1.6, color: BONE_DIM, maxWidth: 640 }}>This is not tax advice. Always seek professional advice for your specific situation.</span>
        <span style={{ fontSize: 14, color: BONE_DIM }}>© 2026 Alliance Street Group</span>
      </div>
    </footer>
  );
}

export default function App() {
  const rootRef = useRef(null);

  useGSAP(() => {
    // returns a cleanup that kills ScrollTriggers and reverts SplitText
    return runScrollAnimations();
  }, { scope: rootRef });

  return (
    <div className="asc-page grain" ref={rootRef}>
      <div className="asc-progress" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <Why />
        <Cover />
        <Host />
        <Credibility />
        <Faq />
        <Book />
      </main>
      <Footer />
    </div>
  );
}
