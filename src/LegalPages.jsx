import { ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  RED, WHITE, CARD_INK, CARD_MUTED, CARD_LABEL, CARD_BORDER, LIGHT_BG,
} from './tokens';

/*
 * IMPORTANT — these documents are a drafting starting point, not legal advice.
 * They describe what this codebase actually does today (see the accuracy notes
 * in each section) but they have NOT been reviewed by a qualified adviser, and
 * every [TO CONFIRM] marker is a fact only Alliance Street can supply.
 * Get both reviewed before the page handles real submissions.
 */

const LAST_UPDATED = '7 August 2026';

const h1 = {
  margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400,
  textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)',
  lineHeight: 1, color: CARD_INK,
};
const h2 = {
  margin: '0 0 12px', fontFamily: "'Barlow Condensed',sans-serif",
  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em',
  fontSize: 24, lineHeight: 1.15, color: CARD_INK,
};
const p = {
  margin: '0 0 14px', fontSize: 17, lineHeight: 1.65,
  color: CARD_MUTED, maxWidth: '68ch', textWrap: 'pretty',
};
const li = { fontSize: 17, lineHeight: 1.65, color: CARD_MUTED, marginBottom: 8 };
const ul = { margin: '0 0 14px', paddingLeft: 22, maxWidth: '68ch' };
const section = { display: 'flex', flexDirection: 'column', marginBottom: 38 };

function Confirm({ children }) {
  return (
    <mark style={{
      background: 'rgba(228,20,26,0.10)', color: CARD_INK,
      padding: '1px 6px', borderRadius: 4, fontWeight: 600,
    }}>
      [TO CONFIRM: {children}]
    </mark>
  );
}

function ReviewBanner() {
  return (
    <div role="note" style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      background: 'rgba(228,20,26,0.06)', border: `1px solid rgba(228,20,26,0.35)`,
      borderRadius: 14, padding: '16px 18px', marginBottom: 40, maxWidth: '72ch',
    }}>
      <AlertTriangle size={20} style={{ color: RED, flex: 'none', marginTop: 2 }} />
      <span style={{ fontSize: 15, lineHeight: 1.6, color: CARD_LABEL }}>
        <strong style={{ color: CARD_INK }}>Draft — pending legal review.</strong>{' '}
        This document describes how the site currently works, but it has not been
        reviewed by a qualified adviser. Highlighted items still need confirming,
        and the whole document should be checked against UK/EU and UAE
        requirements before the form accepts real submissions.
      </span>
    </div>
  );
}

