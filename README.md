# Attashad Digital Attendance — Exhibition Demo

A responsive HTML/CSS/JavaScript prototype for the merged ICS and Pre-Engineering class at Atta Shad College, Turbat.

## Important limitations

- This is a **demonstration only**, not a secure, operational college attendance system.
- It uses five clearly labelled sample students with `DEMO-` roll numbers. These are not official college roll numbers.
- Records are saved in the current browser using `localStorage`. They do not synchronize between devices and can be lost if browser data is cleared.
- The QR scanner only reads QR text; it does not verify student identity or mark attendance.
- There is no secure login, server-side database, role-based access, or reliable audit trail.
- Do not enter confidential student information or use this version for official attendance.
- A future production version needs a backend, database, secure authentication, permissions, backups, and tested synchronization.

## Features to test

- Dashboard and department counts
- Dashboard QR camera scanner that reads and displays QR text (requires internet to load the scanner library and camera permission)
- Student directory, search, add, edit and delete (demo records only)
- Subject and date selection
- Mark Present, Absent or Late
- Save and revisit a session
- Report filters and CSV export
- Entry timestamp separate from attendance date
- Duplicate roll number checks for added demo records
- Responsive layout for desktop and mobile

## Run locally

1. Extract the ZIP.
2. Open the extracted folder in Visual Studio Code.
3. Open `index.html` in your browser. If you have the VS Code Live Server extension, right-click `index.html` and choose **Open with Live Server**.
4. Use the sidebar to explore the screens.

## Publish on GitHub Pages

1. Sign in to GitHub and create a new public repository, for example `attashad-digital-attendance`.
2. Extract this ZIP on your computer.
3. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the **root** of the repository (not inside an extra nested folder).
4. Open repository **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**.
6. Select branch `main` and folder `/ (root)`, then click **Save**.
7. Wait for GitHub to publish the page. Open the URL shown in Settings → Pages.

GitHub's interface can change slightly over time. If the options look different, follow the current labels shown on your repository's Pages settings.

## Notes

- The interface lists the seven subjects currently identified. The Islamiyat and Physics teacher names are intentionally not invented.
- The current subject list is not a complete timetable; add periods and teacher assignments only after the college details are supplied.
- Sample student names and `DEMO-` IDs must be replaced only when the official roster is provided, and official college roll numbers must remain unchanged.


College branding update: the site header now shows the supplied Government Atta Shad Degree College Turbat logo and the featured student Sameer Rafeeq (Roll No. 2856, ICS, Session 2026–2028). The student profile is display-only demo content.
