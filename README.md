# Vélemény — Valós idejű szavazó és prezentációs alkalmazás

A **Vélemény** egy Mentimeterhez hasonló, modern, minimalista és nagysebességű valós idejű webes alkalmazás interaktív előadásokhoz, szavazásokhoz és közönség-visszajelzések gyűjtéséhez.

---

## 🎯 Rendszeráttekintés & Elérési címek

Az alkalmazás egyetlen központi szobára épül, így nincs szükség szobakódok gépelésére. Három különálló nézetből áll:

| Felület | Cím (GitHub Pages) | Célközönség | Bejelentkezés |
| :--- | :--- | :--- | :--- |
| **Résztvevői felület** | `https://gnadori.github.io/velemeny/` | Közönség / Diákok mobilon | **NEM szükséges** (anonim, azonnali) |
| **Kivetítő nézet** | `https://gnadori.github.io/velemeny/#/present` | Projektor / Nagyképernyő | **NEM szükséges** (vetítésre optimalizált) |
| **Adminisztrátori felület** | `https://gnadori.github.io/velemeny/#/admin` | Kizárólag az előadók | **Google fiók** (`nadorig@gmail.com`, `prievarat@gmail.com`) |

---

## 🚀 Lépésről lépésre használati útmutató az Előadónak

### 1. Belépés az Admin felületre
1. Nyisd meg a laptopodon a `/#/admin` címet:  
   👉 **`https://gnadori.github.io/velemeny/#/admin`**
2. Kattints a **`[ BELÉPÉS GOOGLE FIÓKKAL ]`** gombra.
3. Jelentkezz be a `nadorig@gmail.com` vagy a `prievarat@gmail.com` Google fiókoddal.  
   *(Biztonsági okokból más Google fiókkal nem enged belépni a rendszer).*

### 2. Kérdéssor előkészítése
- **Mintakérdések betöltése (Első alkalommal):**  
  Ha a kérdéstár üres, kattints a **`[ MINTAKÉRDÉSEK BETÖLTÉSE ]`** gombra, és az összes kérdéstípusból azonnal betölt egy-egy kipróbálható mintát (beleértve a csillagos és a 0-100%-os skálát is).
- **Új kérdés létrehozása:**  
  Kattints a **`[ + ÚJ KÉRDÉS ]`** gombra. Válaszd ki a típust, írd be a kérdés szövegét, az opcionális leírást, és add meg a típushoz tartozó beállításokat.
- **Kérdés törlése:**  
  A listában a kérdés mellett lévő **`[ X ]`** gombbal bármelyik kérdés törölhető az archívumból.

### 3. Kivetítő megnyitása a terem projektorán
1. Az Admin fejlécében vagy az aktív kérdés kártyáján kattints a **`[ KIVETÍTŐ ÚJ ABLAKBAN ↗ ]`** gombra.
2. A megnyíló lapot húzd át a csatlakoztatott projektor / második monitor képernyőjére.
3. Nyomd meg az **F11** billentyűt vagy kattints a jobb felső sarokban a **`[ ⤢ ]`** (teljes képernyő) ikonra.

### 4. Közönség csatlakozása
- A kivetítő képernyőjén automatikusan látható a **nagy méretű QR-kód** és a webcím (`https://gnadori.github.io/velemeny/`).
- Amikor a résztvevők beolvassák a kódot a telefonjuk kamerájával, azonnal a szavazófelületre érkeznek.
- Ha menet közben bárki lemaradna, a vetítő jobb felső sarkában lévő **`[ QR KÓD ]`** gombra kattintva bármikor felugrasztható a csatlakozási kód.

### 5. Prezentáció vezérlése (Kérdések indítása és szavazás)
- **Kérdés indítása:** A listában a kívánt kérdésnél kattints az **`[ INDÍTÁS ]`** gombra.  
  *Ekkor mind a kivetítőn, mind a résztvevők telefonján azonnal megjelenik a kérdés és a megfelelő űrlap!*
- **Szavazás lezárása / megnyitása:**  
  A felül lévő **`[ SZAVAZÁS LEZÁRÁSA ]`** gombbal bármikor megállíthatod a válaszok érkezését anélkül, hogy levennéd a kérdést a kivetítőről. Újraindításhoz kattints a **`[ SZAVAZÁS MEGNYITÁSA ]`** gombra.
- **Válaszok törlése:**  
  A **`[ VÁLASZOK NULLÁZÁSA ]`** gombbal törölheted az adott kérdésre eddig leadott szavazatokat (pl. ha újra szeretnéd szavaztatni ugyanazt a csoportot).
- **Kérdés leállítása:**  
  A **`[ LEÁLLÍTÁS ]`** gombbal visszatérhetsz a várakozó / QR-kódos képernyőre.

---

## 📊 A 6 kérdéstípus részletesen

