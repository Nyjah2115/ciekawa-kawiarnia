# CIEkawa Kawiarnia — landing page

Jednostronicowa strona kawiarni CIEkawa (ul. Adama Mickiewicza 16, Tarnobrzeg)
z hero sterowanym scrollem: przewijanie strony przewija wideo klatka po klatce.

## Uruchomienie

```bash
python3 -m http.server 8899 --directory .
```

Potem `http://localhost:8899`. Strona jest w pełni statyczna — wystarczy wrzucić
katalog na dowolny hosting.

## Struktura

```
index.html              treść + dane strukturalne JSON-LD (schema.org/CafeOrCoffeeShop)
assets/css/style.css    style
assets/js/main.js       silnik scroll-scrubbingu
assets/frames/lg/       96 klatek 1280 px  (desktop, ~6,8 MB)
assets/frames/sm/       48 klatek  760 px  (telefon,  ~1,9 MB)
assets/video/hero.mp4   źródłowe wideo 1920×1080, 8 s (fallback)
assets/img/               zdjęcia lokalu i logo
tools/seq.swift           wycinanie klatek z wideo
tools/logo.swift          wycinanie logo i usuwanie tła
```

## Zdjęcia

Materiały od kawiarni, przeskalowane przez `sips`:

| Plik | Gdzie | Uwagi |
|---|---|---|
| `wlasciciele.jpg` | sekcja „O nas", też jako `og:image` | Angelika i Daniel przed lokalem |
| `latte.jpg` | pas „Nasza kawa" między menu a urodzinami | |
| `logo.png` | stopka | tło wycięte, kreska w jednym kolorze |
| `logo-znak.png` | nawigacja | sam znak, bez napisu |

Logo jest ciemną kreską na przezroczystym tle. Na ciemnych sekcjach podaje je
CSS: `filter: brightness(0) invert(1)` spłaszcza kreskę do czerni i wywraca na
krem, więc ten sam plik zadziała na dowolnym tle bez robienia wersji na biało.
Krem strony (`--cream`) to `#F9F4E7`, czyli dokładny kolor tła z oryginalnego
pliku logo.

**Prawa do zdjęć i zgoda właścicieli na wizerunek do potwierdzenia przed
publikacją.**

## Jak działa hero

`.scrollytelling` ma wysokość 600vh, a w środku `position: sticky` trzyma canvas
na ekranie. Postęp scrolla mapuje się na numer klatki i na widoczność kolejnych
napisów (tablica `BEATS` w `main.js`).

Scroll nie steruje obrazem wprost. Kółko myszy przewija skokowo (~100 px na
"klik"), co przy 96 klatkach na 4070 px oznaczałoby przeskok o 2–3 klatki naraz.
Zamiast tego renderowana pozycja goni pozycję scrolla z tłumieniem (`SMOOTHING`
w `main.js`), a dwie sąsiednie klatki są mieszane proporcjonalnie do pozycji
między nimi — 96 plików wygląda jak kilkaset. Jeden "klik" kółka daje 22
pośrednie stany zamiast 2–3, przy stabilnych 60 fps.

Klatki, nie `<video>`, bo przewijanie `video.currentTime` szarpie przy szybkim
scrollu. Klatki wczytują się progresywnie — najpierw co ósma, potem reszta —
więc animacja działa zanim wszystko się pobierze. Gdy po 6 s nie wczyta się ani
jedna klatka, strona przełącza się na `hero.mp4`.

Telefon dostaje o połowę mniej klatek w mniejszej rozdzielczości.

## Wymiana wideo

1. Podmień `assets/video/hero.mp4`.
2. Wytnij klatki (skrypt w `tools/seq.swift`):
   ```bash
   swift tools/seq.swift assets/video/hero.mp4 assets/frames/lg 96 1280 0.52
   swift tools/seq.swift assets/video/hero.mp4 assets/frames/sm 48 760  0.55
   ```
3. Dopasuj zakresy w tablicy `BEATS` w `assets/js/main.js` do nowych scen.

## Skąd pochodzą dane

| Element | Źródło |
|---|---|
| Adres, telefon, godziny, 4,9★ / 220 opinii, przedział 20–40 zł, współrzędne | Google Maps (profil firmy) |
| Cytaty gości | opinie Google (imiona skrócone) |
| Hasło „Twoje miejsce z duszą", e-mail, Instagram, 100% poleca (25 opinii) | Facebook `/CIEkawaKawiarnia` |
| Coffee Rave 28.08, DJ NOXY 13:30, promocje urodzinowe | post na Facebooku |
| Właściciele, historia, palarnia z Gdańska, chemex, Poranek Sułtana, sałatka Kozimierz, ~20 miejsc, ogródek | reportaż `tarnobrzeg.naszemiasto.pl` (04.09.2025) |

**Do potwierdzenia z właścicielami przed publikacją:** aktualne godziny
(Google podaje 9–18, artykuł z 2025 r. mówił o 9–19 i sobocie do 20),
ceny i skład karty, oraz zgoda na wykorzystanie cytatów z opinii.

Mapa to OpenStreetMap — nie wymaga klucza API ani zgody na cookies. Żeby wrócić
do Google Maps, podmień `src` iframe'a w sekcji `#kontakt`.

Wideo hero wygenerowane w OpenArt (PixVerse V6, 1080p, 8 s).
