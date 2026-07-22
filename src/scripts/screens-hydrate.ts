// Refresh the public "screen locations" section from Firestore so admin edits
// appear without a rebuild. The static content.md render is the initial paint /
// SEO fallback; this reconciles each region's totals + screen list with live
// admin-managed data. Firebase is imported lazily so the contact page stays
// light for visitors who never see the hydrated data.

type ScreenDoc = {
  franchise?: string;
  area?: string;
  city?: string;
  venue?: string;
  footfall?: string;
  mapLink?: string;
  order?: number | string;
};

const section = document.getElementById("locations");
const panels = section
  ? Array.from(section.querySelectorAll<HTMLElement>("[data-region-panel]"))
  : [];

if (panels.length) {
  const start = () => hydrate().catch(() => {});
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => void)
    | undefined;
  if (typeof ric === "function") ric(start, { timeout: 3000 });
  else window.addEventListener("load", () => setTimeout(start, 400));
}

const esc = (s: string) =>
  (s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!)
  );

function footfallTotal(list: ScreenDoc[]): number | null {
  let sum = 0;
  let has = false;
  for (const l of list) {
    const m = String(l.footfall ?? "").replace(/,/g, "").match(/\d+/);
    if (m) {
      sum += parseInt(m[0], 10);
      has = true;
    }
  }
  return has ? sum : null;
}

function formatFootfall(n: number | null): string {
  if (n == null) return "Coming soon";
  if (n >= 1000) return `~${Math.round(n / 1000)}K`;
  return `~${n}`;
}

function cardHtml(s: ScreenDoc): string {
  const isLink = !!s.mapLink && s.mapLink !== "#";
  const tag = isLink ? "a" : "div";
  const attrs = isLink
    ? `href="${esc(s.mapLink!)}" target="_blank" rel="noopener noreferrer"`
    : "";
  const hover = isLink
    ? "hover:border-[#3253CC]/50 hover:bg-white/[0.06] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3253CC]"
    : "opacity-90";
  const arrow = isLink
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-[#859EF8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>`
    : "";
  const titleHover = isLink ? "group-hover:text-[#859EF8] transition-colors" : "";
  return `<${tag} ${attrs} class="group flex items-start gap-3 bg-white/[0.04] border border-white/10 rounded-[14px] p-4 text-left transition-all duration-300 ${hover}">
    <div class="w-9 h-9 rounded-[10px] bg-[#3253CC]/15 flex items-center justify-center flex-shrink-0 text-[#859EF8]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <h4 class="font-['Poppins'] font-bold text-[15px] leading-[20px] text-white truncate ${titleHover}">${esc(s.area ?? "")}</h4>
        ${arrow}
      </div>
      <p class="font-['Poppins'] text-[13px] leading-[18px] text-[#9aa6c6] truncate">${esc(s.venue ?? "")}</p>
      <span class="inline-block mt-1.5 font-['Poppins'] font-bold text-[10px] tracking-[0.06em] text-[#859EF8] uppercase">${esc(s.footfall ?? "")}</span>
    </div>
  </${tag}>`;
}

async function hydrate() {
  const { isFirebaseConfigured, db } = await import("../lib/firebase");
  if (!isFirebaseConfigured) return;
  const { collection, getDocs } = await import("firebase/firestore");
  const snap = await getDocs(collection(db, "screens"));
  const all = snap.docs.map((d) => d.data() as ScreenDoc);
  if (!all.length) return; // keep the static content as the source of truth

  for (const panel of panels) {
    const fid = panel.dataset.regionPanel!;
    const list = all
      .filter((s) => (s.franchise ?? "bangalore") === fid)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const setTotal = (key: string, v: string) => {
      const el = panel.querySelector(`[data-total="${key}"]`);
      if (el) el.textContent = v;
    };
    setTotal("locations", String(list.length));
    setTotal("venues", String(list.length));
    setTotal("footfall", formatFootfall(footfallTotal(list)));

    const wrap = panel.querySelector<HTMLElement>("[data-screens-wrap]");
    const grid = panel.querySelector<HTMLElement>("[data-screens-grid]");
    if (grid) grid.innerHTML = list.map(cardHtml).join("");
    if (wrap) wrap.classList.toggle("hidden", list.length === 0);
  }
}
