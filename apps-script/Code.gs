/**
 * AllMessage – "Richiedi Demo" form handler (Google Apps Script).
 *
 * 1. Emails every demo request to SALES_EMAIL (reply-to = the customer).
 * 2. Sends the customer a confirmation email (reply-to = SALES_EMAIL).
 * 3. Optionally logs each request in a Google Sheet.
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me   |   Who has access: Anyone
 * Then paste the Web App URL (ending in /exec) into DEMO_ENDPOINT in the website HTML.
 */

const SALES_EMAIL = 'sales@otech.one';

// Send the customer a "we received your request" email.
const SEND_CONFIRMATION = true;

// Optional: ID of a Google Sheet to log every request (leave '' to disable).
// The ID is the long code in the sheet URL: docs.google.com/spreadsheets/d/<ID>/edit
const SHEET_ID = '';

// Header / footer images of the email templates (Canva).
const IMG = {
  clienteTop: 'https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/2dd72c6bc490b41eba9047867a2877d1.jpg',
  clienteBottom: 'https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/46ae558430dff2177743015d804a3006.jpg',
  salesTop: 'https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/2381f42f91124301bd74bb54236f6992.jpg',
  salesBottom: 'https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/added240faa23e192ab2518badeae9bc.jpg',
};

// Field names match the inputs of the website form (id="demo-form").
const FIELDS = [
  ['azienda', 'Azienda'],
  ['referente', 'Nome Referente'],
  ['email', 'Email'],
  ['telefono', 'Telefono / WhatsApp'],
  ['settore', 'Settore di appartenenza'],
  ['ruolo', 'Ruolo'],
  ['interesse', 'Interesse principale'],
  ['messaggio', "Messaggio / caso d'uso"],
  ['piano', 'Piano selezionato'],
  ['pagina', 'Pagina di provenienza'],
];
const REQUIRED = ['azienda', 'referente', 'email', 'telefono', 'settore', 'ruolo', 'interesse', 'messaggio'];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: real visitors never fill this hidden field.
    if (data.website) return json_({ ok: true });

    const clean = {};
    FIELDS.forEach(([key]) => { clean[key] = String(data[key] || '').trim().slice(0, 2000); });

    if (REQUIRED.some(key => !clean[key])) return json_({ ok: false, error: 'Campi obbligatori mancanti.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return json_({ ok: false, error: 'Email non valida.' });
    clean.telefono = italianPhone_(clean.telefono);
    if (!clean.telefono) return json_({ ok: false, error: 'Numero di telefono italiano non valido.' });
    if (data.consenso !== 'si') return json_({ ok: false, error: 'Consenso privacy mancante.' });

    const when = Utilities.formatDate(new Date(), 'Europe/Rome', 'dd/MM/yyyy HH:mm');

    // 1) Email to sales
    MailApp.sendEmail({
      to: SALES_EMAIL,
      replyTo: clean.email,
      name: 'AllMessage – Sito web',
      subject: `Nuova richiesta demo – ${clean.azienda}${clean.piano ? ' – ' + clean.piano.split(' ·')[0] : ''}`,
      htmlBody: salesEmailHtml_(clean),
      body: `Nuova richiesta demo (${when})\n\n` +
        FIELDS.filter(([k]) => clean[k]).map(([k, l]) => `${l}: ${clean[k]}`).join('\n'),
    });

    // 2) Confirmation email to the customer
    if (SEND_CONFIRMATION) {
      MailApp.sendEmail({
        to: clean.email,
        replyTo: SALES_EMAIL,
        name: 'All Message – One Tech',
        subject: 'Abbiamo ricevuto la tua richiesta di demo – All Message',
        htmlBody: clienteEmailHtml_(clean),
        body: clienteEmailText_(clean),
      });
    }

    // 3) Optional log in Google Sheets
    if (SHEET_ID) {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
      if (sheet.getLastRow() === 0) sheet.appendRow(['Data'].concat(FIELDS.map(([, l]) => l)));
      sheet.appendRow([when].concat(FIELDS.map(([k]) => clean[k])));
    }

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Errore del server.' });
  }
}

// Open the Web App URL in a browser to check it is live.
function doGet() {
  return json_({ ok: true, service: 'AllMessage demo form' });
}

/* ================= EMAIL TEMPLATES ================= */

const HEAD_ =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
  '<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
  '<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">' +
  '<meta name="x-apple-disable-message-reformatting">' +
  '<style>body{margin:0;padding:0}table{mso-table-lspace:0;mso-table-rspace:0}p,span,h1,h2,h3,h4,h5,h6{margin:0;padding:0}' +
  'p{line-height:inherit}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}' +
  '#MessageViewBody a{color:inherit;text-decoration:none}img+div{display:none}' +
  '@media (max-width:599px){.ecw{width:100%!important;min-width:0!important}}' +
  '@media(max-width:550px){.ers-fs-173{font-size:16.7px!important}.ers-fs-197{font-size:17.9px!important}.ers-fs-213{font-size:18.7px!important}}</style>' +
  '</head>';

function image_(src, padding) {
  return `<tr><td style="padding:${padding}"><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center">` +
    `<table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tbody><tr><td style="width:100%">` +
    `<img src="${src}" width="600" height="180" alt="All Message" style="display:block;width:600px;height:auto;max-width:100%">` +
    `</td></tr></tbody></table></td></tr></tbody></table></td></tr>`;
}

