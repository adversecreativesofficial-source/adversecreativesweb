// One-time seed of the current site's screen locations into Firestore, so the
// admin "Screens" manager starts at parity with the static content.md data.
// (Hydration replaces a franchise's grid once Firestore has screens for it, so
// seeding the full set avoids a partial public listing.)
import { createScreen, type Screen } from "./admin-data";

export const STARTER_SCREENS: Omit<Screen, "id">[] = [
  { franchise: "bangalore", area: "Koramangala", city: "BANGALORE", venue: "2 Rabbits Bakes", footfall: "~1,500/day", mapLink: "https://maps.app.goo.gl/jwua9MRqQ82fsxNeA?g_st=aw", order: 1 },
  { franchise: "bangalore", area: "Koramangala 5th Block", city: "BANGALORE", venue: "Tera Bites", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/fUFCSGtyHm6avfvv9?g_st=aw", order: 2 },
  { franchise: "bangalore", area: "Jayanagar 4th Block", city: "BANGALORE", venue: "Halli Jonne Biriyani", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/FPtJnMCr2nY3G7HG9?g_st=aw", order: 3 },
  { franchise: "bangalore", area: "Jayanagar 9th Block", city: "BANGALORE", venue: "New Udupi Garden", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/Jm2btirP6AJ1gVYC8?g_st=aw", order: 4 },
  { franchise: "bangalore", area: "Taverekere", city: "BANGALORE", venue: "Kannur Food Kitchen", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/PwRyGjusi11kk2Ao6?g_st=aw", order: 5 },
  { franchise: "bangalore", area: "Maruthi Nagar", city: "BANGALORE", venue: "Tasty Restaurant", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/tm5GPMYd1qC5bo756?g_st=aw", order: 6 },
  { franchise: "bangalore", area: "BTM 2nd Stage", city: "BANGALORE", venue: "CM Foods Restaurant", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/LpEGdJayS1BojGAh7?g_st=aw", order: 7 },
  { franchise: "bangalore", area: "SG Palya", city: "BANGALORE", venue: "Kannur Food Point", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/MM4NFxysQcrHsXSk7?g_st=aw", order: 8 },
  { franchise: "bangalore", area: "Madiwala", city: "BANGALORE", venue: "Live Cafe", footfall: "~1,500/day", mapLink: "https://maps.app.goo.gl/GafnfwDMzAJqe8vn8?g_st=aw", order: 9 },
  { franchise: "bangalore", area: "JP Nagar", city: "BANGALORE", venue: "Kabab Plaza", footfall: "~2,000/day", mapLink: "https://maps.app.goo.gl/SknfnMSxXiAbPwP67?g_st=aw", order: 10 },
  { franchise: "kerala", area: "Kochi", city: "KERALA", venue: "Marine Drive Cafés", footfall: "Coming soon", mapLink: "", order: 1 },
  { franchise: "kerala", area: "Trivandrum", city: "KERALA", venue: "City Center Hotspots", footfall: "Coming soon", mapLink: "", order: 2 },
  { franchise: "kerala", area: "Kozhikode", city: "KERALA", venue: "Beach Road Eateries", footfall: "Coming soon", mapLink: "", order: 3 },
];

/** Seeds screens the admin may create. Franchise admins only seed their own. */
export async function seedStarterScreens(opts: { franchise?: string } = {}) {
  const rows = opts.franchise
    ? STARTER_SCREENS.filter((s) => s.franchise === opts.franchise)
    : STARTER_SCREENS;
  for (const row of rows) {
    await createScreen(row);
  }
  return rows.length;
}
