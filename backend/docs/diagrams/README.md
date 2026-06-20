# Gambar Diagram Sistem — SoundWave (PNG)

Folder ini berisi **gambar diagram resolusi tinggi (PNG, scale 3x, background putih)** yang siap di-*drag & drop* ke dokumen **Makalah Project TWS (.docx)**.

| No | Diagram | File Gambar |
|----|---------|-------------|
| 1 | Use Case Diagram | [png/01-use-case.png](png/01-use-case.png) |
| 2 | Entity Relationship Diagram (ERD) | [png/02-erd.png](png/02-erd.png) |
| 3 | Logical Record Structure (LRS) | [png/03-lrs.png](png/03-lrs.png) |
| 4 | Class Diagram | [png/04-class.png](png/04-class.png) |
| 5 | Arsitektur Sistem | [png/05-arsitektur.png](png/05-arsitektur.png) |
| 6 | Component Diagram | [png/06-component.png](png/06-component.png) |
| 7 | Deployment Diagram | [png/07-deployment.png](png/07-deployment.png) |
| 8 | Sequence — Login | [png/08-sequence-login.png](png/08-sequence-login.png) |
| 9 | Sequence — Tambah Lagu ke Playlist | [png/09-sequence-playlist.png](png/09-sequence-playlist.png) |
| 10 | Activity — Registrasi & Auth | [png/10-activity-auth.png](png/10-activity-auth.png) |
| 11 | DFD — Context (Level 0) | [png/11-dfd-context.png](png/11-dfd-context.png) |
| 12 | DFD — Level 1 | [png/12-dfd-level1.png](png/12-dfd-level1.png) |
| 13 | Arsitektur Full-Stack (FE · BE · API · DB) | [png/13-arsitektur-fullstack.png](png/13-arsitektur-fullstack.png) |
| 14 | Sequence End-to-End (alur pemakaian web lengkap) | [png/14-sequence-end-to-end.png](png/14-sequence-end-to-end.png) |

## Struktur Folder
- `src/` — file sumber `.mmd` (Mermaid) yang dapat diedit.
- `png/` — hasil render gambar PNG.

## Cara Memasukkan ke Word
1. Buka file `.docx`.
2. Menu **Insert → Pictures → This Device**, lalu pilih gambar di folder `png/`.
3. Atau cukup *drag* file PNG dari File Explorer ke dalam dokumen.

## Cara Render Ulang (jika diagram diubah)
Edit file `.mmd` di folder `src/`, lalu jalankan dari folder `docs/diagrams`:

```bash
npx -y @mermaid-js/mermaid-cli -i src/02-erd.mmd -o png/02-erd.png -b white -s 3 -p puppeteer.json
```

> Diagram versi teks (Mermaid inline) yang dapat dirender di GitHub/VS Code ada di [../DIAGRAM-SISTEM.md](../DIAGRAM-SISTEM.md).
