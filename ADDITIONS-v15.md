# v15 — additions only (nothing deleted, no existing code edited)

New files: css/addons.css · js/addons.js · wireframes.html · this file
Touched (lines added only): index.html (+2 preconnect, +1 css link, +1 script), sw.js (cache list)

1. Transfer screen: sender, recipient name, recipient currency, 4 corridors (Europe→UAE, UAE→Europe, Within Europe, Global), live rate with time, full fee box
2. P2P "free" only for registered members; phone, email or @user ID; unregistered shows an amber notice and is blocked
3. Fixed bank charge is now really debited, so disclosed fees = balance change
4. Receipt: recipient name + account, sent/received amounts and currencies, rate, fixed charge, total fees, corrected total debited
5. Bank search: ~190 banks / 45+ countries, monogram badges, linked-banks list (real logos need a licensed Open Banking provider)
6. Languages: 51 in the picker with search, RTL for ar/he/fa/ur, choice remembered after reload. Only EN/AR/SV are fully translated; others fall back to English
7. KYC screen: "Residency + Passport" option with its own scan, plus shortcut to the guided onboarding
8. Add wallet: choose the currency (12 extra, incl. Gulf currencies)
9. wireframes.html: 2 flows, 15 screen wireframes, proposed timeline. Linked from the dashboard tiles and Design System page
10. Settings → Brief mode: hides Vaults and Insights (off by default)
To remove everything: delete the addons.css link and addons.js script from index.html.
