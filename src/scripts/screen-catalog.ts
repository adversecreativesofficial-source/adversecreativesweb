// Client logic for the shareable per-region screen catalog.
// Loads that franchise's screens from Firestore (admin-managed, with images),
// lets the client tap-select the ones they want, and opens WhatsApp with a
// pre-filled enquiry listing the selected screen names.

type ScreenDoc = {
  id: string;
  area?: string;
  city?: string;
  venue?: string;
  footfall?: string;
  mapLink?: string;
  imageUrl?: string;
  order?: number | string;
};

const root = document.querySelector<HTMLElement>("[data-catalog]");
if (root) init(root);

const GRADIENTS = [
  ["#3253CC", "#1B2C7A"],
  ["#4068FC", "#00229D"],
  ["#5A7BFF", "#2438B5"],
  ["#2E45B8", "#0A1A66"],
  ["#3A5BD9", "#13218C"],
];
function placeholder(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const [from, to] = GRADIENTS[h % GRADIENTS.length];
  const initials = seed
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return { from, to, initials };
}
const esc = (s: string) =>
  (s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!)
  );

const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

function cardHtml(s: ScreenDoc, i: number): string {
  const media = s.imageUrl
    ? `<img src="${esc(s.imageUrl)}" alt="${esc(s.venue || s.area || "Screen")}" loading="lazy" decoding="async" />`
    : (() => {
        const ph = placeholder(s.venue || s.area || "AdVerse");
        return `<div class="scr-ph" style="background:linear-gradient(135deg, ${ph.from}, ${ph.to});">${esc(ph.initials)}</div>`;
      })();
  const map =
    s.mapLink && s.mapLink !== "#"
      ? `<a class="scr-map" href="${esc(s.mapLink)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(s.area || "")} in Maps" data-nostop>${PIN}</a>`
      : "";
  return `
    <article class="scr-card" role="button" tabindex="0" aria-pressed="false" data-idx="${i}" aria-label="Select ${esc(s.area || "")}, ${esc(s.venue || "")}">
      <div class="scr-media">
        ${media}
        <div class="scr-grad"></div>
        ${map}
        <div class="scr-check">${CHECK}</div>
        <div class="scr-body">
          <h3 class="scr-area">${esc(s.area || "Screen")}</h3>
          <p class="scr-venue">${esc(s.venue || "")}</p>
          ${s.footfall ? `<span class="scr-foot">${esc(s.footfall)}</span>` : ""}
        </div>
      </div>
    </article>`;
}

