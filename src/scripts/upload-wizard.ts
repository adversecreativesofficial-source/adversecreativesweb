// "Upload your first ad" — 4-step wizard logic.
// Step nav + progress, per-step inline validation, localStorage draft autosave,
// file preview, and submit → Firebase Storage (file) + Firestore (submission).
import { db, storage, isFirebaseConfigured } from "../lib/firebase";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const DRAFT_KEY = "adverse_ad_draft";

const formEl = document.getElementById("ad-wizard") as HTMLFormElement | null;
if (formEl) {
  const form: HTMLFormElement = formEl; // non-null inside this block & closures
  const $ = <T extends Element = HTMLElement>(sel: string) =>
    form.querySelector(sel) as T | null;
  const sections = Array.from(
    form.querySelectorAll<HTMLElement>("section[data-step]")
  );
  const progressSteps = Array.from(
    form.querySelectorAll<HTMLElement>("[data-progress-step]")
  );
  const btnBack = $("#btn-back") as HTMLButtonElement;
  const btnNext = $("#btn-next") as HTMLButtonElement;
  const btnSubmit = $("#btn-submit") as HTMLButtonElement;
  const wizardNav = $("#wizard-nav") as HTMLElement;

  const fileInput = $("#ad-file") as HTMLInputElement;
  const dropzone = $("#dropzone") as HTMLElement;
  const preview = $("#file-preview") as HTMLElement;
  const previewThumb = $("#preview-thumb") as HTMLElement;
  const previewName = $("#preview-name") as HTMLElement;
  const previewSize = $("#preview-size") as HTMLElement;
  const removeFile = $("#remove-file") as HTMLButtonElement;

  const TOTAL = 4;
  let step = 1;
  let selectedFile: File | null = null;
  let previewUrl: string | null = null;

  // ---------- helpers ----------
  const setError = (key: string, msg: string) => {
    const el = form.querySelector<HTMLElement>(`[data-error="${key}"]`);
    if (el) el.textContent = msg;
    const field = form.querySelector<HTMLElement>(`#${key}`);
    if (field) field.classList.toggle("invalid", Boolean(msg));
  };
  const clearErrors = () =>
    form
      .querySelectorAll<HTMLElement>("[data-error]")
      .forEach((el) => (el.textContent = ""));

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const val = (sel: string) =>
    ($(sel) as HTMLInputElement | HTMLSelectElement | null)?.value.trim() ?? "";
  const franchiseValue = () =>
    (form.querySelector('input[name="franchise"]:checked') as HTMLInputElement | null)
      ?.value ?? "";

  // ---------- render ----------
  function render() {
    sections.forEach((s) => {
      s.hidden = s.dataset.step !== String(step);
    });
    progressSteps.forEach((p) => {
      const n = Number(p.dataset.progressStep);
      p.classList.toggle("is-active", n === step);
      p.classList.toggle("is-done", n < step);
    });
    btnBack.hidden = step === 1;
    btnNext.hidden = step === TOTAL;
    btnSubmit.hidden = step !== TOTAL;
    if (step === TOTAL) renderReview();
  }

  function renderReview() {
    const review = $("#review") as HTMLElement;
    const rows: [string, string][] = [
      ["Ad file", selectedFile ? selectedFile.name : "—"],
      ["Business", val("#businessName") || "—"],
      ["Category", val("#category") || "—"],
      ["Name", val("#contactName") || "—"],
      ["Phone", val("#phone") || "—"],
      ["Email", val("#email") || "—"],
      ["Franchise", franchiseLabel(franchiseValue())],
    ];
    review.innerHTML = rows
      .map(
        ([k, v]) =>
          `<div class="review-row"><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`
      )
      .join("");
  }

  const franchiseLabel = (v: string) =>
    v === "bangalore" ? "Bangalore" : v === "kerala" ? "Kerala (waitlist)" : "—";

  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
    );
  }

  // ---------- validation ----------
  function validateStep(n: number): boolean {
    let ok = true;
    const fail = (key: string, msg: string) => {
      setError(key, msg);
      ok = false;
    };
    if (n === 1) {
      if (!selectedFile) fail("file", "Please add your ad file to continue.");
      else if (selectedFile.size > MAX_BYTES) fail("file", "File is too large (max 50 MB).");
    }
    if (n === 2) {
      if (!val("#businessName")) fail("businessName", "Business name is required.");
      if (!val("#category")) fail("category", "Please choose a category.");
    }
    if (n === 3) {
      if (!val("#contactName")) fail("contactName", "Your name is required.");
      const phone = val("#phone");
      if (!phone) fail("phone", "Phone number is required.");
      else if (!/^[+]?[\d\s()-]{7,}$/.test(phone)) fail("phone", "Enter a valid phone number.");
      const email = val("#email");
      if (!email) fail("email", "Email is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email", "Enter a valid email address.");
    }
    if (n === 4) {
      if (!franchiseValue()) fail("franchise", "Please choose a franchise.");
    }
    return ok;
  }

  // ---------- file handling ----------
  function handleFile(file: File | null) {
    setError("file", "");
    if (!file) return;
    if (!/^(image|video)\//.test(file.type)) {
      setError("file", "Only image or video files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("file", "File is too large (max 50 MB).");
      return;
    }
    selectedFile = file;
    previewName.textContent = file.name;
    previewSize.textContent = fmtSize(file.size);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewThumb.innerHTML = "";
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = previewUrl;
      img.alt = "Ad preview";
      img.className = "w-full h-full object-cover";
      previewThumb.appendChild(img);
    } else {
      previewThumb.innerHTML =
        '<svg class="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>';
    }
    preview.classList.remove("hidden");
    saveDraft();
  }

  fileInput?.addEventListener("change", () => handleFile(fileInput.files?.[0] ?? null));
  removeFile?.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    preview.classList.add("hidden");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  });

  // Drag & drop
  ["dragenter", "dragover"].forEach((ev) =>
    dropzone?.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("border-[#3253CC]", "bg-[#EEF2FF]");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropzone?.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-[#3253CC]", "bg-[#EEF2FF]");
    })
  );
  dropzone?.addEventListener("drop", (e) => {
    const file = (e as DragEvent).dataTransfer?.files?.[0] ?? null;
    handleFile(file);
  });

  // ---------- draft autosave ----------
  function saveDraft() {
    const draft = {
      step,
      businessName: val("#businessName"),
      category: val("#category"),
      contactName: val("#contactName"),
      phone: val("#phone"),
      email: val("#email"),
      franchise: franchiseValue(),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
  }

  function loadDraft() {
    let draft: Record<string, string> = {};
    try {
      draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    } catch {
      return;
    }
    const set = (sel: string, v?: string) => {
      const el = $(sel) as HTMLInputElement | HTMLSelectElement | null;
      if (el && v) el.value = v;
    };
    set("#businessName", draft.businessName);
    set("#category", draft.category);
    set("#contactName", draft.contactName);
    set("#phone", draft.phone);
    set("#email", draft.email);
    if (draft.franchise) {
      const r = form.querySelector<HTMLInputElement>(
        `input[name="franchise"][value="${draft.franchise}"]`
      );
      if (r) r.checked = true;
    }
  }

  form.addEventListener("input", saveDraft);
  form.addEventListener("blur", (e) => {
    // Inline-validate the current step's touched field on blur.
    const t = e.target as HTMLElement;
    if (t && (t.id || t.getAttribute("name"))) validateStep(step);
  }, true);

  // ---------- navigation ----------
  function goTo(n: number) {
    step = Math.min(TOTAL, Math.max(1, n));
    clearErrors();
    render();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  btnNext.addEventListener("click", () => {
    if (validateStep(step)) goTo(step + 1);
  });
  btnBack.addEventListener("click", () => goTo(step - 1));

  // ---------- submit ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    for (let n = 1; n <= TOTAL; n++) {
      if (!validateStep(n)) {
        goTo(n);
        return;
      }
    }
    if (!isFirebaseConfigured) {
      setError(
        "submit",
        "Submissions aren't connected yet. Please add your Firebase config (see .env.example)."
      );
      return;
    }

    const label = btnSubmit.querySelector(".btn-label") as HTMLElement;
    const spinner = btnSubmit.querySelector(".btn-spinner") as HTMLElement;
    btnSubmit.disabled = true;
    btnBack.disabled = true;
    label.textContent = "Submitting…";
    spinner.classList.remove("hidden");

    try {
      const id = doc(collection(db, "submissions")).id;
      const file = selectedFile!;
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const fileRef = ref(storage, `ads/${id}/${safeName}`);
      await uploadBytes(fileRef, file);
      const adUrl = await getDownloadURL(fileRef);

      await setDoc(doc(db, "submissions", id), {
        adUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        businessName: val("#businessName"),
        category: val("#category"),
        contactName: val("#contactName"),
        phone: val("#phone"),
        email: val("#email"),
        franchise: franchiseValue(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* non-fatal */
      }
      sections.forEach((s) => (s.hidden = s.dataset.step !== "success"));
      wizardNav.hidden = true;
      progressSteps.forEach((p) => p.classList.add("is-done"));
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error("Ad submission failed:", err);
      setError("submit", "Something went wrong submitting your ad. Please try again.");
      btnSubmit.disabled = false;
      btnBack.disabled = false;
      label.textContent = "Submit ad";
      spinner.classList.add("hidden");
    }
  });

  // ---------- init ----------
  loadDraft();
  render();
}
