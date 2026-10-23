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
