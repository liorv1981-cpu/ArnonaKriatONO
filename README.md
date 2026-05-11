# מחשבון ארנונה קריית אונו 2026

אתר סטטי קטן לחישוב אומדן ארנונה לדירת מגורים רגילה בקריית אונו.

## קבצים

- `index.html` - ממשק המשתמש.
- `styles.css` - עיצוב רספונסיבי.
- `app.js` - חיבור הטופס ללוגיקה.
- `arnonaLogic.js` - תעריפים, כללי אזורים וחישוב.
- `arnonaLogic.test.js` - בדיקות לוגיקה עם Node.js.

## שימוש

פותחים את `index.html` בדפדפן.

## בדיקות

```powershell
node arnonaLogic.test.js
```

אם `node` לא זמין ב־PATH, אפשר להשתמש ב־Node המובנה של Codex:

```powershell
& 'C:\Users\liorv\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' arnonaLogic.test.js
```
