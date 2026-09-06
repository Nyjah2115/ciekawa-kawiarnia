# Kawiarnia NOTA — projekt koncepcyjny

Jednostronicowa strona dla lokalu gastronomicznego, zbudowana jako **projekt
demonstracyjny do portfolio**. Marka, dane kontaktowe, godziny i opinie są
fikcyjne. Zdjęcia pochodzą z Unsplash (licencja darmowa, komercyjna, bez wymogu
atrybucji). Wideo w hero wygenerowane w OpenArt.

**Na żywo:** https://nyjah2115.github.io/ciekawa-kawiarnia/

## Uruchomienie

```bash
python3 -m http.server 8899 --directory .
```

Strona jest w pełni statyczna — wystarczy wrzucić katalog na dowolny hosting.

## Struktura

```
index.html                treść
assets/css/style.css      style
assets/js/main.js         ekran startowy, wideo, karuzela, animacje wejścia
assets/video/hero.mp4     wideo hero 1920×1080, 8 s
assets/video/hero-540.mp4 lżejsza wersja na telefony
assets/img/               zdjęcia stockowe i plakat wideo
tools/                    skrypty pomocnicze (Swift + AVFoundation, bez ffmpeg)
```

## Co pokazuje ten projekt

- **Ekran startowy** — sygnatura „nalewa się" od dołu, potem tło pęka na dwie
  połowy i odsłania hero. Logo schodzi przed zasłoną, nie razem z nią.
- **Hero na cały ekran** z zapętlonym wideo w naturalnym kolorze; wideo czeka na
  pierwszej klatce, dopóki zasłona nie ruszy. Miękkie przyciemnienie na szwie
  pętli zamiast twardego cięcia.
- **Drugie hero** wjeżdża na pierwsze przy przewijaniu.
- **Karuzela 3D** w sekcji menu — port komponentu reactowego na czysty DOM.
- **Opinie** jako karty krążące wokół treści, wchodzące kaskadą ze sprężyną.
- **Kontakt** z żywym statusem otwarcia liczonym z zegara gościa i ziarnami kawy
  dryfującymi w tle.
- **Pojawianie się przy przewijaniu** dla całej reszty strony.

Szczegóły techniczne każdego z tych mechanizmów — w komentarzach w kodzie.

## Uwagi

Klasy ukrywające elementy dokłada skrypt, nie HTML: bez JavaScriptu nic nie
znika, animacje są dodatkiem, a nie warunkiem widoczności. Każdy mechanizm,
który startuje z ukrytą treścią, ma zabezpieczenie na wypadek niezadziałania
wyzwalacza.

Odwołania do `style.css` i `main.js` mają znacznik `?v=`. **Po każdej zmianie
tych plików podbij numer**, także przy pracy lokalnej — przeglądarka trzyma je
pod tym samym adresem i kolejne edycje do niej nie docierają.
