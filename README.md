# Project tracker

A simple website for projects, tasks, deadlines, and completion tracking. Includes overdue indicators, task filters, and JSON backup downloads.

## Open without installing anything

Open `public/index.html` in a modern browser. Keep the website files together and use the same browser and folder to retain saved data. Browser storage for local files varies by browser; download backups regularly.

## Run with a local server (optional)

Install Node.js 20 or newer, open a terminal in this folder, and run:

```sh
npm start
```

Open http://localhost:3000 in your browser on your computer. Stop the server with Ctrl+C. Set PORT to choose another port. No package installation or credentials are required.

Projects are stored in this browser's local storage. They are not shared between devices, browsers, or other people. Clearing browser data removes them. Download backups to keep a separate copy; use Restore backup to load a downloaded JSON backup (this replaces the projects currently in that browser). This first version has no accounts or database.

The `public` directory contains the website; `server.js` serves it with Node's built-in HTTP server. This is a local development server, not a production hosting setup.

## Purchases, POs, and invoices

Select a project and use Purchases, POs & invoices to add an item or service, optional vendor, and optional PO number. Check Bid sheet sent, PO received, Item / service received, and Invoice received as each event happens. Invoice received is disabled until the item or service is received. Undoing receipt clears invoice status after confirmation. This tracks status only; it does not create invoices, store documents, or process payments. Purchase counts show pending receipt, pending invoice, and completed purchases.

Before updating your downloaded copy, click Download backup in the old copy. Extract the new GitHub ZIP fully, open public/index.html, and use Restore backup if your projects do not appear. Keep a backup before restoring, because restore replaces current projects. Older backups without purchases remain supported.

## Employee evaluations and dashboard

Add each employee once in Employee evaluations. Regular employees get one interim and one final per calendar year. Probationary employees get two interims and a final over their first year. Default suggested deadlines are June 30 / December 31 for CY reviews and 4 / 8 / 12 months from the probationary start date. These are editable defaults, not a statement of your organization's policy. Month-end dates are clamped to the last valid day (a February 29 anniversary becomes February 28 in a non-leap year). Start date is required for probation; regular employees can leave it blank and choose the first calendar year to track.

Check a review to complete it; completed reviews retain their completion date in history. Change a due date directly on its row. The dashboard lists overdue and upcoming tasks and evaluations in date order, with a selectable 30/60/90-day horizon. It refreshes on opening, returning to the tab, and at local midnight while open. These are in-app reminders, not email or notifications while the browser is closed. Only employees entered in your roster can be tracked.

Calendar-year schedules roll forward automatically when opening the tracker in a new year, retaining uncompleted prior reviews. Probation remains visible until you explicitly switch the employee to calendar-year reviews after their anniversary and completion of all probation reviews. The switch keeps probation history and adds the current CY cycle; check the CY due dates for your policy. Employees who no longer need reminders can be moved to Employee history and restored later. Restoring an employee adds any missing calendar-year cycles.

## Finished projects and backups

Click Finish project to move a selected project into Project history. History retains tasks and purchases and excludes that project from active counts and reminders. Select it in History to inspect or restore it. Projects are never automatically finished merely because all current tasks are checked.

New JSON backups contain projects (including history), employees, review completions, and reminder preferences. Restoring a new backup replaces all of that data. Older project-only backups still work; they replace projects while preserving the current employee roster and reminder preferences. Automatic saving is paused if existing saved data cannot be read, so corrupt or unsupported data is not overwritten.

Before updating, download a backup in the old tracker. Extract the complete new ZIP, including the new public/evaluations.js file. Open public/index.html and restore your backup. Use the updated version for future backups; old tracker versions do not understand the new backup format. No installation is required for opening the files directly; npm test runs the date, reminder, and annual-schedule tests with Node.js.
