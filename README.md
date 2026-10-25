# Kremah Café — Standalone Edition

Kremah Café runs locally on Windows without XAMPP, Apache, PHP, MySQL, or phpMyAdmin. It uses a small local SQLite database created automatically in `data/kremah.sqlite`.

## Requirements

- Windows 10/11
- Node.js **22.13 or newer** (includes the built-in SQLite module)
- Internet connection for the first dependency installation and for the external fonts/Tailwind CDN used by the current design

## Start the app

1. Install Node.js 22.13+ from https://nodejs.org/ if it is not already installed.
2. Extract the entire ZIP to a writable folder (for example, `C:\KremahCafe`).
3. Double-click `start.bat` and wait for the server to start.
4. Open `http://localhost:3000` for the storefront.
5. Open `http://localhost:3000/Kremah%20Admin/` for the admin portal.

The first run installs Node dependencies. The app creates `data/` automatically and writes first-run administrator credentials to `data/first-run-admin.txt`. Sign in with those credentials, then keep them somewhere private and delete that text file. Do not share the `data` folder; it contains the database and application secrets.

## Data and backups

- Menu/CMS settings and customer orders are stored locally in `data/kremah.sqlite`.
- Admin sessions are stored in memory and are cleared when the server stops.
- The admin **Data Backup & Reset** export creates an Excel workbook of orders and order items. The reset action restores default CMS data and does not delete order history.
- To back up all app data, stop the server and copy the entire `data` folder to a secure location.
- To move the app to another PC, copy the project folder and its `data` folder, install Node.js 22.13+, then run `start.bat`.

## Troubleshooting

- If port 3000 is already in use, start from Command Prompt with `set PORT=3001` then `npm start`, and visit `http://localhost:3001`.
- Keep the server window open while using the app. Press Ctrl+C in that window to stop it.
- This is a local single-computer app and binds to `127.0.0.1`; it is not configured for public internet hosting.
