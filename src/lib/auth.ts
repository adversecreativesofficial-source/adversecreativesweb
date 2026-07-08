// Admin authentication + role resolution (client-side).
// Roles live in Firestore `admins/{uid}`: { email, role, franchise?, disabled }.
// Client gating here is UX only — real authorization is enforced by
// firestore.rules / storage.rules.
import { auth, db, isFirebaseConfigured } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type AdminRole = "super" | "franchise";

export interface AdminProfile {
  email: string;
  role: AdminRole;
  franchise?: string;
  disabled?: boolean;
}

export interface AdminState {
  user: User;
  admin: AdminProfile;
}

/**
 * Admin records are keyed by Google email (lowercased) — a super admin can
 * grant access before the person has ever signed in, with no UID chicken-and-
 * egg. Real authorization is enforced by firestore.rules against the auth
 * token email.
 */
export async function getAdminProfile(
  email: string | null | undefined
): Promise<AdminProfile | null> {
  if (!email) return null;
  const key = email.trim().toLowerCase();
  const snap = await getDoc(doc(db, "admins", key));
  if (!snap.exists()) return null;
  const d = snap.data() as Omit<AdminProfile, "email"> & { email?: string };
  if (d.disabled) return null;
  return { email: d.email ?? key, role: d.role, franchise: d.franchise };
}

// Google is the only sign-in method. `select_account` forces the account
// chooser so admins can pick which Google account to use.
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function adminSignInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function adminSignOut() {
  return signOut(auth);
}

/** Resolve the current admin once, or redirect to login / dashboard as needed. */
export function guardAdmin(
  opts: { requireSuper?: boolean } = {}
): Promise<AdminState> {
  return new Promise((resolve) => {
    // No Firebase config (e.g. env vars missing in production) → don't leave the
    // "Checking access…" gate spinning forever; send to login with a reason.
    if (!isFirebaseConfigured) {
      window.location.href = "/admin/login?error=config";
      return;
    }

    let settled = false;
    const leave = (url: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.location.href = url;
    };

    // Safety net: auth normally responds in well under a second. If it never
    // does (bad config / offline), bail out instead of hanging.
    const timer = window.setTimeout(
      () => leave("/admin/login?error=timeout"),
      12000
    );

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        unsub();
        if (settled) return;
        if (!user) return leave("/admin/login");
        try {
          const admin = await getAdminProfile(user.email);
          if (settled) return;
          if (!admin) {
            // Signed in but not an (enabled) admin.
            await adminSignOut().catch(() => {});
            return leave("/admin/login?denied=1");
          }
          if (opts.requireSuper && admin.role !== "super") {
            return leave("/admin");
          }
          settled = true;
          window.clearTimeout(timer);
          resolve({ user, admin });
        } catch {
          // Most likely: firestore.rules not deployed yet (permission denied
          // reading the admin record).
          await adminSignOut().catch(() => {});
          leave("/admin/login?error=access");
        }
      },
      () => leave("/admin/login?error=auth")
    );
  });
}

/** True when this admin may act on the given franchise. */
export function canAccessFranchise(admin: AdminProfile, franchise: string) {
  return admin.role === "super" || admin.franchise === franchise;
}
