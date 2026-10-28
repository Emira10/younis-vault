# v20 — additions only (no line of your existing code was edited or deleted)

Files added since v17: css/v18.css, js/v18data.js, js/v18.js. Changed: index.html (+3 lines), sw.js (cache v20).

1. Registration journey RESTORED exactly as it was: after Create account / first login it runs
   (Verify identity -> scan -> bank card -> face -> PIN). The KYC shortcut to it is visible again.
2. Start screen: logo + Log in + Create account (+ language). It replaces draft.js's old "Get started" screen.
3. Hidden (code untouched; delete the selector in v18.css to bring back): Bills & Services (tile + screen),
   the "Onboarding flow" tile on the dashboard, the "Request" button in the wallet.
4. Add wallet: 144+ currencies with search.  5. Receive > Country of residence: 243 countries.
6. Card flip fix (v17) and new logo (v17) still included.
To undo: remove the 3 lines from index.html and set the cache name in sw.js back to yc-v17.

7. v20: logo + 3 icons replaced by the new white monogram logo. Add wallet now also lists USD, EUR, TRY (and every wallet you already own, marked with a check; tapping those only shows a message and never touches the balance).
