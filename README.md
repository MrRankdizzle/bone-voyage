# Bone Voyage

A gamified Skeletal System unit review for Human Anatomy & Physiology at Little Chute High School. Students check in at Mustang International, fly to eleven stops, earn a passport stamp at each one, and download their passport as evidence of completion.

It is a plain static site: no build step, no server, no accounts. Progress is saved in the browser on the device the student is using.

## The eleven stops

| Level | Stop | What students do |
|---|---|---|
| 1 | Baggage Claim | Sort bones by shape and by division |
| 1 | Alphabet Soup Café | Unscramble 15 bones to solve the pun |
| 1 | Skeleton Coast | Label 17 bones on the walking skeleton |
| 1 | Port Diaphysis | Tour the inside of a long bone |
| 1 | Osteon City | Zoom into compact bone and meet its cells |
| 2 | Captain's Log | Fill in the blanks of three log entries |
| 2 | Fracture Falls | Put bone healing in order, then heal a break |
| 2 | Joint Junction | Name six synovial joints and how they move |
| 2 | Calcium Cove | Run the calcium control tower |
| 3 | Mustang Memorial Clinic | Diagnose eight patients |
| 3 | Customs Checkpoint | 21 mixed questions with photos and graphs |

## Features

- Every activity checks itself; there are no "Check" buttons.
- Drag and drop also works by tapping a card and then tapping where it goes, and by keyboard.
- Settings: Text size, Read aloud, Easy-read font, High contrast, Calm mode (no moving animations), Sound effects, and Extra support (fewer answer choices, no decoy words, a slower calcium game, and a free first letter in Alphabet Soup).
- Hints from Marty are available at every stop and are counted on the passport.
- The passport downloads as a PNG or PDF with stamps, accuracy by level, big strengths, and areas to focus on while studying.

## Run it locally

Open `index.html` in a browser. Nothing needs to be installed.

## Put it on GitHub

1. Create a new, empty repository on GitHub (no README, no .gitignore; this folder already has both).
2. From this folder:

```
git init
git add .
git commit -m "Bone Voyage: Skeletal System unit review"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bone-voyage.git
git push -u origin main
```

GitHub Desktop works too: File, Add Local Repository, choose this folder, then Publish repository.

## Host it on Vercel

1. In Vercel, choose Add New, then Project, and import the GitHub repository.
2. Framework Preset: Other. Leave Build Command and Output Directory empty. Root Directory stays `./`.
3. Deploy. Every push to `main` redeploys automatically.

No `vercel.json` is needed. File names are case-sensitive on Vercel, so keep image names exactly as they are written in the code (all lowercase).

## What is in the folder

| Path | What it holds |
|---|---|
| `index.html` | The page shell: header, the four views, and the script tags |
| `css/style.css` | All styles |
| `js/core.js` | Saved progress, sounds, read-aloud, drag and drop, question types, settings, Marty's hints, navigation |
| `js/art.js` | Every illustration and icon drawn in code, plus the charts |
| `js/stops1.js` | Baggage Claim, Alphabet Soup Café, Skeleton Coast, Port Diaphysis, Osteon City |
| `js/stops2.js` | Captain's Log, Fracture Falls, Joint Junction, Calcium Cove |
| `js/stops3.js` | Mustang Memorial Clinic, Customs Checkpoint, the welcome screen, departures board, passport, and startup |
| `fonts/` | The two display fonts used for headings and the soup letters |
| `img/` | Photos, diagrams, and the Marty mascot |

The scripts load in the order listed in `index.html`, and that order matters.

## Making changes

- Questions and answer keys live next to each stop in `js/stops1.js`, `js/stops2.js` and `js/stops3.js`.
- To swap an image, replace the file in `img/` and keep the same file name. Labels on diagrams are positioned by percentage, so a replacement needs the same proportions as the original.
- Student progress is stored under the key `boneVoyage.v1` in the browser's local storage. Students can erase it from Settings, Start over.

## Credits

- Built for Mr. Rankin's Human Anatomy & Physiology classes at Little Chute High School.
- Height data in Customs Checkpoint: age and student-reported height of 24 students from Census at School, Table 1 of the American Statistical Association lesson "Scatter It!" (https://ww2.amstat.org/education/stew/pdfs/ScatterIt%21UsingCensusResults.pdf).
- Fonts: Lilita One and Fredoka (bundled in `fonts/`, SIL Open Font License); Atkinson Hyperlegible, Lexend and Special Elite (loaded from Google Fonts).
