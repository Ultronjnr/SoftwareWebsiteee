# Cloudflare form setup

1. In Cloudflare, add `leadtechsoftwaresolutions.co.za` and enable Email Routing. Create the address `info@leadtechsoftwaresolutions.co.za` and route it to a mailbox you can access.
2. Create a D1 database named `leadtech-website`. Put its ID in `wrangler.toml`, then run `npx wrangler d1 execute leadtech-website --remote --file=schema.sql` from this folder.
3. Deploy this folder as a Cloudflare Pages project. Set the `DB` D1 binding to the database above.
4. Create a Resend account, verify `leadtechsoftwaresolutions.co.za`, and add the Pages secret `RESEND_API_KEY`. Keep `FROM_EMAIL` on that verified domain.
5. Add a Pages secret named `ADMIN_TOKEN`. To view subscribers, request `/api/forms` with `Authorization: Bearer YOUR_ADMIN_TOKEN`.

Cloudflare Email Routing receives mail; it does not send application notifications. Resend is used only for the notification email and can remain within its free allowance for a small site. Never put either secret in HTML or JavaScript.
