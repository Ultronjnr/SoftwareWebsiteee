# Cloudflare form setup

1. In Cloudflare, add `leadtechsoftwaresolutions.co.za` and enable Email Routing. Create the address `info@leadtechsoftwaresolutions.co.za` and route it to a mailbox you can access.
2. Create a D1 database named `leadtech-website`. In Pages, open **Settings > Functions > D1 database bindings**, add the database with variable name `DB`, and run the contents of `schema.sql` once in the D1 Console.
3. Deploy this folder as a **Cloudflare Pages** project, using Git integration. In **Workers & Pages** choose **Create application > Pages > Import an existing Git repository**, select `Ultronjnr/SoftwareWebsite`, and use these build settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Root directory | leave blank (the site is at the repository root) |
   | Build command | `exit 0` |
   | Build output directory | `.` |

   Do **not** enter `npx wrangler deploy`: that command deploys a Cloudflare Worker, while this repository is a Pages site. A Git-connected Pages project deploys automatically after every push to `main`.
4. Create a Resend account, verify `leadtechsoftwaresolutions.co.za`, and add the Pages secret `RESEND_API_KEY`. Keep `FROM_EMAIL` on that verified domain.
5. Add a Pages secret named `ADMIN_TOKEN`. To view subscribers, request `/api/forms` with `Authorization: Bearer YOUR_ADMIN_TOKEN`.

Cloudflare Email Routing receives mail; it does not send application notifications. Resend is used only for the notification email and can remain within its free allowance for a small site. Never put either secret in HTML or JavaScript.

If you deliberately want a command-line Pages upload instead of Git integration, use `npx wrangler pages deploy . --project-name <your-pages-project-name>` from this directory — not `npx wrangler deploy`.
