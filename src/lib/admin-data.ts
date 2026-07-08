// Firestore/Storage data helpers for the admin panel.
// All reads/writes are also gated by firestore.rules / storage.rules.
import { db, storage } from "./firebase";
import type { AdminProfile } from "./auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const FRANCHISES = [
  { id: "bangalore", name: "Bangalore" },
  { id: "kerala", name: "Kerala" },
] as const;

export const franchiseName = (id?: string) =>
  FRANCHISES.find((f) => f.id === id)?.name ?? id ?? "—";

// ---------------- Submissions ----------------
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  adUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  businessName: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  franchise: string;
  status: SubmissionStatus;
  createdAt?: { seconds: number } | null;
}

export async function listSubmissions(admin: AdminProfile): Promise<Submission[]> {
  const col = collection(db, "submissions");
  // Avoid composite-index requirement: filter by franchise without orderBy for
  // scoped admins, then sort client-side.
  const q =
    admin.role === "super"
      ? query(col, orderBy("createdAt", "desc"))
      : query(col, where("franchise", "==", admin.franchise));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Submission);
  return rows.sort(
    (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
  );
}

export function setSubmissionStatus(id: string, status: SubmissionStatus) {
  return updateDoc(doc(db, "submissions", id), { status });
}

// ---------------- Screens ----------------
export interface Screen {
  id: string;
  franchise: string;
  area: string;
  city: string;
  venue: string;
  footfall: string;
  mapLink?: string;
  imageUrl?: string;
  order?: number;
}

export async function listScreens(admin?: AdminProfile): Promise<Screen[]> {
  const col = collection(db, "screens");
  const q =
    admin && admin.role !== "super"
      ? query(col, where("franchise", "==", admin.franchise))
      : query(col);
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Screen);
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function createScreen(data: Omit<Screen, "id">) {
  return addDoc(collection(db, "screens"), { ...data, createdAt: serverTimestamp() });
}

export function updateScreen(id: string, data: Partial<Omit<Screen, "id">>) {
  return updateDoc(doc(db, "screens", id), data);
}

export function deleteScreen(id: string) {
  return deleteDoc(doc(db, "screens", id));
}

export async function uploadScreenImage(screenId: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const r = ref(storage, `screens/${screenId}/${safe}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

// ---------------- Admins ----------------
// Admin records are keyed by Google email (lowercased). Granting access is just
// writing the record; the person signs in with Google whenever they like.
export interface AdminRecord {
  email: string;
  role: "super" | "franchise";
  franchise?: string;
  disabled?: boolean;
}

export async function listAdmins(): Promise<AdminRecord[]> {
  const snap = await getDocs(collection(db, "admins"));
  return snap.docs.map(
    (d) => ({ email: d.id, ...(d.data() as object) }) as AdminRecord
  );
}

/**
 * Grant admin access to a Google account by email. No password / account
 * creation — the person signs in with Google and is matched by email. Uses the
 * lowercased email as the document id so it matches the auth-token email that
 * firestore.rules checks against.
 */
export function grantAdmin(params: {
  email: string;
  role: "super" | "franchise";
  franchise?: string;
}) {
  const key = params.email.trim().toLowerCase();
  return setDoc(doc(db, "admins", key), {
    email: key,
    role: params.role,
    franchise: params.role === "franchise" ? params.franchise ?? null : null,
    disabled: false,
    createdAt: serverTimestamp(),
  });
}

export function setAdminDisabled(email: string, disabled: boolean) {
  return updateDoc(doc(db, "admins", email.trim().toLowerCase()), { disabled });
}