function Shell({ title, children }) {
  return (
    <section className="asc-pad asc-sec" style={{ padding: '72px 48px 96px', background: LIGHT_BG }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <a
          href="#top"
          className="asc-cta-pill-outline"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 15,
            color: CARD_INK, background: WHITE, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 999, padding: '10px 20px',
          }}
        >
          <ArrowLeft size={16} /> Back to the priority list
        </a>

        <h1 style={h1}>{title}</h1>
        <div style={{ width: 64, height: 3, background: RED, margin: '18px 0 10px' }} />
        <p style={{ ...p, fontSize: 15 }}>Last updated: {LAST_UPDATED}</p>

        <div style={{ marginTop: 30 }}>
          <ReviewBanner />
          {children}
        </div>
      </div>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <Shell title="Privacy Policy">
      <div style={section}>
        <h2 style={h2}>1. Who we are</h2>
        <p style={p}>
          This page is operated by Alliance Street Group, which provides company
          formation, international structuring, banking and relocation guidance.
          For anything in this policy you can reach us at{' '}
          <a href="mailto:info@alliancestreet.ae" style={{ color: RED }}>info@alliancestreet.ae</a>{' '}
          or +971 4 262 7928.
        </p>
        <p style={p}>
          The data controller is <Confirm>full registered entity name, registration
          number and registered address</Confirm>. If you are in the UK or EU, our
          representative for data protection purposes is{' '}
          <Confirm>UK/EU representative, if one is required</Confirm>.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>2. What we collect</h2>
        <p style={p}>
          If you join the priority list, the form asks you for exactly these
          things and nothing else:
        </p>
        <ul style={ul}>
          <li style={li}>Your first and last name</li>
          <li style={li}>Your work email address</li>
          <li style={li}>The country you select</li>
          <li style={li}>Your WhatsApp number, including its dialling code</li>
          <li style={li}>The six-digit code you enter to verify that number</li>
        </ul>
        <p style={p}>
          We do not ask for financial details, identity documents, or any
          information about your business affairs at this stage.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>3. Cookies, analytics and tracking</h2>
        <p style={p}>
          This page sets no cookies. It runs no analytics, no advertising pixels,
          and no third-party tracking scripts, and it stores nothing in your
          browser. Fonts and images are served from this site rather than from a
          third-party network, so loading the page does not report your visit to
          anyone else.
        </p>
        <p style={p}>
          If tracking or analytics is added later, this section must be updated
          and — for anything beyond strictly necessary cookies — a consent
          mechanism will be required.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>4. Why we use it, and on what basis</h2>
        <ul style={ul}>
          <li style={li}>
            <strong style={{ color: CARD_INK }}>To assess relevance.</strong> Your
            details are used to judge whether the upcoming session suits your
            situation, because places are limited and applicants are shortlisted.
          </li>
          <li style={li}>
            <strong style={{ color: CARD_INK }}>To contact you about the webinar.</strong>{' '}
            If you are shortlisted, we send registration details by email and
            WhatsApp.
          </li>
          <li style={li}>
            <strong style={{ color: CARD_INK }}>To verify your number.</strong> The
            one-time code confirms the number reaches you, and reduces false or
            duplicate entries.
          </li>
        </ul>
        <p style={p}>
          Our lawful basis is <Confirm>consent, or legitimate interests — confirm
          which, and record the reasoning</Confirm>. You can withdraw at any time
          by emailing us; that will not affect anything done beforehand.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>5. WhatsApp verification</h2>
        <p style={p}>
          Verification messages are delivered over WhatsApp, which means your
          number is processed by Meta as part of sending that message. Their
          handling of it is governed by their own terms and privacy policy, not
          this one. We use <Confirm>the WhatsApp Business provider or BSP used to
          send verification codes</Confirm>.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>6. Who else sees your data</h2>
        <p style={p}>
          We do not sell your information, and we do not share it for anyone
          else's marketing. It is handled by our own team and by the suppliers who
          run our systems: <Confirm>the CRM, email platform, form/backend host and
          messaging provider that will receive submissions</Confirm>. Each should
          be under a written processing agreement.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>7. Where your data goes</h2>
        <p style={p}>
          We are based in the UAE and much of our audience is in the UK and Europe,
          so information you give us is likely to be transferred outside the UK/EEA.
          Where that happens we rely on{' '}
          <Confirm>the safeguard used — e.g. UK IDTA, EU standard contractual
          clauses, or an adequacy decision</Confirm>.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>8. How long we keep it</h2>
        <p style={p}>
          We keep priority-list entries for <Confirm>retention period, and what
          triggers deletion</Confirm>, after which they are deleted or anonymised.
          If you ask us to remove you sooner, we will.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>9. Your rights</h2>
        <p style={p}>
          Depending on where you live, you can ask us to give you a copy of your
          data, correct it, delete it, restrict or object to how we use it, or
          send it to another provider. You can also withdraw consent, and stop
          marketing messages, at any time.
        </p>
        <p style={p}>
          Email <a href="mailto:info@alliancestreet.ae" style={{ color: RED }}>info@alliancestreet.ae</a>{' '}
          and we will respond within{' '}
          <Confirm>response window — one month under UK/EU GDPR</Confirm>. If you
          are unhappy with our answer you can complain to your local data
          protection authority; in the UK that is the Information Commissioner's
          Office.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>10. Changes</h2>
        <p style={p}>
          If we change how we handle your information we will update this page and
          move the date at the top. Material changes will be communicated directly
          where we hold contact details for you.
        </p>
      </div>
    </Shell>
  );
}

