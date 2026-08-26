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

## Ekran startowy

Przy wejściu kremowa zasłona z logo. Logo „nalewa się" od dołu (kopia w 11%
krycia pod spodem, na niej pełna wersja przycinana rosnącym kontenerem), potem
gaśnie, a 160 ms po nim tło pęka na dwie połowy rozjeżdżające się w górę i w dół.

Kolejność jest istotna: logo schodzi **przed** zasłoną. Gdy gasło równolegle,
wisiało nad już odsłoniętą stroną. Wejście logo idzie przez klasę, nie przez
`@keyframes … forwards` — animacja z fill-mode nadpisuje `opacity` ustawiane
przejściem, więc reguła wyjścia nigdy nie dochodziła do skutku.

Czasy trzymane w zmiennych CSS (`--logo-zanik`, `--logo-wyprzedzenie`,
`--rozsuwanie`) i powtórzone w `main.js`, bo skrypt musi wiedzieć, kiedy zdjąć
zasłonę. Przy zmianie jednego trzeba poprawić drugie.

Postęp jest wiązany z realnymi sygnałami (`loadeddata` wideo, `window.load`),
z podłogą 1400 ms, żeby animacja nie mignęła, i sufitem 3,5 s, żeby wolna sieć
nikogo nie uwięziła na zasłonie.

**Wideo czeka na pierwszej klatce**, dopóki zasłona nie ruszy — inaczej leciałoby
pod spodem i po odsłonięciu byłoby już kilka sekund do przodu. Atrybut `autoplay`
zostaje w HTML dla przeglądarek bez JS, a skrypt zatrzymuje wideo i cofa je na
zero; gdy metadane jeszcze nie doszły, przypisanie `currentTime` przepada, więc
powtarzamy je po `loadedmetadata`.

Dwie osobne klasy na `<html>`: `splash-lock` blokuje scroll i schodzi już na
starcie rozsuwania, `splash-on` odpowiada za widoczność i schodzi dopiero po
animacji. Klasę dopisuje wbudowany skrypt w `<head>`, przed pierwszym
malowaniem — strona nie mignie pod zasłoną, a bez JS ekran w ogóle się nie
pojawia i nic nie zostaje na wierzchu.

Warianty wyjścia do porównania są w `prototyp/ekran-startowy.html` na gałęzi
`prototyp-ekran-startowy` (katalog jest w `.gitignore`, nie trafia na Pages).

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

## Pojawianie się przy przewijaniu

Nagłówki, karty i zdjęcia wjeżdżają, gdy sekcja dochodzi do dolnej krawędzi
ekranu. Rodzeństwo w obrębie jednej grupy dostaje narastające opóźnienie, więc
wchodzi kaskadą.

Klasę `.wjazd`, która ukrywa element, **dokłada skrypt**, a nie HTML. Bez JS nic
nie jest schowane i strona wygląda normalnie — animacja jest dodatkiem, nie
warunkiem widoczności.

Wyzwalaczem jest sprawdzanie prostokątów przy przewijaniu, nie
`IntersectionObserver`. Do tego dwa zabezpieczenia, bo elementy startują
niewidoczne i awaria zostawiłaby pustą stronę:

- odczyt, w którym **wszystkie** prostokąty mają `top: 0`, jest odrzucany —
  to znaczy, że przeglądarka nie policzyła jeszcze layoutu, a próg
  przepuściłby wtedy całą stronę naraz;
- po 9 sekundach treść pokazuje się bezwarunkowo.

## Motyw i logo

Tło strony (`--cream`) to `#F9F4E7` — dokładny kolor tła z oryginalnego pliku
logo. Dzięki temu logo w stopce leży na kolorze, dla którego zostało
zaprojektowane, bez żadnego filtra. Jedyne miejsce, gdzie jest przefarbowywane,
to nawigacja leżąca na wideo — i tylko do momentu jej przyklejenia.

`tools/logo.swift` wycina kadr z pliku źródłowego i zamienia jednolite tło na
przezroczystość, licząc alfę z luminancji piksela — krawędzie zostają gładkie.

## Zdjęcia

| Plik | Gdzie | Skąd |
|---|---|---|
| `fb-kawa.jpg` | slajd „Kawa speciality" | Facebook kawiarni |
| `fb-matcha.jpg` | slajd „Matcha i herbaty" | Facebook kawiarni |
| `fb-sniadania.jpg` | slajd „Śniadania" | Facebook kawiarni |
| `fb-wypieki.jpg` | slajd „Wypieki i lunch" | Facebook kawiarni |
| `fb-mrozona.jpg` | pas „Nasza kawa" | Facebook kawiarni |
| `fb-rave.jpg` | sekcja urodzinowa — plakat Coffee Rave | Facebook kawiarni |
| `wlasciciele.jpg` | „O nas", slajd „Ogródek i sala", `og:image` | od kawiarni |
| `logo.png`, `logo-znak.png` | hero 2, nawigacja, stopka | od kawiarni |

Zdjęcia z Facebooka pobrane z publicznej galerii profilu w pełnej rozdzielczości
(pominięcie parametru `ctp` w adresie CDN daje oryginał zamiast miniatury
414 px), następnie przeskalowane przez `sips` do 900 px.

Wcześniejsze slajdy korzystały ze stopklatek wyciętych z wideo hero, czyli
z grafiki wygenerowanej w OpenArt. Zostały zastąpione prawdziwymi zdjęciami dań
i są dostępne w historii gita.

**Prawa do zdjęć i zgoda właścicieli na wizerunek do potwierdzenia przed
publikacją** — materiały pochodzą z profilu kawiarni, ale repozytorium jest
publiczne.

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

Odwołania do `style.css` i `main.js` mają znacznik `?v=`. **Po każdej zmianie
tych plików podbij numer.** Dotyczy to też pracy lokalnej: przeglądarka trzyma
`main.js?v=N` pod tym samym adresem, więc dopóki numer się nie zmieni, kolejne
edycje skryptu w ogóle do niej nie docierają — łatwo wtedy godzinę debugować
kod, który nigdy się nie wykonał.