async function init(root: HTMLElement) {
  const franchise = root.dataset.franchise || "bangalore";
  const region = root.dataset.region || "";
  const whatsapp = root.dataset.whatsapp || "";
  const grid = root.querySelector<HTMLElement>("[data-grid]")!;
  const emptyEl = root.querySelector<HTMLElement>("[data-empty]")!;
  const coverMedia = root.querySelector<HTMLElement>("[data-cover-media]")!;
  const countNum = root.querySelector<HTMLElement>("[data-count-num]")!;
  const bar = root.querySelector<HTMLElement>("[data-enquire]")!;
  const selNum = root.querySelector<HTMLElement>("[data-sel-num]")!;
  const enquireBtn = root.querySelector<HTMLAnchorElement>("[data-enquire-btn]")!;
  const enquireLabel = root.querySelector<HTMLElement>("[data-enquire-label]")!;
  const selectAllBtn = root.querySelector<HTMLButtonElement>("[data-selectall]")!;
  const clearBtn = root.querySelector<HTMLButtonElement>("[data-clear]")!;
  const shareBtn = root.querySelector<HTMLButtonElement>("[data-share]")!;
  const shareLabel = root.querySelector<HTMLElement>("[data-share-label]")!;
  const toast = root.querySelector<HTMLElement>("[data-toast]")!;

  let screens: ScreenDoc[] = [];
  const selected = new Set<number>();

  // ---- share ----
  function showToast(msg: string) {
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => (toast.hidden = true), 300);
    }, 1800);
  }
  shareBtn.addEventListener("click", async () => {
    const url = location.href;
    const shareData = { title: `AdVerse screens · ${region}`, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      shareLabel.textContent = "Copied!";
      showToast("Link copied — share it with your client.");
      setTimeout(() => (shareLabel.textContent = "Share"), 1600);
    } catch {
      showToast(url);
    }
  });

  // ---- data ----
  try {
    const { isFirebaseConfigured, db } = await import("../lib/firebase");
    if (isFirebaseConfigured) {
      const { collection, getDocs } = await import("firebase/firestore");
      const snap = await getDocs(collection(db, "screens"));
      screens = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as object) }) as ScreenDoc)
        .filter((s) => (s.franchise ?? "bangalore") === franchise)
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }
  } catch {
    screens = [];
  }

  countNum.textContent = String(screens.length);

  if (!screens.length) {
    grid.innerHTML = "";
    emptyEl.hidden = false;
    selectAllBtn.hidden = true;
    return;
  }

  // cover = first screen that has an image
  const withImg = screens.find((s) => s.imageUrl);
  if (withImg?.imageUrl) {
    const pre = new Image();
    pre.onload = () => {
      coverMedia.style.backgroundImage = `url("${withImg.imageUrl}")`;
    };
    pre.src = withImg.imageUrl;
  }

  grid.innerHTML = screens.map((s, i) => cardHtml(s, i)).join("");

  // ---- selection ----
  function updateBar() {
    const n = selected.size;
    selNum.textContent = String(n);
    enquireLabel.textContent = n
      ? `Enquire about ${n} screen${n > 1 ? "s" : ""}`
      : "Enquire on WhatsApp";
    enquireBtn.href = buildWhatsApp();
    bar.hidden = n === 0 ? true : false;
    // animate in/out
    if (n > 0) {
      bar.hidden = false;
      requestAnimationFrame(() => bar.classList.add("show"));
    } else {
      bar.classList.remove("show");
      setTimeout(() => {
        if (selected.size === 0) bar.hidden = true;
      }, 300);
    }
    selectAllBtn.textContent =
      selected.size === screens.length ? "Clear all" : "Select all";
  }

  function buildWhatsApp() {
    const picks = [...selected]
      .sort((a, b) => a - b)
      .map((i) => screens[i]);
    const lines = picks
      .map((s, idx) => `${idx + 1}. ${s.venue || s.area}${s.area ? ` (${s.area})` : ""}`)
      .join("\n");
    const msg =
      `Hi AdVerse Creatives, I need information about these ${region} screens:\n\n` +
      `${lines}\n\n` +
      `Shared from ${location.href}`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  function toggle(idx: number) {
    const card = grid.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
    if (!card) return;
    if (selected.has(idx)) {
      selected.delete(idx);
      card.classList.remove("sel");
      card.setAttribute("aria-pressed", "false");
    } else {
      selected.add(idx);
      card.classList.add("sel");
      card.setAttribute("aria-pressed", "true");
    }
    updateBar();
  }

  grid.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-nostop]")) return; // map link — let it open
    const card = target.closest<HTMLElement>(".scr-card");
    if (card) toggle(Number(card.dataset.idx));
  });
  grid.addEventListener("keydown", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".scr-card");
    if (!card) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(Number(card.dataset.idx));
    }
  });

  selectAllBtn.addEventListener("click", () => {
    if (selected.size === screens.length) {
      selected.clear();
    } else {
      screens.forEach((_, i) => selected.add(i));
    }
    grid.querySelectorAll<HTMLElement>(".scr-card").forEach((c) => {
      const on = selected.has(Number(c.dataset.idx));
      c.classList.toggle("sel", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    updateBar();
  });

  clearBtn.addEventListener("click", () => {
    selected.clear();
    grid.querySelectorAll<HTMLElement>(".scr-card.sel").forEach((c) => {
      c.classList.remove("sel");
      c.setAttribute("aria-pressed", "false");
    });
    updateBar();
  });

  updateBar();
}
