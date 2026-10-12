# Cursor-trail stickers

The twelve unchanged SVG illustrations are the public assets displayed in
[Skiper UI's Image Cursor Trail demo](https://skiper-ui.com/v1/skiper18), fetched
on October 12, 2026 from:

`https://skiper-ui.com/skiperv1/skiper18/mouse{1..12}.svg`

The demo credits [BeFreaky](https://www.befreaky.co/) by David Denni as its
inspiration. Skiper's page states that its free version requires attribution;
the home page links to both Skiper UI and BeFreaky beneath the intro.

`components/ui/image-cursor-trail.tsx` is a local implementation of the visible
interaction. It does not import or install Skiper's Pro component. The stickers
display at 80px, with their original aspect ratios and colors. They load only
when a mouse enters the home intro; touch and reduced-motion sessions skip them.
