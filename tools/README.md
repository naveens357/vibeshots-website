# Media tools

Local scripts that turn the raw photos and videos in `../photo`, `../video` and `../media-inbox` into small web files in `../site/public/uploads`. The raw files are never committed (see `.gitignore`), and everything installs here on F:.

```bash
cd tools
npm install
```

| Script | What it does |
|---|---|
| `node contact-sheets.mjs out/sheets <folder> …` | Makes numbered thumbnail grids of every photo in a folder, so you can pick by number |
| `selection.json` | The picks: which photo numbers go into which story, project, the home page and the Images wall |
| `node process.mjs` | Resizes the picks to WebP (2000 px, or 2560 px for covers and heroes) in `site/public/uploads/<group>/` |
| `node make-small.mjs` | Adds a 900 px `-sm.webp` copy of every upload, so phones load light files |
| `node write-content.mjs` | Writes the stories, pre-weddings, projects, films, home, Images wall and covers from the processed photos |

## Video
ffmpeg is installed with the tools (`node_modules/ffmpeg-static/ffmpeg.exe`). For example, the home loop was made with:

```bash
ffmpeg -ss 36 -t 20 -i ../video/Hilight.mp4 -an -vf "scale=1600:-2,fps=24" -c:v libx264 -crf 27 -movflags +faststart ../site/public/uploads/home/hero-loop.mp4
```

## Adding a new wedding later
1. Put the photos in `media-inbox/<name>/`.
2. Run `node contact-sheets.mjs out/sheets ../media-inbox/<name>` and pick your numbers.
3. Add the folder to `sets` and a group to `groups` in `selection.json`.
4. Run `node process.mjs`, then `node make-small.mjs`.

Alternatively, upload photos straight through the content manager at `/admin`.
