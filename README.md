# CIEkawa Kawiarnia — landing page

Jednostronicowa strona kawiarni CIEkawa (ul. Adama Mickiewicza 16, Tarnobrzeg).

**Na żywo:** https://nyjah2115.github.io/ciekawa-kawiarnia/

## Uruchomienie

```bash
python3 -m http.server 8899 --directory .
```

Potem `http://localhost:8899`. Strona jest w pełni statyczna — wystarczy wrzucić
katalog na dowolny hosting.

## Struktura

```
index.html                treść + dane strukturalne JSON-LD (schema.org/CafeOrCoffeeShop)
assets/css/style.css      style
assets/js/main.js         wybór źródła wideo + stan nawigacji
assets/video/hero.mp4     wideo hero 1920×1080, 8 s
assets/video/hero-540.mp4 lżejsza wersja na telefony
assets/img/               zdjęcia lokalu, logo, plakat wideo
tools/seq.swift           wycinanie klatek z wideo
tools/logo.swift          wycinanie logo i usuwanie tła
tools/shrink.swift        mniejsza wersja wideo (AVFoundation, bez ffmpeg)
```

## Hero

Zapętlone wideo odtwarzane samo z siebie, w kadrze wtopionym w dół pierwszego
ekranu. Tekst i logo siedzą nad nim na czystym kremie, więc nic nie walczy
o kontrast z obrazem.

Źródło wideo ustawia JS zależnie od szerokości ekranu — telefon dostaje wersję
540p zamiast 1080p. `<source media>` już nie działa w przeglądarkach, stąd wybór
w skrypcie. Bez JS zostaje plakat z atrybutu `poster`, więc kadr i tak jest.

## Motyw i logo

Tło strony (`--cream`) to `#F9F4E7` — dokładny kolor tła z oryginalnego pliku
logo. Dzięki temu logo leży na kolorze, dla którego zostało zaprojektowane,
i nie trzeba go nigdzie przefarbowywać filtrem.

`tools/logo.swift` wycina kadr z pliku źródłowego i zamienia jednolite tło na
przezroczystość, licząc alfę z luminancji piksela — krawędzie zostają gładkie.

## Zdjęcia

Materiały od kawiarni, przeskalowane przez `sips`:

| Plik | Gdzie |
|---|---|
| `wlasciciele.jpg` | sekcja „O nas", też jako `og:image` |
| `latte.jpg` | pas „Nasza kawa" |
| `logo.png` | hero i stopka |
| `logo-znak.png` | nawigacja |

**Prawa do zdjęć i zgoda właścicieli na wizerunek do potwierdzenia przed
publikacją.**

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

Mapa to OpenStreetMap — nie wymaga klucza API ani zgody na cookies.

Wideo hero wygenerowane w OpenArt (PixVerse V6, 1080p, 8 s).

## Uwaga o cache

Odwołania do `style.css` i `main.js` mają znacznik `?v=`. Po zmianie tych
plików podbij numer, inaczej powracający goście dostaną wersję z cache.
