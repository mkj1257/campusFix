<div align="center">

# 🔧 CampusFix

### Real-Time Campus Issue Reporting & Tracking Dashboard

A sleek, single-page web application where college students can report campus maintenance issues, upvote existing problems, and staff can manage issue resolution — all in real time.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F4C81?style=for-the-badge)](LICENSE)

</div>

---

## 📸 Preview

| Active Issues Dashboard | Staff Management Mode |
|---|---|
| Report, upvote, search & filter campus issues | Log in as staff to update statuses & manage issues |

---

## ✨ Features

### 🎓 For Students
- **Report Issues** — Submit campus maintenance problems with category, location, description, and urgency level
- **Upvote System** — Upvote existing issues to signal priority (toggle on/off)
- **Live Search & Filter** — Search by location or keywords, filter by category
- **Sort Controls** — Sort by Newest, Most Upvoted, or Highest Urgency
- **Responsive Design** — Two-column layout on desktop, single-column on mobile

### 🛠️ For Staff / Admins
- **Staff Login** — Log in with any username & password to unlock management controls
- **Update Status** — Mark issues as *Pending*, *In Progress*, or *Resolved* directly on cards
- **Reopen Issues** — Reopen resolved issues if they recur
- **Delete Issues** — Remove invalid or duplicate reports
- **Visual Indicators** — Staff mode banner and highlighted control panels on each card

### 📊 Dashboard Views
- **Active Issues** — Shows all *Pending* and *In Progress* issues (default view)
- **Resolved Archive** — Dedicated view for completed repairs with live count badges
- **Empty States** — Contextual empty states for both views

### 🎨 Design System
| Token | Value | Usage |
|---|---|---|
| Primary | `#0F4C81` | Buttons, headers, active states, focus rings |
| Secondary | `#64748B` | Labels, subtitles, borders, secondary buttons |
| Tertiary | `#F8FAFC` | Backgrounds, input fields |
| Neutral | `#1E293B` | Header bar, body text, inverted buttons |

| Font | Family | Usage |
|---|---|---|
| Headline | [Manrope](https://fonts.google.com/specimen/Manrope) | Headings, logo, card titles |
| Body / Label | [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) | Body text, labels, buttons, badges |

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools, frameworks, or backend required

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/campusfix.git
   cd campusfix
   ```

2. **Open in browser**

   Simply open `index.html` in your browser:

   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

   **Or** serve locally with any HTTP server:

   ```bash
   # Python
   python3 -m http.server 8080

   # Node.js (npx)
   npx -y serve .
   ```

   Then visit [http://localhost:8080](http://localhost:8080)

---

## 📁 Project Structure

```
campusfix/
├── index.html      # Main HTML page with Tailwind CSS styling
├── app.js          # Vanilla JavaScript application logic
└── README.md       # This file
```

| File | Description |
|---|---|
| `index.html` | Complete page layout — header navigation, report form, filters bar, issue feed, login modal, and toast container. Uses Tailwind CSS via CDN. |
| `app.js` | All application logic — localStorage CRUD, form handling, upvote toggle, search/filter/sort, view switching, staff authentication, and DOM rendering. |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 (Semantic) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) via CDN |
| **Icons** | [Font Awesome 6](https://fontawesome.com/) |
| **Fonts** | [Manrope](https://fonts.google.com/specimen/Manrope) + [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) via Google Fonts |
| **Storage** | Browser `localStorage` (no backend) |

---

## 💾 Data & Storage

All data is persisted in the browser's `localStorage`:

| Key | Description |
|---|---|
| `campus_issues` | JSON array of all issue objects |
| `campus_upvoted_ids` | JSON array of issue IDs the current user has upvoted |

### Issue Object Schema

```json
{
  "id": "issue-1719849382910-427",
  "category": "Wi-Fi/IT",
  "location": "Central Library, 2nd Floor",
  "description": "Wi-Fi keeps dropping every 10 minutes",
  "urgency": "High",
  "status": "Pending",
  "upvotes": 12,
  "timestamp": 1719849382910
}
```

### Categories

| Category | Icon |
|---|---|
| Classroom / Lab | 🏫 |
| Wi-Fi / IT Infrastructure | 📶 |
| Sanitation & Restroom | 🧹 |
| Electricity & HVAC | ⚡ |
| Other / General Repair | 🛠️ |

### Statuses

| Status | Meaning |
|---|---|
| `Pending` | Newly reported, awaiting review |
| `In Progress` | Staff has acknowledged and is working on it |
| `Resolved` | Issue has been fixed |

---

## 🔐 Staff Login

Click the **Log In** button in the header to access staff management controls.

- **Any non-empty username and password** will grant access
- Staff mode reveals action buttons on each issue card:
  - **Mark In Progress** — Move from Pending to In Progress
  - **Mark Resolved** — Close the issue
  - **Reopen** — Move resolved issues back to Pending
  - **Delete** — Permanently remove an issue

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for campus communities everywhere

**[⬆ Back to Top](#-campusfix)**

</div>
