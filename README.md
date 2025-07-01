# 🚀 LinkedIn Learning Speed Unlocker + Overlay

A Tampermonkey userscript that unlocks the 2x speed cap on LinkedIn Learning videos. Includes:
- ✅ Custom speed up to **15x**
- ✅ Floating on-screen speed display
- ✅ Visual `+` / `–` buttons
- ✅ Keyboard support (`+` / `-` keys)
- ✅ Speed persistence across videos

---

## 🔧 Installation

1. **Install Tampermonkey**  
   - Chrome/Edge: [Tampermonkey Chrome Extension](https://tampermonkey.net/?ext=dhdg&browser=chrome)  
   - Firefox: [Tampermonkey for Firefox](https://tampermonkey.net/?ext=dhdg&browser=firefox)  

2. **Install the Script**
   - Copy the full userscript from [`LinkedIn-Learning-Speed-Unlocker.user.js`](./LinkedIn-Learning-Speed-Unlocker.user.js)
   - Open your Tampermonkey dashboard
   - Click `➕ Create a new script`
   - Paste the code and **Save**

---

## 🎮 How to Use

- **Overlay** appears in the **bottom-left corner of the video player**
- Click `+` / `–` to increase or decrease speed by `0.25x`
- Use keyboard:
  - `+` or `=` → Increase speed
  - `-` → Decrease speed
- Speed is remembered across videos and reloads
- Works up to **15x** speed

---

## 🧠 Technical Notes

- The script overrides the native `playbackRate` setter
- Uses `localStorage` to persist desired speed
- Re-applies settings when the video changes
- Handles LinkedIn’s player replacing the `<video>` element dynamically

---

## ❓ Troubleshooting

- ✅ Make sure the script is **enabled in Tampermonkey**
- ✅ Refresh the LinkedIn Learning page after installing
- ❌ Does **not work without Tampermonkey**

---

## 📜 License

MIT License
