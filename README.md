# 🏏 RCB vs SRH - Digital Stadium

A real-time "Fan War" web app for the IPL 2026 season opener. Split-screen chat where fans of RCB and SRH can shout, chat, and see who's louder in real-time!

![RCB vs SRH](https://www.ipl.in/static/images/teams/rcb-logo.png) VS ![SRH](https://www.ipl.in/static/images/teams/srh-logo.png)

## Features

- 🎯 **Split-Screen Layout** - RCB (Red/Gold) on left, SRH (Orange/Black) on right
- 💬 **Real-Time Chat** - Fans can see both team chats but only post to their own
- 📊 **Live Shout Counter** - See global shout counts for both teams
- ⚡ **Power Meter** - Visual indicator of which team is "louder" in last 60 seconds
- 📱 **Mobile Responsive** - Stacks vertically on mobile

## 🚀 Quick Start

### 1. Get Ably API Key

1. Go to [ably.com](https://ably.com) and sign up for free
2. Click "Create new app"
3. Name it: `rcb-vs-srh-war-room`
4. Select region: **Asia Pacific (Mumbai)**
5. Copy your **API key** (starts with `xxxx.xxxx:`)

### 2. Update the Code

Open `js/app.js` and replace the placeholder:

```javascript
const ABLY_API_KEY = 'YOUR_ABLY_API_KEY_HERE';
// Replace with your actual Ably API key
```

### 3. Run Locally

Open `index.html` in your browser, or serve it:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Then open `http://localhost:8000`

## 🖥️ Deployment

### GitHub Pages (Free & High Traffic Ready)

1. Create a new repository on GitHub
2. Push this code:

```bash
git init
git add .
git commit -m "Initial commit: RCB vs SRH Digital Stadium"
git remote add origin https://github.com/YOUR_USERNAME/repo-name.git
git push -u origin main
```

3. Go to **Settings → Pages**
4. Select **main** branch and click Save
5. Your app will be live at `https://YOUR_USERNAME.github.io/repo-name/`

## 📣 Promotion

### Hashtags
- **#RCBvsSRH** - Main tag
- **#IPL2026** - Season tag
- **#DigitalStadium** - App tag

### When to Share
- 1 hour before toss (6:30 PM IST)
- During toss announcement
- At match start (7:30 PM IST)

### Share Text Example
> 🏏 RCB vs SRH Season Opener! Join the Digital Stadium and shout for your team! Who's louder? Find out live 🔥 #RCBvsSRH #IPL2026 #DigitalStadium

## 🤝 Contributing

Feel free to add more IPL teams, animations, or features!

## ⚠️ Notes

- The Ably free tier supports 100 concurrent connections - great for the first match!
- For scale, upgrade to Ably Pro (~$100/month for 1000+ connections)
- Chat messages are not stored - refresh = messages gone (add backend for persistence)

---

**Let's make some noise!** 🔥🏏
