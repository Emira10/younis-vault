# v21 — layout fix (phone + laptop). Additions only: no existing line of code was edited or deleted.

Changed files vs v20: css/v18.css (3 small blocks appended at the end), sw.js (cache name yc-v21), this note.

Cause of the broken phone / overlapping laptop layout (present since v16, not introduced later):
 css/style.css makes .app a grid whose content column is "1fr" (= minmax(auto,1fr)). The wallet cards row (#wallets, cards min-width 220px)
 forced <main> to ~1100px, so a phone laid the page out ~1100px wide (then zoomed out / scrolled sideways) and on a laptop the right side
 was pushed off-screen (balance cut, buttons overlapping the edge).
Fixes (all in css/v18.css):
 1. main{min-width:0} + .app columns "250px minmax(0,1fr)" (phone: "minmax(0,1fr)").
 2. Design System tables scroll inside themselves on phones (they were 440px wide).
 3. Arabic on phones: balance font size scales (it was ~36px wider than the screen and pushed the page sideways).
Tested: 15 screens x English/Arabic/Swedish x phone 390 / phone 360 / laptop 1280 -> no horizontal overflow, no JS errors.
To undo: restore css/v18.css and sw.js from v20.
