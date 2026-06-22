// Admin authentication + role resolution (client-side).
// Roles live in Firestore `admins/{uid}`: { email, role, franchise?, disabled }.
// Client gating here is UX only — real authorization is enforced by
// firestore.rules / storage.rules.
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type AdminRole = "super" | "franchise";

export interface AdminProfile {
  uid: string;
  email: string;
  role: AdminRole;
  franchise?: string;
  disabled?: boolean;
}

export interface AdminState {
  user: User;
  admin: AdminProfile;
}

export async function getAdminProfile(uid: string): Promise<AdminProfile | null> {
  const snap = await getDoc(doc(db, "admins", uid));
  if (!snap.exists()) return null;
  const d = snap.data() as Omit<AdminProfile, "uid">;
  if (d.disabled) return null;
  return { uid, email: d.email, role: d.role, franchise: d.franchise };
}

export function adminSignIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
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
      const admin = await getAdminProfile(user.uid);
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
