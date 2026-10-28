# v17 — additions only (no existing line of your code was edited or deleted)

1. Logo: icons/logo.png replaced with the new Younis Vault logo (transparent background, used by header, sidebar, splash, login, onboarding).
   icons/icon-192.png, icon-512.png, apple-touch-icon.png replaced with the emblem (Y + padlock) on the navy background.
2. Card flip fix (css/fixes.css, 1 rule appended): draft.css `.bk` (bank row) collided with the flip class `.bk` of the card
   and collapsed the card into a thin line. `.ycard.bk{...}` cancels the collision for the card only.
3. sw.js: cache name yc-v16 -> yc-v17 so phones download the new files.
To undo: restore the 4 icon files, delete the v17 block at the end of css/fixes.css, set the cache name back to yc-v16.
