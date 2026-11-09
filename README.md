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

Add each employee once in Employee evaluations. Regular employees get one interim and one final per calendar year. Probationary employees get two interims and a final before the first anniversary. Default suggested deadlines are June 30 / December 31 for CY reviews and 4 / 8 months from the probationary start date and the day before the first anniversary for the final. EE initiation is due within one calendar month of starting for probationary employees, or by January 31 of each CY for regular employees. These are editable defaults, not a statement of your organization's policy. Month-end dates are clamped to the last valid day (a February 29 anniversary becomes February 28 in a non-leap year, with the final due February 27). Start date is required for probation; regular employees can leave it blank and choose the first calendar year to track.

Check an initiation or review step to complete it; completed reviews retain their completion date in history. Change a due date directly on its row. The dashboard lists overdue and upcoming tasks and evaluations in date order, with a default 30-day horizon (also selectable as 60/90 days). Only five reminders are shown initially; Show all displays the rest, and the summary always counts all. Employee schedules are collapsed until opened. It refreshes on opening, returning to the tab, and at local midnight while open. These are in-app reminders, not email or notifications while the browser is closed. Only employees entered in your roster can be tracked.

Calendar-year schedules roll forward automatically when opening the tracker in a new year, retaining uncompleted prior reviews. Probation remains visible until you explicitly switch the employee to calendar-year reviews after their anniversary and completion of all probation reviews. The switch keeps probation history and adds the current CY cycle; check the CY due dates for your policy. Employees who no longer need reminders can be moved to Employee history and restored later. Restoring an employee adds any missing calendar-year cycles.

## Finished projects and backups

Click Finish project to move a selected project into Project history. History retains tasks and purchases and excludes that project from active counts and reminders. Select it in History to inspect or restore it. Projects are never automatically finished merely because all current tasks are checked.

New JSON backups contain projects (including history), employees, review completions, and reminder preferences. Restoring a new backup replaces all of that data. Older project-only backups still work; they replace projects while preserving the current employee roster and reminder preferences. Automatic saving is paused if existing saved data cannot be read, so corrupt or unsupported data is not overwritten.

Before updating, download a backup in the old tracker. Extract the complete new ZIP, including the new public/evaluations.js file. Open public/index.html and restore your backup. Use the updated version for future backups; old tracker versions do not understand the new backup format. No installation is required for opening the files directly; npm test runs the date, reminder, and annual-schedule tests with Node.js.

Existing employee schedules automatically gain missing initiation steps. Pending probation finals on or after the anniversary move to the day before it; completed records and earlier custom due dates are retained. Missing historic initiation steps will appear overdue until confirmed complete.

## Optional learning and improvement notes

Under each employee's View schedule section, each cycle has an optional Learning & improvement entry. Use it to identify things the employee wants to learn or improve over the year. Interims and finals also have optional update/wrap-up notes. Click Save learning notes before navigating away. No discussion date, comments, goals, reminders, or completion gates are required for this feature. Existing discussion dates and employee/supervisor comments from previous versions remain visible under Previously saved discussion notes and are retained in backups.

## Evaluation ratings

Interim and final reviews have exactly four rating areas: Customer Service, Quality, Communication, and Overall. Each offers the form's four performance ratings plus Not rated, and optional comments. Ratings are saved independently per review; Overall is entered explicitly, not calculated. Click Save ratings. No rating fields are added to initiation, and ratings do not block completion.

Learning notes and ratings persist in browser storage and are included in Download backup / Restore backup. Existing backups without these fields still load. The tracker retains the user's calendar-year deadlines; it does not fill or submit the official PDF.
