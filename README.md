# חננאל — קישוטים לסוכה

אתר מכירות בעברית לקישוטי סוכה מאויירים בעבודת יד. בנוי ב-Next.js, רץ על Vercel, שומר נתונים ב-Neon, וגובה תשלום בטופס מאובטח של Morning / חשבונית ירוקה.

## מה יש בפרויקט

- דף בית, קטלוג, עמוד מוצר, עגלה ותשלום
- שתי גרסאות לכל דגם: בד עם עץ ומתלה, או A3 עם למינציה
- דשבורד ניהול לעריכת מוצרים, הזמנות ותוכן
- סליקת אשראי דרך Morning (בלי לקלוט כרטיס באתר)

## התקנה מקומית

```bash
npm ci
cp .env.example .env.local
```

מלאו את `.env.local`, ואז:

```bash
# יצירת hash לסיסמת ניהול
npx tsx -e "import bcrypt from 'bcryptjs'; bcrypt.hash('YOUR_LONG_PASSWORD', 12).then(console.log)"

# יצירת טבלאות ב-Neon
npm run db:push

# מוצרים ותוכן ראשוניים
npm run db:seed

npm run dev
```

האתר: [http://localhost:3000](http://localhost:3000)
הדשבורד: [http://localhost:3000/admin](http://localhost:3000/admin)

## Neon

1. צרו פרויקט ב-[Neon](https://console.neon.tech)
2. העתיקו את ה-pooled connection string ל-`DATABASE_URL`
3. העתיקו את ה-direct connection ל-`DATABASE_URL_UNPOOLED`
4. הריצו `npm run db:push` ואחריו `npm run db:seed`

## Morning / חשבונית ירוקה

1. במסלול Best ומעלה: אזור אישי → כלים למפתחים → מפתחות API
2. `MORNING_CLIENT_ID` / `MORNING_CLIENT_SECRET`
3. גלו את מזהה ספק הסליקה: `GET /documents/info?type=320` → `paymentPlugins[0].id` → `MORNING_PLUGIN_ID`
4. צרו `MORNING_WEBHOOK_TOKEN` אקראי ארוך
5. `NEXT_PUBLIC_SITE_URL` חייב להיות כתובת HTTPS ציבורית (Vercel)
6. התחילו ב-`MORNING_ENV=sandbox`

זרימת התשלום: לקוח ממלא פרטים → האתר יוצר הזמנה ממתינה → Morning מציג טופס סליקה → אחרי תשלום Morning מפיק חשבונית מס/קבלה ושולח webhook.

## Vercel

1. חברו את הריפו ל-Vercel
2. הוסיפו את אותם משתני סביבה
3. חברו את Neon דרך אינטגרציית Vercel אם תרצו
4. אחרי דיפלוי עדכנו את `NEXT_PUBLIC_SITE_URL` לדומיין האמיתי
5. הוסיפו `CRON_SECRET` — Vercel שולח אותו כל לילה ל-`/api/cron/expire-reservations`
6. ההתקנה ב-Vercel רצה מול `registry.npmjs.org` לפי `vercel.json`

## אבטחה

- הסיסמה נשמרת כ-bcrypt (עלות 12), לא בטקסט גלוי
- סשן הניהול הוא JWT ל-15 דקות, בעוגייה HttpOnly / Secure / SameSite=Strict
- מחירי הלקוח לא נסמכים עליהם: המחיר נשלף מחדש מ-Neon בקופה
- ה-webhook של Morning נבדק עם `?token=` ואז מאומת מול מסמך Morning
- אין טופס אשראי באתר — רק הפניה ל-Morning
