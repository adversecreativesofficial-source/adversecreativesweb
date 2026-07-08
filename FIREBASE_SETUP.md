# Firebase setup — AdVerse (project `adverse-website-67698`)

One-time setup to make the **Upload your ad** flow and the **/admin** panel work.

## 1. Enable services (Firebase Console)

In <https://console.firebase.google.com> → project **adverse-website-67698**:

1. **Authentication** → Get started → **Sign-in method** → enable **Google**
   (the only sign-in method the admin panel uses). Then under
   **Authentication → Settings → Authorized domains**, make sure `localhost`
   and your production domain (e.g. `adverse-creatives.netlify.app`) are listed
   — Google popup sign-in only works from authorized domains.
2. **Firestore Database** → Create database → Production mode → pick a region
   (e.g. `asia-south1`). 
3. **Storage** → Get started → Production mode → same region.

## 2. Deploy security rules

The rules live in `firestore.rules` and `storage.rules` (already in this repo).

**Option A — Firebase CLI** (the CLI must be logged into the Google account that
owns this project):

```bash
firebase login          # use the account that owns adverse-website-67698
firebase deploy --only firestore:rules,storage
```

**Option B — paste in console:** copy `firestore.rules` into
Firestore → Rules, and `storage.rules` into Storage → Rules, then Publish.

## 3. Create the first super admin

The panel bootstraps from one super admin (rules only let an existing super
create more). Admin records are keyed by **Google email** (lowercased), so you
can grant access before anyone has signed in — no UID lookup needed:

1. **Firestore → Start collection** → Collection ID `admins` →
   **Document ID = the super admin's Google email, lowercased**
   (e.g. `adversecreatives.official@gmail.com`) → add fields:
   - `email` (string) — the same email (lowercased)
   - `role` (string) — `super`
   - `disabled` (boolean) — `false`
2. Go to **/admin/login**, click **Continue with Google**, and sign in with
   that account. You're in.

From then on, the **Admins** page grants access to more people by email — they
just sign in with Google, no passwords anywhere.

From there, **Admins** (super-only) lets you create franchise admins
(Bangalore / Kerala) without touching the console again.

## 4. Seed screen locations

In **/admin/screens**, click **Import current site locations** once to copy the
existing Bangalore + Kerala locations into Firestore. After that, edits/photos
you make there show on the public `/contact` page automatically (no rebuild).

## 5. Production env (Netlify)

Set the same `PUBLIC_FIREBASE_*` values from `.env` in
Netlify → Site settings → Environment variables, then redeploy.

## Data model

- `admins/{uid}`: `{ email, role: 'super'|'franchise', franchise?, disabled }`
- `screens/{id}`: `{ franchise, area, city, venue, footfall, mapLink, imageUrl, order }`
- `submissions/{id}`: `{ adUrl, fileName, fileType, businessName, category,
  contactName, phone, email, franchise, status: 'pending'|'approved'|'rejected', createdAt }`
- Storage: `ads/{submissionId}/<file>`, `screens/{screenId}/<file>`
