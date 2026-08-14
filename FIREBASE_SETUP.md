# Firebase phone verification — setup and operations

The waitlist form verifies a mobile number by SMS through **Firebase
Authentication → Phone**. This document covers what is already configured, what
still needs doing before launch, and how to test without spending SMS.

Project: **alliance street waiting list** (`alliance-street-waiting-list`)

---

## Already done

| Item | State |
|---|---|
| Firebase Authentication | Initialised |
| Phone sign-in provider | **Enabled** |
| Test phone number | `+44 7400 123456` → code `123456` |
| Authorised domains | `localhost`, `alliancestreet.co.uk` (production), plus the two Firebase defaults |
| Web config in `.env` | Written, and `.env` is gitignored |

`.env.example` is committed with empty keys so a new checkout knows what to fill in.

---

## Still to do before this takes real traffic

### 1. Billing — this is the hard blocker, nothing works without it

**Verified by testing: phone auth currently fails with `auth/billing-not-enabled`.**
Firebase requires a billing account (Blaze plan) for phone auth, and this applies
**even to numbers registered as console test numbers** — so on the Spark plan the
flow cannot be exercised at all, not even without sending a real SMS.

The console also warns:

> To prevent abuse, new projects currently have a sent SMS daily quota of
> 10/day. To increase this quota, please add a billing account to the project.

So billing unblocks two things at once: the feature working, and the 10/day cap.
Firebase bills per SMS and prices vary a lot by destination country. **This is a
spending decision — it has deliberately not been done for you.**

### 2. Turn on App Check — strongly recommended

*(The SMS region policy below is already configured: **Allow** + the 12 countries
the form's country selector offers. Verified working — allow-listed regions reach
the billing check, non-allow-listed ones like `+81` are rejected.)*

Phone auth is the classic target for *SMS pumping fraud*: an attacker drives
thousands of verification texts to premium-rate numbers they control and takes a
cut of the carrier revenue — billed to you. Two defences, both free:

- **App Check** with reCAPTCHA Enterprise (Build → App Check)
- **SMS region policy** — allow-list only the countries you actually sell into.
  The form offers 12 countries; everything else can be denied outright.

  > Authentication → Settings → SMS region policy

Do this before, not after, the first ad campaign.

---

## Testing without sending real SMS

Firebase test numbers skip the SMS entirely and accept a fixed code — they don't
touch the daily quota and cost nothing. **They still require billing** (step 2);
until that is enabled they fail with `auth/billing-not-enabled` like everything else.

One is already registered:

```
Number:  +44 7400 123456      (in the form: dial +44, number 7400123456)
Code:    123456
```

To add more: Authentication → Sign-in method → Phone → *Phone numbers for
testing*. **Avoid Ofcom's reserved "drama" ranges** (`+44 7700 900xxx`, `+44 7911 1xxxxx`).
They look like the obvious safe choice, but Firebase's SMS routing rejects them —
and reports it as `OPERATION_NOT_ALLOWED: SMS unable to be sent until this region
enabled by the app developer`, which sends you hunting through the region policy
for a fault that isn't there. Confirmed by testing: `+44 7400 123456` passes the
region check while `+44 7700 900123` does not, with GB allow-listed in both cases.

**Note:** test-number entries save when you press **Add** — the dialog confirms
"this setting takes effect immediately". The greyed-out *Save* button beside the
list is unrelated to them.

---

## How it works in the code

```
src/firebase.js            config from VITE_FIREBASE_*, lazy SDK loader
src/phoneVerification.js   E.164 formatting, send, confirm, error mapping
src/App.jsx                WebinarForm — onVerify / onConfirmCode
```

- **Lazy loading.** Firebase Auth is ~36 kB gzipped. It is downloaded on the
  first click of "Send Verification Code", not at page load, so visitors who
  only read the page never pay for it.
- **Invisible reCAPTCHA.** Firebase requires a reCAPTCHA to issue an SMS; this
  is the provider's rule, not a choice. It renders into
  `#asc-recaptcha-container` and resolves silently for normal visitors.
- **No bypass switch.** If Firebase is unconfigured or unreachable, verification
  fails and the visitor cannot proceed. The previous version of this form only
  *simulated* the OTP, which meant an unverified number could reach the confirmed
  state — precisely what the step exists to prevent.
- **Sign-out after confirm.** Verification creates a Firebase Auth session. The
  site has no signed-in features, so the session is ended immediately; it exists
  only to prove the number reaches the visitor.

### Error codes you may see

| Code | Means |
|---|---|
| `auth/billing-not-enabled` | No billing account — see step 2. Blocks test numbers too |
| `auth/operation-not-allowed` | Either the Phone provider is disabled, **or** the number's region isn't on the SMS allow-list. Also fires for unroutable ranges like Ofcom drama numbers |
| `auth/unauthorized-domain` | The serving domain isn't in the authorised list — see step 1 |
| `auth/quota-exceeded` | Daily SMS cap hit — see step 2 |
| `auth/too-many-requests` | Firebase rate-limited this device |
| `auth/invalid-verification-code` | Wrong six digits |
| `auth/code-expired` | Code timed out; request a new one |

All of these are mapped to plain-English visitor-facing text in
`describeAuthError()`. Console-fixable ones show the actual cause in `dev` and a
neutral message in production.

---

## What verification still does *not* do

Confirming the code proves the number is real and reachable. It does **not**
store the lead anywhere — the project has no backend, database or CRM
integration. On success the form hands the confirmed email and number to the
Thank You page in memory and navigates. Persisting the lead is the remaining
piece of work.
