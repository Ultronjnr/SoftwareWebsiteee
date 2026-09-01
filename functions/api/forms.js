const ALLOWED_ORIGIN = "https://leadtechweb.michaelmokhoro08.workers.dev";
const MAX_FIELD_LENGTH = 5000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
  });
}

function value(formData, name) {
  return String(formData.get(name) || "").trim().slice(0, MAX_FIELD_LENGTH);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmailViaZoho(env, subject, text, fromEmail) {
  if (!env.ZOHO_API_KEY) throw new Error("Zoho API key not configured");

  const response = await fetch("https://mail.zoho.com/api/accounts/sendmailv2", {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${env.ZOHO_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fromAddress: fromEmail,
      toAddress: "info@leadtechsoftwaresolutions.co.za",
      subject: subject,
      content: text,
      mailFormat: "plaintext"
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Zoho API Error:", error);
    throw new Error("Email delivery failed");
  }
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const email = value(formData, "email").toLowerCase();
  const isNewsletter = request.headers.get("Referer")?.includes("newsletter") ||
    formData.get("form_type") === "newsletter";

  if (!validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);

  if (isNewsletter) {
    await env.DB.prepare(
      "INSERT INTO subscribers (email) VALUES (?) ON CONFLICT(email) DO UPDATE SET subscribed_at = CURRENT_TIMESTAMP"
    ).bind(email).run();
    try {
      await sendEmailViaZoho(env, "New LeadTech newsletter subscriber", `New subscriber: ${email}`, "noreply@leadtechsoftwaresolutions.co.za");
    } catch (error) {
      console.error("Newsletter email failed:", error);
    }
    return json({ ok: true, message: "Thanks for subscribing!" });
  }

  const name = value(formData, "name");
  const subject = value(formData, "subject") || "Website contact request";
  const message = value(formData, "message");
  if (!name || !message) return json({ error: "Please complete all required fields." }, 400);

  await env.DB.prepare(
    "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)"
  ).bind(name, email, subject, message).run();
  try {
    await sendEmailViaZoho(
      env,
      `New website enquiry: ${subject}`,
      `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      "forms@leadtechsoftwaresolutions.co.za"
    );
  } catch (error) {
    console.error("Contact form email failed:", error);
  }
  return json({ ok: true, message: "Thank you! We will get back to you shortly." });
}

export async function onRequestGet({ request, env }) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) return json({ error: "Unauthorized" }, 401);

  const result = await env.DB.prepare(
    "SELECT email, subscribed_at FROM subscribers WHERE active = 1 ORDER BY subscribed_at DESC"
  ).all();
  return json({ subscribers: result.results });
}