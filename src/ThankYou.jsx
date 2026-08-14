import { useState } from 'react';
import {
  Check, Mail, CalendarCheck, CircleHelp, PhoneCall, ArrowRight,
} from 'lucide-react';
import {
  BOOKING_URL, asset, BG, BONE, BONE_DIM, LINE, WHITE, CARD_INK, CARD_MUTED,
  GLASS_DIM, LIGHT_BG,
} from './tokens';
import { consumeSubmission } from './submission';

/*
 * The Thank You page — the beat immediately after a successful waitlist
 * submission. It is deliberately built from the landing page's existing
 * vocabulary (see DESIGN.md) rather than a new one: the same Anton/Barlow
 * Condensed ramp, the same single red accent, the same liquid-glass cards, the
 * same black -> white -> black section alternation, the same skyline hero.
 * A visitor should read it as the next screen of the page they were just on.
 */

const RED = '#E4141A';

/* Shared type styles, matching the ramp the landing sections already use. */
const sectionHeading = {
  margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400,
  textTransform: 'uppercase', fontSize: 'clamp(34px,3.4vw,52px)',
  lineHeight: 1, letterSpacing: '.005em',
};
const bodyCopy = { margin: 0, fontSize: 18, lineHeight: 1.65, textWrap: 'pretty' };

const STEPS = [
  {
    n: '01',
    Icon: Mail,
    title: 'Keep an eye on your inbox',
    body: (
      <>
        We&rsquo;ll send the webinar details, access link and everything you need
        directly to the email address you registered with.
      </>
    ),
    note: (
      <>
        And just in case, have a quick look at your{' '}
        <strong style={{ color: CARD_INK, fontWeight: 600 }}>Spam, Junk or Promotions</strong>{' '}
        folder too.
      </>
    ),
  },
  {
    n: '02',
    Icon: CalendarCheck,
    title: 'Save your spot',
    body: (
      <>
        Once the webinar details are released, add the session to your calendar.{' '}
        <strong style={{ color: CARD_INK, fontWeight: 600 }}>
          You won&rsquo;t want to miss this one.
        </strong>
      </>
    ),
    note: (
      <>
        We&rsquo;re keeping it practical, relevant and focused on the questions
        entrepreneurs actually have when considering Dubai and the UAE.
      </>
    ),
  },
  {
    n: '03',
    Icon: CircleHelp,
    title: 'Bring your questions',
    body: <>Company structure. Tax residency. UAE banking. Free Zones. Relocation.</>,
    note: (
      <>
        If there&rsquo;s something you&rsquo;ve been trying to figure out,{' '}
        <strong style={{ color: CARD_INK, fontWeight: 600 }}>bring it with you.</strong>
      </>
    ),
  },
];

/**
 * The confirmed email / number, shown only when the visitor arrived straight
 * from the form in this session. A direct visit renders without it — which is
 * why nothing else on the page depends on these values.
 */
