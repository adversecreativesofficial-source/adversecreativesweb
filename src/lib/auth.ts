// Admin authentication + role resolution (client-side).
// Roles live in Firestore `admins/{uid}`: { email, role, franchise?, disabled }.
// Client gating here is UX only — real authorization is enforced by
// firestore.rules / storage.rules.
import { auth, db } from "./firebase";
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (!user) {
        window.location.href = "/admin/login";
        return;
      }
      const admin = await getAdminProfile(user.email);
      if (!admin) {
        // Signed in but not an (enabled) admin.
        await adminSignOut();
        window.location.href = "/admin/login?denied=1";
        return;
      }
      if (opts.requireSuper && admin.role !== "super") {
        window.location.href = "/admin";
        return;
      }
      resolve({ user, admin });
    });
  });
}

/** True when this admin may act on the given franchise. */
export function canAccessFranchise(admin: AdminProfile, franchise: string) {
  return admin.role === "super" || admin.franchise === franchise;
}