export function TermsAndConditions() {
  return (
    <Shell title="Terms and Conditions">
      <div style={section}>
        <h2 style={h2}>1. About these terms</h2>
        <p style={p}>
          These terms cover your use of this page and your entry onto the Alliance
          Street webinar priority list. By joining the list you accept them. The
          contracting entity is{' '}
          <Confirm>full registered entity name and registration number</Confirm>.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>2. What the priority list actually is</h2>
        <p style={p}>
          Joining the priority list is a registration of interest. To be explicit
          about what it is not:
        </p>
        <ul style={ul}>
          <li style={li}>It is not a booking, a ticket, or a confirmed place.</li>
          <li style={li}>
            It does not guarantee attendance. Places are limited and applicants are
            shortlisted on how relevant the session is to their situation.
          </li>
          <li style={li}>
            Registration details are sent separately, only once a session date is
            confirmed, and only to shortlisted applicants.
          </li>
          <li style={li}>It is free, and carries no obligation on either side.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>3. This is not professional advice</h2>
        <p style={p}>
          Nothing on this page, and nothing presented in the webinar, is tax,
          legal, financial, immigration or investment advice, and none of it
          creates a professional or advisory relationship. The material is general
          and will not account for your circumstances.
        </p>
        <p style={p}>
          Always take advice on your own situation from a suitably qualified
          professional before acting. Any figures shown — including the headline
          UAE statistics on this page — are general indicators, depend on
          individual circumstances, and can change.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>4. Your side of it</h2>
        <p style={p}>
          Please give accurate details and use a WhatsApp number and email address
          you are entitled to use — verification exists so updates reach the right
          person. Do not submit anyone else's details without their permission,
          and do not use the form to send unlawful or abusive content. We may
          remove an entry that appears false, duplicated or abusive.
        </p>
        <p style={p}>
          You must be at least <Confirm>minimum age</Confirm> to join the list.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>5. Sessions can change</h2>
        <p style={p}>
          Dates, timings, topics and speakers are indicative and may change. The
          topics listed on this page are what a session may cover, not a
          guaranteed agenda, and we may reschedule or cancel a session. Sessions
          may be recorded; if so, we will say so before it begins.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>6. Content ownership</h2>
        <p style={p}>
          The content of this page and of our sessions — text, branding, imagery
          and materials — belongs to Alliance Street Group or its licensors. You
          may use it for your own reference, but not republish, resell or
          redistribute it without written permission.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>7. Liability</h2>
        <p style={p}>
          The page and the sessions are provided as they are. To the extent the law
          allows, we are not liable for decisions taken on the basis of general
          information provided here, nor for the page being briefly unavailable.
          Nothing here limits liability that cannot legally be limited — including
          for death or personal injury caused by negligence, or for fraud.
        </p>
        <p style={p}>
          The specific liability position should be settled with counsel:{' '}
          <Confirm>liability cap and exclusions appropriate to the jurisdiction</Confirm>.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>8. Privacy</h2>
        <p style={p}>
          How we handle the details you submit is set out in our{' '}
          <a href="#/privacy" style={{ color: RED, fontWeight: 600 }}>Privacy Policy</a>,
          which forms part of these terms.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>9. Governing law</h2>
        <p style={p}>
          These terms are governed by{' '}
          <Confirm>governing law and the courts that will have jurisdiction</Confirm>.
          Note that consumers in the UK and EU may keep the protection of their
          local law regardless of what is chosen here.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>10. Changes and contact</h2>
        <p style={p}>
          We may update these terms; the current version always lives on this page
          with its date at the top. Questions go to{' '}
          <a href="mailto:info@alliancestreet.ae" style={{ color: RED }}>info@alliancestreet.ae</a>.
        </p>
      </div>
    </Shell>
  );
}

export function LegalPage({ kind }) {
  return kind === 'privacy' ? <PrivacyPolicy /> : <TermsAndConditions />;
}
