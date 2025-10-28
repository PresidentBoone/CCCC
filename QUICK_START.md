# 🚀 Quick Start - Vite Build System

## Install Dependencies
```bash
npm install
```

## Development Commands

### Start Dev Server (Hot Reload)
```bash
npm run dev
```
Opens: `http://localhost:3000`

### Build for Production
```bash
npm run build
```
Output: `/dist` directory

### Preview Production Build
```bash
npm run preview
```
Opens: `http://localhost:4173`

### Analyze Bundle Size
```bash
npm run build:analyze
```
Opens: `stats.html` in browser

## Vercel Deployment

### Deploy to Production
```bash
npm run vercel:deploy
```

### Local Vercel Dev Server
```bash
npm run vercel:dev
```

---

## File Structure

```
public/          → Source files (edit here)
dist/            → Production build (auto-generated)
vite.config.js   → Build configuration
```

---

## Troubleshooting

### Clear and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Port Availability
```bash
lsof -i :3000
kill -9 <PID>
```

---

**Full Documentation**: See [BUILD_GUIDE.md](./BUILD_GUIDE.md)