### 1. Szófelhő (`wordcloud`)
- **Résztvevő:** 3 beviteli mezőbe írhatja be a gondolatait.
- **Kivetítő:** Dinamikusan méretezett szófelhő. A többször beküldött szavak arányosan nagyobb méretben jelennek meg, mellettük a darabszámmal `[3]`.

### 2. Választás (`choice`)
- **Résztvevő:** Érintésbarát választókártyák (A, B, C, D...).
- **Kivetítő:** Valós idejű, animált vízszintes sávdiagram százalékokkal és szavazatszámokkal.

### 3. Rövid szöveges válasz (`text`)
- **Résztvevő:** Szabadszavas szövegmező karakterszámlálóval (max. 300 karakter).
- **Kivetítő:** Reszponzív üzenőfal minimalista archívum-kártyákkal.

### 4. Pontozás & Értékelés (`rating`) — *Skála 1–10-ig vagy akár 100-ig / %-ig*
- **1 és 10 közötti skála (pl. 1–5, 1–7 vagy 1–10):**
  - **Csillagok (★):** Interaktív aranyszínű csillagok érintésre kitöltéssel.
  - **Szívecskék (♥):** Piros szívecskék finom fénnyel.
  - **Számok (#):** Letisztult számozott gombok.
  - A kivetítőn a nagyméretű átlag mellett szintenkénti százalékos bontás látható.
- **10 feletti skála (pl. 0–100% vagy tetszőleges szám):**
  - Ideális olyan kérdésekhez, mint pl. *„Hány %-ban igaz az állítás?”* vagy *„Mekkora valószínűséggel javasolnád?”*.
  - A résztvevő egy **érintésbarát csúszkával és +/- léptetőkkel** (100-as skálánál gyorsgombokkal: 0%, 25%, 50%, 75%, 100%) állíthatja be a pontos értéket.
  - A csillag és szívecske szimbólumok ilyenkor automatikusan inaktívak a tiszta használhatóság érdekében.
  - A kivetítőn a pontos átlag mellett egy **5 tartományos eloszlási hisztogram** jelenik meg (pl. 0–20%, 21–40% stb.), valamint a legalacsonyabb és legmagasabb leadott szavazat.

### 5. 100 pont elosztása (`points100`)
- **Résztvevő:** Csúszkák és +/- léptetők segítségével kell elosztani pontosan 100 pontot az opciók között.
  - Élő egyenlegjelző mutatja a megmaradt pontokat.
  - Csak akkor engedélyezi a beküldést, ha a pontok összege pontosan 100.
  - Gyorsgombok: `[ EGYENLETES ]` (automatikus szétosztás) és `[ RESET ]`.
- **Kivetítő:** Az opciók átlagosan kapott pontszáma rangsorolt sávdiagramon.

### 6. 2x2-es rács (`grid2x2`)
- **Résztvevő:** Egyedi X és Y tengely (pl. *Ráfordítás* vs. *Várható hatás*). A résztvevő közvetlenül rákattinthat vagy ráérinthet a rácsra a pont elhelyezéséhez.
- **Kivetítő:** 4 kvadránsra osztott szálkeresztes koordináta-rendszer, ahol a résztvevők pontjai élő pontfelhőként jelennek meg.

---

## 🌍 Többnyelvűség (HU / EN / RO)

A képernyő jobb felső sarkában található a diszkrét nyelvválasztó:
- **`HU`** — Magyar
- **`EN`** — English
- **`RO`** — Română

A nyelvváltás azonnal érvénybe lép minden feliratra, gombra, beviteli mezőre és visszajelzésre. A böngésző helyileg megjegyzi a kiválasztott nyelvet (`localStorage`), így frissítéskor sem áll vissza.

---

## 🔒 Biztonság & Firebase Firestore szabályok

Az alkalmazás Firebase Firestore-t és Firebase Auth-ot használ. A résztvevőknek nem kell bejelentkezniük, de az Admin funkciók szigorúan védettek.

A Firebase Console-ban a **Firestore Database > Rules** fülön a következő szabályoknak kell aktívnak lenniük (tartalmazza a két engedélyezett címet):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Engedélyezett adminisztrátori e-mail címek
    function isAdmin() {
      return request.auth != null && request.auth.token.email in ['nadorig@gmail.com', 'prievarat@gmail.com'];
    }

    // Aktív szoba állapota: bárki olvashatja, csak adminisztrátor írhatja
    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Kérdésgyűjtemény: bárki olvashatja, csak adminisztrátor szerkesztheti
    match /questions/{questionId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Válaszok: bárki beküldhet (telefonról is), törölni csak adminisztrátor tudja
    match /responses/{responseId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if isAdmin();
    }
  }
}
```

---

## 🛠️ Helyi fejlesztés és futtatás

```bash
# Függőségek telepítése
npm install

# Helyi fejlesztői szerver indítása
npm run dev

# Termelési build készítése
npm run build
```

Az alkalmazás minden `main` ágra történő feltöltéskor (git push) a GitHub Actions segítségével automatikusan lefordul és frissül a GitHub Pages felületén.
