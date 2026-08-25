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

Zapętlone wideo na cały ekran, w naturalnym kolorze — bez filtrów i bez
kolorowej zasłony na całym kadrze. Nad wideo jest tylko napis; logo siedzi
w nawigacji i w stopce.

Wideo jest jasne, więc kremowy tekst na najjaśniejszych ujęciach schodziłby do
kontrastu 2,0. Zamiast przyciemniać cały kadr, `.hero__scrim` kładzie miękką
poświatę tylko pod samym napisem (radialny gradient), plus wąskie pasy u góry
pod nawigację i na dole pod styk z kremową sekcją. Reszta kadru zostaje
nietknięta. W najgorszym przypadku daje to 5,8 dla nagłówka, 5,1 dla podtytułu
i 4,9 dla nadtytułu.

Nawigacja nad wideo jest jasna; po przyklejeniu dostaje kremowe tło, a znak
firmowy wraca do swojego koloru (`filter` zdejmowany razem z klasą `is-stuck`).

Źródło wideo ustawia JS zależnie od szerokości ekranu — telefon dostaje wersję
540p zamiast 1080p. `<source media>` już nie działa w przeglądarkach, stąd wybór
w skrypcie. Bez JS zostaje plakat z atrybutu `poster`.

## Przejście do drugiego hero

Hero 1 jest `position:sticky`, a hero 2 leży pod nim w normalnym przepływie —
przy scrollu wjeżdża na wideo jak podnoszona karta (zaokrąglone górne rogi,
cień od góry). Skrypt dodatkowo wygasza i lekko odsuwa treść pierwszego hero,
żeby to nie było samo nasunięcie.

Hero 2 to moment marki: logo w pełnej skali na swoim własnym kremie, hasło
kawiarni i trzy fakty (ocena, godziny, adres).

Nawigacja przykleja się dopiero wtedy, gdy hero 2 dojdzie pod jej dolną
krawędź — nie po `scrollY > 40`, bo nad wideo pasek musi zostać przezroczysty
przez całą wysokość pierwszego ekranu.

## Szew pętli wideo

Wideo zaczyna się ziarnami, a kończy sernikiem, więc `loop` dawał widoczne
twarde cięcie. `.hero__dip` przyciemnia kadr przez 0,55 s po obu stronach szwu,
sterowane z `currentTime` po krzywej smoothstep. Na styku obie strony wychodzą
na tej samej wartości (0,88), więc nie ma przeskoku — czyta się jak miękkie
mrugnięcie. Pętla `requestAnimationFrame` chodzi tylko wtedy, gdy hero jest na
ekranie (IntersectionObserver).

## Karuzela w sekcji menu

Sekcja „Co u nas znajdziesz" to karuzela 3D w stylu coverflow: karta centralna
na wprost, sąsiednie odsunięte, przeskalowane i obrócone w osi Y, dalsze
przygaszone i rozmyte.

**Uwaga o stacku:** to jest port komponentu reactowego (shadcn/Tailwind/TS) na
czysty DOM. Projekt jest statycznym HTML/CSS/JS bez kroku budowania, więc
komponentu nie dało się wkleić jako `.tsx`. Zachowanie zostało to samo:
autoplay 5 s z pauzą na hover i focus, strzałki, kropki, klawiatura (tylko gdy
karuzela jest na ekranie, żeby nie przechwytywać strzałek podczas czytania
reszty strony), swipe na dotyku. Karty poza środkiem dostają `aria-hidden`,
a autoplay stoi przy schowanej karcie i poza ekranem.

Gdyby projekt miał kiedyś przejść na Reacta, potrzebowałby: Next.js albo Vite
z TypeScriptem, Tailwinda i `npx shadcn@latest init`. Dla jednej sekcji na
statycznej stronie to nieproporcjonalny koszt — stąd port.

## Motyw i logo

Tło strony (`--cream`) to `#F9F4E7` — dokładny kolor tła z oryginalnego pliku
logo. Dzięki temu logo w stopce leży na kolorze, dla którego zostało
zaprojektowane, bez żadnego filtra. Jedyne miejsce, gdzie jest przefarbowywane,
to nawigacja leżąca na wideo — i tylko do momentu jej przyklejenia.

`tools/logo.swift` wycina kadr z pliku źródłowego i zamienia jednolite tło na
przezroczystość, licząc alfę z luminancji piksela — krawędzie zostają gładkie.

## Zdjęcia

Materiały od kawiarni, przeskalowane przez `sips`:

| Plik | Gdzie |
|---|---|
| `wlasciciele.jpg` | sekcja „O nas", slajd „Ogródek i sala", `og:image` |
| `latte.jpg` | pas „Nasza kawa", slajd „Kawa speciality" |
| `k-*.jpg` | slajdy karuzeli — stopklatki z `hero.mp4` (`tools/still.swift`) |
| `logo.png` | hero i stopka |
| `logo-znak.png` | nawigacja |

Slajdy `k-matcha`, `k-ziarna` i `k-sernik` to stopklatki z wideo hero, czyli
grafika wygenerowana w OpenArt — nie zdjęcia realnych dań CIEkawej. Do podmiany
na prawdziwe fotografie karty, gdy tylko będą dostępne; slajd o śniadaniach jest
najsłabiej dopasowany, bo pokazuje ziarna zamiast jedzenia.

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