function page_(rows) {
  return HEAD_ +
    '<body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0">' +
    '<table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5"><tbody><tr><td style="background-color:#f0f1f5">' +
    '<!--[if mso]><center><table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tbody><tr><td><![endif]-->' +
    '<table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" class="ecw" style="max-width:600px;margin:0 auto;background-color:#ffffff;width:600px;min-width:600px"><tbody><tr><td style="vertical-align:top">' +
    '<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody>' +
    rows +
    '</tbody></table></td></tr></tbody></table>' +
    '<!--[if mso]></td></tr></tbody></table></center><![endif]-->' +
    '</td></tr></tbody></table></body></html>';
}

/* ---------- Email to the customer ---------- */

function clienteEmailHtml_(c) {
  const p = 'font-size:14.7px;white-space:pre-wrap';
  return page_(
    image_(IMG.clienteTop, '24px 0px 16px') +
    `<tr><td dir="ltr" style="font-size:16px;text-align:justify;padding:0px 24px 16px;line-height:1.2">` +
      `<span style="${p}">Gentile </span>` +
      `<span style="font-weight:700;font-family:Poppins, Arial, Helvetica, sans-serif;white-space:pre-wrap">${esc_(c.referente)}</span>` +
      `<span style="${p}">,</span></td></tr>` +
    `<tr><td dir="ltr" style="font-size:16px;text-align:justify;padding:0px 24px 16px;line-height:1.2">` +
      `<span style="${p}">Abbiamo ricevuto la tua richiesta di demo di </span>` +
      `<span style="${p};font-weight:700">All Message</span>` +
      `<span style="${p}">, la piattaforma che riunisce WhatsApp, Instagram, Messenger ed Email in un'unica casella.<br><br>` +
      `Un membro del nostro team ti contatterà al più presto per organizzare la demo e rispondere alle tue domande.<br><br>` +
      `A presto.<br><br>Il team di ALL MESSAGE <br>by </span>` +
      `<a href="https://otech.one" target="_blank" rel="noopener nofollow" style="color:#1a62ff;text-decoration:underline">` +
      `<span style="${p};text-decoration:underline;color:#1a62ff">One Tech</span></a></td></tr>` +
    image_(IMG.clienteBottom, '0px 0px 24px'));
}

function clienteEmailText_(c) {
  return `Gentile ${c.referente},\n\n` +
    `Abbiamo ricevuto la tua richiesta di demo di All Message, la piattaforma che riunisce WhatsApp, Instagram, Messenger ed Email in un'unica casella.\n\n` +
    `Un membro del nostro team ti contatterà al più presto per organizzare la demo e rispondere alle tue domande.\n\n` +
    `A presto.\n\nIl team di ALL MESSAGE\nby One Tech – https://otech.one`;
}

/* ---------- Email to sales ---------- */

function salesEmailHtml_(c) {
  const label = 'font-size:19.7px;font-family:Helvetica, Arial, sans-serif;white-space:pre-wrap';
  const value = 'font-size:17.3px;font-weight:700;font-family:Poppins, Arial, Helvetica, sans-serif;white-space:pre-wrap';
  const row = (name, val, first) =>
    `<tr><td dir="ltr" style="font-size:16px;text-align:left;padding:${first ? '24px' : '0px'} 24px 16px;line-height:1.2">` +
    `<span class="ers-fs-197" style="${label}">${name}: </span>` +
    `<span class="ers-fs-173" style="${value}">${val}</span></td></tr>`;

  const azienda =
    `<tr><td dir="ltr" style="font-size:16px;font-family:Poppins, Arial, Helvetica, sans-serif;text-align:left;padding:24px 24px 16px;line-height:1.2">` +
    `<span class="ers-fs-197" style="font-size:18.3px;font-weight:700;white-space:pre-wrap">Azienda</span>` +
    `<span class="ers-fs-197" style="font-size:19.7px;white-space:pre-wrap"> : </span>` +
    `<span class="ers-fs-213" style="font-size:21.3px;font-weight:700;color:#5e17eb;white-space:pre-wrap">${esc_(c.azienda)}</span></td></tr>`;

  const email = `<a href="mailto:${esc_(c.email)}" style="color:#222222;text-decoration:none">${esc_(c.email)}</a>`;

  return page_(
    image_(IMG.salesTop, '0') +
    azienda +
    row('Nome Referente', esc_(c.referente)) +
    row('Email', email) +
    row('Telefono / WhatsApp', esc_(c.telefono)) +
    row('Settore di appartenenza', esc_(c.settore)) +
    row('Ruolo', esc_(c.ruolo)) +
    row('Interesse principale', esc_(c.interesse)) +
    row("Messaggio / caso d'uso", esc_(c.messaggio).replace(/\n/g, '<br>')) +
    (c.piano ? row('Piano selezionato', esc_(c.piano)) : '') +
    image_(IMG.salesBottom, '0px 0px 24px'));
}

/* ================= HELPERS ================= */

// Italian numbers only: mobile 3xx (9-10 digits) or landline 0x (6-11 digits), optional +39 / 0039.
function italianPhone_(value) {
  let n = String(value).trim();
  if (/[^\d\s+().\/-]/.test(n)) return '';
  n = n.replace(/[\s().\/-]/g, '');
  if (n.startsWith('+39')) n = n.slice(3);
  else if (n.startsWith('0039')) n = n.slice(4);
  else if (n.startsWith('+')) return '';
  return (/^3\d{8,9}$/.test(n) || /^0\d{5,10}$/.test(n)) ? '+39 ' + n : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