function ConfirmedDetails() {
  // Read once on mount and clear, so a re-render can't resurrect it.
  const [details] = useState(consumeSubmission);
  if (!details) return null;

  return (
    <div className="ty-receipt asc-glass asc-glass--on-photo" style={{
      alignSelf: 'stretch', borderRadius: 14, padding: '14px 18px',
      display: 'flex', flexWrap: 'wrap', gap: '6px 28px', alignItems: 'baseline',
      justifyContent: 'center', textAlign: 'center',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.14em', fontSize: 13, color: GLASS_DIM,
      }}>Confirmed for</span>
      {details.email && <span style={{ fontSize: 16, fontWeight: 600, color: BONE }}>{details.email}</span>}
      {details.phone && <span style={{ fontSize: 16, fontWeight: 600, color: BONE }}>{details.phone}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 1. Hero — the emotional peak. Owns the first viewport.
 * ------------------------------------------------------------------ */
function TyHero() {
  return (
    <section id="top" className="asc-pad asc-sec ty-hero" style={{
      position: 'relative', overflow: 'hidden', padding: '64px 48px 72px', background: BG,
      minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center',
    }}>
      {/* Same skyline as the landing hero, over-sized top and bottom so the
          parallax drift can never expose an edge. */}
      <div className="ty-hero-bg" aria-hidden="true" style={{
        position: 'absolute', top: '-12%', left: 0, right: 0, bottom: '-12%',
        backgroundImage: `url('${asset('images/hero-dubai-skyline.jpg')}')`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        willChange: 'transform',
      }} />
      {/* The landing hero scrims left-to-right because its copy sits left. This
          one is centred, so the scrim is a vignette plus a vertical wash.
          Percentage radii shrink with the viewport, so on a phone the vignette's
          dark outer stop would swallow the skyline entirely — .ty-hero-scrim
          widens it back out below 760px. */}
      <div className="ty-hero-scrim" aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'radial-gradient(95% 75% at 50% 45%, rgba(10,10,10,0.16) 0%, rgba(10,10,10,0.56) 100%)',
          'linear-gradient(180deg, rgba(10,10,10,0.46) 0%, rgba(10,10,10,0.12) 42%, rgba(10,10,10,0.95) 100%)',
        ].join(', '),
      }} />
      {/* Readability pool. The landing hero can keep its copy over the darkest
          corner of the photograph; this one is centred, so the copy lands on the
          brightest part — the dusk sky behind the towers. A light overall scrim
          alone left the headline around 2.6:1 there. This darkens only the text
          column and fades to nothing before the edges, so the sunset, the Burj
          and the water stay as visible as the lighter scrim makes them. */}
      <div className="ty-hero-pool" aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 'min(1180px, 96%)', height: 'min(680px, 88%)', pointerEvents: 'none',
        background: 'radial-gradient(closest-side, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.74) 42%, rgba(10,10,10,0.42) 74%, rgba(10,10,10,0) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 880, margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20,
      }}>
        {/* The success mark. Same red disc + Check the form used at step 3,
            scaled up — no green, no confetti, no new colour. */}
        {/* Not `.asc-icon-badge`: that class is claimed by iconBadgeScene,
            which would fight thankYouHeroScene for the same element. */}
        <span className="ty-seal" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 76, height: 76, borderRadius: 999, background: RED, flex: 'none',
          boxShadow: '0 12px 34px rgba(228,20,26,.42)',
        }}>
          <span className="ty-seal-ring" aria-hidden="true" />
          <Check size={38} strokeWidth={2.6} style={{ color: WHITE }} />
        </span>

        <div className="hero-badge" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          border: '1px solid rgba(228,20,26,0.5)', background: 'rgba(228,20,26,0.12)',
          borderRadius: 999, padding: '9px 18px',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: RED, display: 'block' }} />
          <span style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.14em', fontSize: 14, color: BONE,
          }}>You&rsquo;re in!</span>
        </div>

        <h1 className="hero-title" style={{
          margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400,
          textTransform: 'uppercase', fontSize: 'clamp(40px,4.2vw,68px)',
          lineHeight: 0.94, letterSpacing: '.005em', color: BONE, textWrap: 'balance',
        }}>
          You&rsquo;ve Made the <span style={{ color: RED }}>Shortlist.</span>
        </h1>

        <div className="hero-rule" style={{ width: 64, height: 3, background: RED }} />

        <p className="hero-copy" style={{
          margin: 0, maxWidth: 660, fontSize: 19, lineHeight: 1.55,
          fontWeight: 500, color: BONE, textWrap: 'pretty',
        }}>
          Thanks for joining us — we&rsquo;re excited to have you here.
        </p>

        {/* GLASS_DIM, not BONE_DIM: the scrim is light enough here to show the
            skyline, and BONE_DIM would fall under AA against the brighter parts
            of the photograph. This is the token the system keeps for exactly
            this situation — dim text sitting over the hero image. */}
        <p className="hero-copy" style={{
          margin: 0, maxWidth: 660, fontSize: 17, lineHeight: 1.6, color: GLASS_DIM, textWrap: 'pretty',
        }}>
          Your details have been received, and you&rsquo;re now on the shortlist for our
          upcoming webinar. You&rsquo;ll be among the first to receive the webinar details,
          access information and everything you need to join us.
        </p>

        <ConfirmedDetails />

        {/* Same note-panel pattern the form uses for its verification hint. */}
        <div className="ty-hero-note asc-glass asc-glass--on-photo" style={{
          display: 'flex', gap: 14, alignItems: 'center', borderRadius: 14,
          padding: '14px 20px', textAlign: 'left', maxWidth: 620,
        }}>
          <Mail size={20} style={{ color: RED, flex: 'none' }} />
          <span style={{ fontSize: 16, lineHeight: 1.55, color: BONE }}>
            Keep an eye on your inbox. Something valuable is coming your way.
          </span>
        </div>

        <span className="ty-signoff" style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.18em', fontSize: 17,
          color: BONE, marginTop: 4,
        }}>
          We&rsquo;ll see you inside.
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 2. What happens next — white section, same card grid as "Why join".
 * ------------------------------------------------------------------ */
