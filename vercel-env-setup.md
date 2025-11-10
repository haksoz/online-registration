# Vercel Environment Variables Setup

## 1. Vercel Dashboard'da Environment Variables Ekleyin:

### Database Connection (Railway'den alacağınız gerçek değerler)
```
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<railway-mysql-password>
DB_NAME=railway
```

### JWT & Auth
```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-chars
NEXTAUTH_SECRET=another-super-secret-key-for-nextauth-at-least-32-chars
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

### Optional Settings
```
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/tmp/uploads
```

## 2. Vercel Build Settings:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

## 3. Node.js Version:
- Vercel otomatik olarak uygun Node.js versiyonunu seçecek
- package.json'da engines belirtmek isterseniz:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```