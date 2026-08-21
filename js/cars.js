// AutoPrime — Luxury Fleet & Gallery Data
const DEFAULT_CARS = [
  {
    id: 1, name: "Rolls-Royce Phantom", year: 2025, make: "rolls-royce", type: "limousine", price: 585000,
    img: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=900&q=85",
    fuel: "6.75L V12", transmission: "8-Speed Auto", km: "800 km",
    location: "Beverly Hills, CA",
  },
  {
    id: 2, name: "Bentley Continental GT", year: 2024, make: "bentley", type: "grand", price: 285000,
    img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=85",
    fuel: "6.0L W12", transmission: "8-Speed Auto", km: "1,500 km",
    location: "Dubai Marina, UAE",
  },
  {
    id: 3, name: "Lamborghini Revuelto", year: 2025, make: "lamborghini", type: "sports", price: 720000,
    img: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&q=85",
    fuel: "6.5L V12 Hybrid", transmission: "8-Speed DCT", km: "600 km",
    location: "Monaco, MC",
  },
  {
    id: 4, name: "Ferrari SF90 Stradale", year: 2024, make: "ferrari", type: "sports", price: 520000,
    img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=85",
    fuel: "4.0L V8 Hybrid", transmission: "8-Speed DCT", km: "900 km",
    location: "London, UK",
  },
  {
    id: 5, name: "Aston Martin DB12", year: 2024, make: "aston", type: "grand", price: 248000,
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=85",
    fuel: "4.0L V8 Twin-Turbo", transmission: "8-Speed Auto", km: "2,100 km",
    location: "Miami, FL",
  },
  {
    id: 6, name: "Mercedes-Maybach S680", year: 2025, make: "maybach", type: "limousine", price: 265000,
    img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=85",
    fuel: "6.0L V12", transmission: "9-Speed Auto", km: "1,200 km",
    location: "Dubai Marina, UAE",
  },
  {
    id: 7, name: "Porsche 911 Turbo S", year: 2024, make: "porsche", type: "sports", price: 230000,
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85",
    fuel: "3.8L Flat-6", transmission: "8-Speed PDK", km: "3,000 km",
    location: "Beverly Hills, CA",
  },
  {
    id: 8, name: "Maserati MC20", year: 2024, make: "maserati", type: "sports", price: 240000,
    img: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=900&q=85",
    fuel: "3.0L V6 Nettuno", transmission: "8-Speed DCT", km: "1,800 km",
    location: "Monaco, MC",
  },
  {
    id: 9, name: "Rolls-Royce Cullinan", year: 2025, make: "rolls-royce", type: "suv", price: 445000,
    img: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=900&q=85",
    fuel: "6.75L V12", transmission: "8-Speed Auto", km: "1,000 km",
    location: "Geneva, CH",
  },
  {
    id: 10, name: "Bentley Bentayga EWB", year: 2024, make: "bentley", type: "suv", price: 275000,
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=85",
    fuel: "4.0L V8", transmission: "8-Speed Auto", km: "2,400 km",
    location: "Doha, QA",
  },
  {
    id: 11, name: "Aston Martin Valkyrie", year: 2025, make: "aston", type: "sports", price: 3250000,
    img: "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=900&q=85",
    fuel: "6.5L V12 Hybrid", transmission: "7-Speed Auto", km: "50 km",
    location: "London, UK",
  },
  {
    id: 12, name: "Ferrari Purosangue", year: 2025, make: "ferrari", type: "suv", price: 485000,
    img: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=900&q=85",
    fuel: "6.5L V12", transmission: "8-Speed DCT", km: "700 km",
    location: "Miami, FL",
  }
];

const GALLERY = [
  { img: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=85", caption: "Phantom Serenity" },
  { img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=85", caption: "Continental GT" },
  { img: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&q=85", caption: "Revuelto" },
  { img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=85", caption: "SF90 Stradale" },
  { img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=85", caption: "Maybach S680" },
  { img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85", caption: "911 Turbo S" },
  { img: "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=900&q=85", caption: "Valkyrie" },
  { img: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=900&q=85", caption: "Purosangue" }
];

/* ---------- STORAGE LAYER ---------- */
const Store = {
  key: "autoprime_data",
  get: function () {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  },
  save: function (data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  },
  loadCars: function () {
    const d = this.get();
    if (d && Array.isArray(d.cars) && d.cars.length) return d.cars;
    return DEFAULT_CARS;
  },
  getBranding: function () {
    const d = this.get();
    return (d && d.branding) ? d.branding : null;
  }
};

/* Effective fleet (saved cars or defaults) */
const CARS = Store.loadCars();
/* Effective branding (saved or defaults) */
const BRANDING = Object.assign(
  {
    name: "AUTO PRIME",
    logo: "",
    tagline: "Bespoke Luxury Automobiles",
    primary: "#c8a24c",
    accent: "#e8cf8f",
    dark: "#0a0a0c",
    card: "#141419"
  },
  Store.getBranding() || {}
);