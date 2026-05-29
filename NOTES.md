# Projekt-Notizen — AD-Photography

Diese Datei sammelt Punkte, die wir bewusst aufgeschoben oder beobachtet haben.
Soll als Erinnerung dienen, wenn die Website wächst.

---

## Beobachten (Limits erreichbar, aber weit weg)

**Risiko: niedrig kurz-/mittelfristig — checken, wenn die Mengen größer werden.**

### Cloudflare Pages 20.000-Datei-Limit (Free Plan)
- Realistisch erst kritisch ab ca. 100 Alben mit 100 Fotos
- Eine WebP-Variante pro Foto reicht, keine Thumbnails-Vermehrung
- Wenn nah dran: ggf. auf Cloudflare R2 (Bucket) ausweichen oder Bilder auslagern

### Decap CMS Listen-Performance bei großen Alben
- Über ca. 200 Fotos pro Album wird die Bearbeitungsmaske träge
- Decap rendert React-Components für jedes Listen-Item
- **Praxis-Tipp:** Lieber mehrere Alben als ein Mega-Album

### Cloudflare Build-Timeout (20 Min)
- Im aktuellen Setup unkritisch (Build dauert Sekunden)
- Wird relevant, wenn wir später Bild-Komprimierung im Build-Prozess hinzufügen
- Cache-Layer (Hash-basiert) federt das ab

---

## Akzeptiert (langfristige Themen, später angehen)

**Risiko: niedrig im Alltag, hoch in den Folgen wenn nichts gemacht wird.**

### Decap CMS 3.1.3 ist eingefroren
- Wir aktualisieren bewusst nicht, weil Custom-Hacks kaputtgehen könnten
- Sicherheitsfixes oder neue Features gehen vorbei
- **In 1-2 Jahren:** geplantes Update mit Test-Tag dafür einplanen

### `index.html` als Single-File-Monolith (2.800+ Zeilen)
- Wird mit jedem Feature größer
- Refactoring (Vite/Webpack-Build, Module trennen) irgendwann sinnvoll
- Für aktuellen Funktionsumfang noch ok

### Decap hat keine eingebaute Bildverwaltung
- Alle Bilder liegen flach in `uploads/`, keine Album-Unterordner auf Datei-Ebene
- Keine eingebaute Duplikate-Erkennung
- Wenn ein Bild gelöscht wird, das ein Album referenziert: toter Link
  → Frontend zeigt Platzhalter statt Crash (defensiv gebaut)
- Das ist die Natur eines Git-basierten CMS

### Mehrsprachigkeit (DE/EN) Wartungsaufwand
- Jeder neue Beitrag braucht Pflege in beiden Sprachen, sonst Lücken
- Wenn EN nicht regelmäßig gepflegt wird: irgendwann entscheiden ob abschalten

### Backup-Konzept
- Bei GitHub-Account-Verlust oder Cloudflare-Sperrung: Daten weg
- **Empfehlung:** Alle paar Monate das Repo lokal klonen + externe Festplatte
- Dauert 2 Minuten, ist Lebensversicherung

---

## Bewusst aufgeschobene Entscheidungen

### Bild-Komprimierung im Build
- Recherchiert, aber bewusst NICHT gebaut
- Stattdessen: Pre-Upload-Komprimierung manuell (Squoosh o.ä.) als Workflow
- Warum: löst Repo-Größen-Problem mit, statt nur Live-Site
- Wenn das in der Praxis nervt → später Build-Komprimierung nachrüsten

### Beide-Richtungen-Verknüpfung Album ↔ Reise
- Bewusst nur einseitig (am Album setzen, am Trip nur Hinweis)
- Single Source of Truth → keine Inkonsistenzen
- Falls später beide änderbar gewünscht: hier dokumentieren und neu bewerten

---

*Letzte Aktualisierung: Mai 2026 — beim Umbau zum Alben-Konzept.*
