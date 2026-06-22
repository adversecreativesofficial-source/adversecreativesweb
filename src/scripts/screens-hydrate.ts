// Progressive hydration of the public "screen locations" grids.
// The page renders static cards (from content.md) for instant paint + SEO.
// After load, we lazily pull Firebase + admin-managed screens; if Firestore has
// screens for a franchise, we replace that grid so admin edits show without a
// rebuild. If Firebase isn't configured or has no data, the static cards stay.

const grids = Array.from(document.querySelectorAll<HTMLElement>("[data-grid]"));
if (grids.length) {
  // Defer until idle so we never block first paint / interaction.
  const start = () => hydrate().catch(() => {});
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => void)
    | undefined;
  if (typeof ric === "function") {
    ric(start, { timeout: 3000 });
  } else {
    window.addEventListener("load", () => setTimeout(start, 400));
  }
}

const GRADIENTS = [
  ["#3253CC", "#1B2C7A"],
  ["#4068FC", "#00229D"],
  ["#5A7BFF", "#2438B5"],
  ["#2E45B8", "#0A1A66"],
  ["#3A5BD9", "#13218C"],
];
function placeholder(venue: string) {
  let hash = 0;
  for (let i = 0; i < venue.length; i++) hash = (hash * 31 + venue.charCodeAt(i)) >>> 0;
  const [from, to] = GRADIENTS[hash % GRADIENTS.length];
  const initials = venue
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return { from, to, initials };
}
const esc = (s: string) =>
  (s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

type ScreenDoc = {
  id: string;
  franchise: string;
  area: string;
  city: string;
  venue: string;
  footfall: string;
  mapLink?: string;
  imageUrl?: string;
  order?: number;
};

function cardHtml(s: ScreenDoc, comingSoon: boolean): string {
  const ph = placeholder(s.venue || s.area || "AdVerse");
  const media = s.imageUrl
    ? `<img src="${esc(s.imageUrl)}" alt="${esc(s.venue)}, ${esc(s.area)}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 ${comingSoon ? "" : "group-hover:scale-105"}" />`
    : `<div class="w-full h-full flex items-center justify-center" style="background:linear-gradient(135deg, ${ph.from}, ${ph.to});" role="img" aria-label="${esc(s.venue)}, ${esc(s.area)}">
         <span class="font-['Outfit'] font-bold text-white/90 text-[40px] tracking-wide drop-shadow-sm">${esc(ph.initials)}</span>
       </div>`;
  const overlay = comingSoon
    ? `<div class="absolute inset-0 bg-[#0A1A66]/45 backdrop-blur-[1px] flex items-center justify-center"><span class="font-['Poppins'] font-bold text-white text-[13px] tracking-[0.08em] uppercase bg-black/30 rounded-full px-4 py-1.5">Coming Soon</span></div>`
    : "";
  const body = `
    <div class="p-5">
      <div class="flex items-start gap-3 mb-4">
        <div class="w-9 h-9 rounded-[10px] bg-[#3253CC] flex items-center justify-center flex-shrink-0 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4.5 h-4.5"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
        </div>
        <div>
          <h4 class="font-['Poppins'] font-bold text-[17px] leading-[22px] text-[#0A0A0A] mb-0.5 transition-colors ${comingSoon ? "" : "group-hover:text-[#3253CC]"}">${esc(s.area)}</h4>
          <span class="font-['Poppins'] font-bold text-[10px] leading-[15px] tracking-[0.08em] text-[#3253CC] uppercase">${esc(s.city)}</span>
        </div>
      </div>
      <div class="bg-[#F6F7FF] rounded-[8px] p-3 flex justify-between items-center gap-2">
        <span class="font-['Poppins'] font-medium text-[14px] leading-[20px] text-[#171717] truncate">${esc(s.venue)}</span>
        <span class="bg-[#E0E7FF] rounded-[6px] px-2.5 py-1 font-['Poppins'] font-bold text-[10px] leading-[15px] text-[#3253CC] whitespace-nowrap flex-shrink-0">${esc(s.footfall)}</span>
      </div>
    </div>`;
  const inner = `<div class="relative aspect-[4/3] overflow-hidden">${media}${overlay}</div>${body}`;
  const cls = `group relative block bg-white rounded-[16px] overflow-hidden border border-transparent text-left shadow-[0px_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ${
    comingSoon ? "opacity-90" : "hover:shadow-[0px_12px_40px_rgba(50,83,204,0.14)] hover:border-[#E0E7FF] hover:-translate-y-1"
  }`;
  return comingSoon
    ? `<div class="${cls}">${inner}</div>`
    : `<a href="${esc(s.mapLink || "#")}" target="_blank" rel="noopener noreferrer" class="${cls}">${inner}</a>`;
}

async function hydrate() {
  const { isFirebaseConfigured } = await import("../lib/firebase");
  if (!isFirebaseConfigured) return;
  const { listScreens } = await import("../lib/admin-data");
  const all = (await listScreens()) as ScreenDoc[];
  if (!all.length) return; // keep static content as the source of truth

  for (const grid of grids) {
    const franchise = grid.dataset.grid!;
    const comingSoon = grid.dataset.status === "coming_soon";
    const rows = all
      .filter((s) => s.franchise === franchise)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (!rows.length) continue; // no Firestore screens for this franchise → keep static
    grid.innerHTML = rows.map((s) => cardHtml(s, comingSoon)).join("");
  }
}
