# Mithaq — Future Roadmap (saved for later)

> Two planned initiatives, captured for when we build them. Nothing here is built yet.
> Decisions/direction agreed with the owner. Pick these up when ready.

---

## A. Turn Mithaq into a native mobile app (App Store + Play Store)

**Approach: wrap the existing PWA with Capacitor** — reuse ~100% of the current
React/Vite code inside a native iOS + Android shell. (No rewrite. React Native would be
overkill for a CRUD app that already works. PWABuilder/TWA is an Android-only shortcut, but
Capacitor is future-proof and passes Apple review better.)

### Phase 0 — Accounts & prerequisites (do first)
- Google Play Developer account — **$25 one-time**.
- Apple Developer Program — **$99/year**.
- ⚠️ iOS builds need **macOS + Xcode**. No Mac → use a cloud build service (**EAS Build**,
  **Codemagic**, or GitHub macOS runners). Android needs no Mac.
- App identity: name, bundle id (`com.mithaq.app`), icons, splash.

### Phase 1 — Make data durable (CRITICAL, do before shipping)
Mithaq stores data in `localStorage`; inside a store app the OS can clear it and it's lost on
uninstall. Upgrade persistence before real users trust it with their finances:
- **Capacitor Preferences / SQLite** plugin for solid on-device storage, and/or
- **Supabase** for cloud backup + sync (also the foundation for section B below).

### Phase 2 — Wrap with Capacitor
`@capacitor/core @capacitor/cli` → `npx cap init` → `webDir: dist` → `npx cap add android|ios`
→ `npm run build && npx cap sync`. Test on emulators + real devices.

### Phase 3 — Native polish
Icon + splash per platform, safe areas, native plugins: **Share** (WhatsApp/PDF), **Filesystem**
(save PDFs/backups), **Haptics**, optional **biometric lock**. (Back-button/history already handled.)

### Phase 4 — Store assets & compliance
Screenshots (multiple sizes), descriptions AR/FR/EN, category = Business, and a **privacy policy
URL** (mandatory) + Apple Privacy Nutrition Label + Google Data Safety form (short, since data is
on-device).

### Phase 5 — Build, sign, submit
- Android: signed **AAB** → Play Console → internal testing → production (review ~hours–1 day).
- iOS: archive → App Store Connect → **TestFlight** → submit (review ~1–3 days).

### Phase 6 — Post-launch
Versioning, crash reporting, updates (web content easy; native shell goes through review).

**Order for Algeria (Android-dominant):** ship **Google Play first**, then iOS. Keep the free PWA
live as a $0 install path + beta channel.

**Division of labor:** Claude does all code (Capacitor, durable storage/Supabase, plugins, build
config, store-asset prep). Owner does: create dev accounts, pay fees, provide Mac or approve a
cloud-build service, click final "submit."

---

## B. Subscription system (Algeria-first, semi-manual → automated)

**Core principle: separate _payment_ (money arrives) from _entitlement_ (who is active, until
when).** Payment stays manual in Algeria for now; everything around it is automated. The only
truly manual step is a human confirming "the money landed."

### Payment options, in order of adoption
1. **Manual transfer** (start here): BaridiMob / CCP / cash → owner confirms → activate.
2. **Chargily Pay** ⭐ — Algerian gateway with a **developer API** for **CIB + EDAHABIA** cards.
   Needs a registered business (registre de commerce); lets us **fully automate Algerian**
   subscriptions later.
3. **International** (later): **Paddle / Lemon Squeezy** preferred over Stripe — "merchant of
   record" handles global tax for a solo founder.

### Architecture (build once, works for all three payment sources)
Small backend on **Supabase** (same foundation as cloud sync in A):
```
users         → email/phone login (Supabase Auth)
subscriptions → user_id, plan, status, valid_until, source
payments      → user_id, amount, method, proof_url, approved_by
```
App checks `status` + `valid_until` on launch, with an **offline grace period** so a craftsman
with no signal isn't locked out mid-job.

### Semi-automatic flow (works today with manual payment)
1. User signs up (email/phone + OTP) — auto
2. Free **trial** (e.g. 14 days), no payment — auto
3. Near expiry, app shows owner's **BaridiMob/CCP number + amount** — auto
4. User **uploads receipt** screenshot in-app — auto intake
5. Owner gets **Telegram/email alert** "new payment to verify" — auto
6. Owner confirms in bank app + clicks **Approve** — *the one manual step (~30s)*
7. Account extends to correct date, confirmation sent, receipt logged — auto
8. Renewal reminders, expiry, auto-lock, "3 days left" — auto

Run from a tiny **admin panel** (list of pending payments + Approve button). 50 or 500 users =
same effort. When **Chargily/Paddle** is added later, steps 4–6 are replaced by a **webhook** that
flips the same `status` flag — **zero rearchitecture**.

### Guardrails
- **Device binding** (tie a subscription to 1–2 devices) to stop account/key sharing.
- **Offline grace period** always on.

### Simpler no-backend alternative (if launching cheap/offline first)
**Signed license keys**: generate a cryptographic key ("user, expires date"), send via WhatsApp
after payment, app verifies offline. $0 infra, fully offline — but no central dashboard, harder to
revoke, and a dead-end for automated recurring billing. Fine as a v1 stopgap only.

### Recommendation
Go with the **Supabase accounts + subscription table** model. Manual approval now = one click;
Chargily/international later = a webhook into the same table. Build the billing engine **once**;
it scales manual → Algerian gateway → international with no rewrite. **Starting point when ready:**
trial + manual-approve admin panel on Supabase — enough to start charging Algerian users with just
a BaridiMob number.

---

*Next concrete step when we resume:* either **Phase 1 (durable data)** for the mobile app, or the
**subscription data model + admin-approval blueprint** — both center on adding Supabase, so that's
the shared first move.
