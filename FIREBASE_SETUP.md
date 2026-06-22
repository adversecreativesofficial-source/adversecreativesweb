# Firebase setup — AdVerse (project `adverse-website-67698`)

One-time setup to make the **Upload your ad** flow and the **/admin** panel work.

## 1. Enable services (Firebase Console)

In <https://console.firebase.google.com> → project **adverse-website-67698**:

1. **Authentication** → Get started → **Sign-in method** → enable **Email/Password**.
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
create more). Create it manually once:

1. **Authentication → Users → Add user** → enter the super-admin email +
   a password. Copy the new user's **UID**.
2. **Firestore → Start collection** → Collection ID `admins` →
   **Document ID = that UID** → add fields:
   - `email` (string) — the same email
   - `role` (string) — `super`
   - `disabled` (boolean) — `false`
3. Go to **/admin/login**, sign in. You're in.

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