function TyNext() {
  return (
    <section id="next" className="asc-pad asc-sec" style={{ padding: '88px 48px 96px', background: LIGHT_BG }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 44 }}>
        <h2 className="split-head" style={{ ...sectionHeading, color: CARD_INK }}>
          Here&rsquo;s what <span style={{ color: RED }}>happens next</span>
        </h2>
        <div className="asc-why-grid js-ty-steps" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 28,
        }}>
          {STEPS.map(({ n, Icon, title, body, note }) => (
            <div key={n} className="asc-card asc-glass asc-glass--on-light asc-glass--bloom" style={{
              display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 18, padding: '28px 28px 32px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="asc-icon-badge" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 48, height: 48, borderRadius: 999, background: 'rgba(228,20,26,0.09)', flex: 'none',
                }}>
                  <span className="asc-icon-ring" aria-hidden="true" />
                  <Icon size={22} style={{ color: RED }} />
                </span>
                <span aria-hidden="true" style={{
                  fontFamily: "'Anton',sans-serif", fontSize: 28, lineHeight: 1, color: RED,
                }}>{n}</span>
              </div>
              <h3 style={{
                margin: 0, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.03em', fontSize: 24,
                lineHeight: 1.1, color: CARD_INK,
              }}>{title}</h3>
              <p style={{ ...bodyCopy, fontSize: 17, lineHeight: 1.6, color: '#4A4A52' }}>{body}</p>
              <p style={{ ...bodyCopy, fontSize: 16, lineHeight: 1.6, color: CARD_MUTED }}>{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 3. Anticipation — dark canvas with the corner glow, as "What the
 *    webinar may cover" uses. The page's strongest contrast beat after
 *    the hero.
 * ------------------------------------------------------------------ */
function TyAnticipation() {
  return (
    <section id="beyond" className="asc-pad asc-sec" style={{
      position: 'relative', overflow: 'hidden', padding: '96px 48px 104px', background: BG,
    }}>
      <div className="cover-glow" aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(110% 80% at 15% 0%,rgba(228,20,26,0.12) 0%,rgba(10,10,10,0) 62%)',
      }} />
      <div style={{
        position: 'relative', maxWidth: 900, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 26,
      }}>
        <h2 className="split-head" style={{ ...sectionHeading, color: BONE, maxWidth: '18ch' }}>
          We&rsquo;re going beyond <span style={{ color: RED }}>&ldquo;just open a Dubai company.&rdquo;</span>
        </h2>
        <div className="reveal" style={{ width: 64, height: 3, background: RED }} />
        <p className="reveal" style={{ ...bodyCopy, maxWidth: '62ch', color: BONE_DIM }}>
          Setting up a company is the easy part. Building a structure that actually works
          around{' '}
          <strong style={{ color: BONE, fontWeight: 600 }}>
            your business, residency, banking and tax position
          </strong>{' '}
          is where things get interesting.
        </p>
        <p className="reveal" style={{ ...bodyCopy, maxWidth: '62ch', color: BONE_DIM }}>
          During the webinar, we&rsquo;ll break down the bigger picture so you can understand
          the opportunities, the potential mistakes and what you should be thinking about
          before making your move.
        </p>
        <p className="reveal" style={{
          margin: '6px 0 0', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.06em',
          fontSize: 26, lineHeight: 1.3, color: RED, textWrap: 'balance',
        }}>
          Clear advice. Practical strategies. No unnecessary jargon.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 4. High-intent CTA — secondary on purpose. It sits on the white
 *    section tone rather than the landing page's dark, glowing "Would
 *    You Rather Not Wait?" treatment, and keeps the standard heading
 *    size, so it can never out-shout the confirmation above it.
 * ------------------------------------------------------------------ */
function TyCta() {
  return (
    <section id="strategy-call" className="asc-pad asc-sec" style={{ padding: '88px 48px 96px', background: LIGHT_BG }}>
      <div style={{
        maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', gap: 20,
      }}>
        <span className="asc-icon-badge" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 999, background: 'rgba(228,20,26,0.09)', flex: 'none',
        }}>
          <span className="asc-icon-ring" aria-hidden="true" />
          <PhoneCall size={22} style={{ color: RED }} />
        </span>
        <h2 className="split-head" style={{ ...sectionHeading, color: CARD_INK }}>
          Ready to explore your <span style={{ color: RED }}>options already?</span>
        </h2>
        <p className="reveal" style={{ ...bodyCopy, maxWidth: '58ch', color: CARD_MUTED }}>
          Maybe you&rsquo;re not just curious. Maybe Dubai has been on your mind for a while —
          and you&rsquo;re ready to understand what the move could actually look like for{' '}
          <strong style={{ color: CARD_INK, fontWeight: 600 }}>you and your business.</strong>
        </p>
        <p className="reveal" style={{ ...bodyCopy, maxWidth: '58ch', fontSize: 17, color: CARD_MUTED }}>
          If that&rsquo;s the case, you don&rsquo;t have to wait for the webinar. Speak directly
          with the Alliance Street team and start getting clarity now.
        </p>
        <div className="asc-cta-row reveal" style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="asc-btn-glass asc-btn-glass--red"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 19,
              color: WHITE, borderRadius: 999, padding: '17px 34px',
            }}
          >
            Book a Free Strategy Call <ArrowRight size={18} />
          </a>
        </div>
        <span className="reveal" style={{ fontSize: 14, lineHeight: 1.6, color: '#7C7C84' }}>
          30 minutes. No obligation. Just a clear conversation about your situation.
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 5. Warm close + the educational disclaimer.
 * ------------------------------------------------------------------ */
function TyClosing() {
  return (
    <section id="closing" className="asc-pad asc-sec" style={{ padding: '104px 48px 96px', background: BG }}>
      <div style={{
        maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', gap: 26,
      }}>
        <h2 className="split-head" style={{ ...sectionHeading, color: BONE }}>
          One more <span style={{ color: RED }}>thing&hellip;</span>
        </h2>
        <p className="reveal" style={{ ...bodyCopy, maxWidth: '52ch', color: BONE_DIM }}>
          We&rsquo;re genuinely glad you&rsquo;re here. You took the first step by joining the
          shortlist.{' '}
          <strong style={{ color: BONE, fontWeight: 600 }}>
            Now we&rsquo;ll make sure the webinar is worth showing up for.
          </strong>
        </p>
        <p className="reveal" style={{ ...bodyCopy, fontSize: 17, maxWidth: '52ch', color: BONE_DIM }}>
          Keep an eye on your inbox — we&rsquo;ll be in touch soon.
        </p>

        <div className="reveal" style={{ width: 64, height: 3, background: RED, margin: '10px 0 2px' }} />

        <p className="split-head" style={{ ...sectionHeading, color: BONE }}>
          See You <span style={{ color: RED }}>Inside.</span>
        </p>
        <span className="reveal" style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.24em', fontSize: 15, color: BONE_DIM,
        }}>
          Alliance Street
        </span>

        <p className="reveal" style={{
          margin: '38px 0 0', paddingTop: 26, borderTop: `1px solid ${LINE}`,
          maxWidth: '72ch', fontSize: 14, lineHeight: 1.65, color: '#7C7C84', textWrap: 'pretty',
        }}>
          Information provided through the webinar is for general educational purposes.
          Tax, residency and corporate structuring outcomes depend on individual
          circumstances and applicable laws and regulations.
        </p>
      </div>
    </section>
  );
}

export default function ThankYou() {
  return (
    <>
      <TyHero />
      <TyNext />
      <TyAnticipation />
      <TyCta />
      <TyClosing />
    </>
  );
}
