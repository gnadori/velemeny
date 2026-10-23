# Vélemény - Mentimeter-szerű valós idejű szavazó és prezentációs alkalmazás

Egy modern, valós idejű webes alkalmazás interaktív prezentációkhoz, szavazásokhoz és visszajelzések gyűjtéséhez.

## 🚀 Főbb funkciók

### 1. Admin felület (`/#/admin`)
- **Biztonságos Google bejelentkezés:** Kizárólag a `nadorig@gmail.com` fióknak engedélyezett a hozzáférés.
- **Kérdések kezelése:** Kérdések létrehozása, szerkesztése, törlése és előre betöltött 6 mintakérdés egy kattintással.
- **Prezentáció vezérlése:**
  - Kérdés indítása / leállítása.
  - Szavazás azonnali megnyitása / lezárása.
  - Válaszok nullázása / újraindítása.
  - Élő válaszszámláló.

### 2. Kivetítő / Prezentációs nézet (`/#/present`)
- Kivetítőre és nagy képernyőkre tervezett elegáns sötét téma.
- **Automatikus QR-kód és csatlakozási link** a közönség számára.
- Valós idejű, animált diagramok és vizualizációk.
- Teljes képernyős (Fullscreen) mód.

### 3. Résztvevői felület (`/#/`)
- **Nem igényel bejelentkezést!**
- Mobilra optimalizált, letisztult felület.
- Automatikusan szinkronizál az éppen aktív kérdéssel.
- Beküldés után visszaigazoló képernyő és védelem a duplikált szavazás ellen.

---

## 📊 Támogatott kérdéstípusok

1. **Szófelhő:** 3 külön beviteli mező; frekvencia alapján méretezett dinamikus szófelhő a vetítőn.
2. **Választás (Feleletválasztós):** Egyedi opciók; élőben frissülő színes sávdiagram százalékokkal.
3. **Rövid szöveges válasz:** Szabadszavas gondolatok reszponzív üzenőkártyákon.
4. **Pontozás:** 1–5 csillagos vagy 1–10-es skála; átlagpontszám és eloszlás grafikon.
5. **100 pont elosztása:** 100 pont szétosztása prioritások között csúszkákkal; átlagpontszámok rangsora.
6. **2x2-es rács:** Interaktív koordináta-rendszer testreszabható X és Y tengellyel (pl. ráfordítás vs. hatás); élő pontfelhő a kvadránsokban.

---

## 🛠️ Helyi futtatás fejlesztéshez

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása
npm run dev
```

A megnyíló felületen a jobb alsó sarokban lévő navigációs gombokkal azonnal válthatsz a **Résztvevő**, **Kivetítő** és **Admin** nézetek között!

---

## 🔒 Firestore Biztonsági Szabályok (Rules)

Másold be a projekt gyökerében található `firestore.rules` tartalmát a Firebase Console **Firestore Database > Rules** fülére, hogy a szavazatok beküldése szabad legyen, de az admin funkciókat kizárólag a `nadorig@gmail.com` fiók módosíthassa.
