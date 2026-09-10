/**
 * Hack Farm website contact forms → baerbelhack@gmail.com
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Then copy the /exec URL into GitHub secret VITE_FORMS_ENDPOINT
 * (and optionally .env.local for local builds).
 */
const TO_EMAIL = 'baerbelhack@gmail.com';

/** Browser check: open the /exec URL — should show {"ok":true}, not "You need access". */
function doGet() {
  return json_({ ok: true, service: 'hackfarm-forms' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'Empty body' });
    }

    const data = JSON.parse(e.postData.contents);

    // Honeypot — bots that fill hidden fields get a fake success
    if (data.botcheck) {
      return json_({ ok: true });
    }

    const formType = data.form_type || 'contact';
    const subject = data.subject || ('Hack Farm ' + formType + ' form submission');

    const skip = { subject: true, botcheck: true };
    const lines = Object.keys(data)
      .filter(function (key) {
        return !skip[key] && data[key] !== '' && data[key] != null;
      })
      .map(function (key) {
        return key + ': ' + data[key];
      });

    if (!lines.length) {
      return json_({ ok: false, error: 'No fields' });
    }

    MailApp.sendEmail({
      to: TO_EMAIL,
      replyTo: data.email || TO_EMAIL,
      subject: subject,
      body: lines.join('\n'),
    });

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
