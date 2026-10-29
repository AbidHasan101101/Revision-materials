# 🎓 HSC Science Revision Master (Interactive & Shareable)

An interactive, responsive, and shareable web application built to digitize and supercharge the complete **HSC Science Revision Tracker**, with support for custom user syllabus & tasks and dynamic Day/Night theming.

---

## 🎨 Theme & Color Palettes (Day / Night Mode Toggle)
Switch anytime via the **☀️ Day / 🌙 Night** button in the header:
- **Day Mode (Oceanic Palette)**:
  - Background: Pale Blue (`#CAF0F8`)
  - Surface: Soft Cyan (`#90E0EF`) & Pure White (`#FFFFFF`)
  - Primary Text: Dark Blue (`#023E8A`) & Deep Navy (`#03045E`)
  - Accent: Ocean Blue (`#0077B6`)
- **Night Mode (Midnight AMOLED Palette)**:
  - Background: Deep Midnight Navy (`#0B132B`)
  - Surface: Dark Slate Navy (`#1C2541`) & Charcoal (`#111827`)
  - Primary Text: Ice Blue (`#F0F9FF`)
  - Accent: Vivid Cyan (`#38BDF8`)

Theme choice persists in `localStorage` and automatically respects system dark mode preferences.

---

## 📚 Complete Syllabus & Custom Tasks Engine
Transcribed verbatim across all 7 subjects (151 default chapters, 906 milestones):
1. **বাংলা (Bangla)**: 41 topics (গদ্য, কবিতা, সহপাঠ, ব্যাকরণ ও নির্মিতি)
2. **English**: 29 topics (1st Paper 12 Units, 2nd Paper 17 items)
3. **তথ্য ও যোগাযোগ প্রযুক্তি (ICT)**: 6 chapters
4. **পদার্থবিজ্ঞান (Physics)**: 21 chapters (১ম ও ২য় পত্র)
5. **রসায়ন (Chemistry)**: 10 chapters (১ম ও ২য় পত্র)
6. **উচ্চতর গণিত (Higher Mathematics)**: 20 chapters (১ম ও ২য় পত্র)
7. **জীববিজ্ঞান (Biology)**: 24 chapters (উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান)

### ➕ Make Your Own Syllabus & Custom Tasks:
- **Add Custom Chapters**: Click **"+ Add Chapter"** in any section or subject banner to add your personal topics, mock tests, or revision goals.
- **Create New Subjects**: Click **"➕ New Subject"** to add brand new subjects (e.g. *Statistics*, *General Knowledge*, *Medical Admission Prep*, *Engineering Practice*).
- **Manage & Delete**: Easily prune or delete custom chapters and subjects in the **Manage** tab, or 1-click **Restore Official Default Syllabus** anytime.
- **Full Integration**: Custom subjects and chapters are seamlessly calculated in your overall percentage, stage breakdown, search, and JSON export/import!

---

## 🚀 Key Interactive Features
- **Free-Form Revision**: Check or uncheck any milestone across all 6 stages freely in any order that suits your study habits.
- **6 Checkpoints per Chapter**: Archive Class, Revision Note, Active Recall Card, MCQ Exam, Live Class, Test Paper Solving.
- **Dynamic Analytics**: Real-time circular percentage meter, tasks counter, countdown days to exam, and stage-by-stage distribution pills.
- **Pace Hint**: Calculates dynamic revision velocity next to the countdown (e.g. `120 days left • ~4.5 tasks/day to finish`).
- **Search & Filters**: Instant search by chapter title (Bangla & English). Filter by Paper (1st Paper, 2nd Paper, All) or status (Pending, In Progress, 100% Done).
- **Quick Row Actions**: 1-click "Mark All 6 Stages Done" or "Reset Chapter".
- **Chimes & Feedback**: Synthesized audio feedback via Web Audio API upon completing chapters (created lazily on first user gesture).

---

## 🔗 Shareability & Backup
1. **Compact Bitmask Share Links**: 
   - Encodes progress as a 6-bit per chapter bitmask in `#s=<base64url>&n=<name>`.
   - Backward compatible with `#share=` JSON links.
   - **Safe Import**: Imports only checkmarks without overwriting the importer's personal profile info.
2. **Clipboard Summary**: Formatted study progress summary ready to paste on WhatsApp or Facebook study groups.
3. **JSON Backup & Restore**: Download a `.json` backup file anytime (includes custom syllabus) and restore on any device.
4. **Print-to-PDF**: Dedicated `@media print` stylesheet that strips UI buttons and formats a clean physical checklist matching the original sheet.

---

## 📶 Offline Usage & Hosting Note
- **First Visit**: Requires an internet connection to download external dependencies (Tailwind CDN and Google Fonts).
- **Offline Caching**: The app installs a Service Worker (`sw.js`) that automatically caches application code, Tailwind CSS, and fonts so subsequent visits can run offline.
- **Hosting Requirement**: Service Workers require **HTTPS** (or `http://localhost`). When opened directly via local `file://` URLs, the app and local storage work immediately, but Service Worker caching is skipped due to browser security restrictions.

---

## 🌐 How to Deploy (Free)
1. **GitHub Pages**: Push this folder to a GitHub repository and turn on GitHub Pages under Settings > Pages (HTTPS is automatic!).
2. **Netlify Drop**: Drag and drop the `hsc-revision-tracker` folder directly into [Netlify Drop](https://app.netlify.com/drop) for instant live HTTPS hosting.
3. **Vercel**: Deploy directly via `vercel deploy`.
