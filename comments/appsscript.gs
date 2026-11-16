/**
 * Comments reader for "Malayalam Film Songs — The Complete Playlist".
 *
 * Paste this file into the Apps Script editor of the Google Sheet that the
 * comment form writes to (Extensions > Apps Script), then deploy it:
 *
 *   Deploy > New deployment > Web app
 *     Description:    comments
 *     Execute as:     Me
 *     Who has access: Anyone
 *
 * Copy the deployment's /exec URL into assets/comments-config.js (apiUrl).
 *
 * The web app answers GET requests:
 *   ?kind=song&id=2104            -> {"ok":true,"comments":[...]}
 *   ?kind=song&id=2104&callback=x -> x({"ok":true,"comments":[...]});
 *
 * The site uses the JSONP form, because a static GitHub Pages site cannot read
 * the spreadsheet directly across origins. The callback name is validated to
 * letters, digits, _ and $ only.
 *
 * Set SHEET_NAME if the responses are not on the first sheet of the
 * spreadsheet. The header names must match the form questions (the script
 * lowercases and trims them):
 *   Timestamp | Item type | Item ID | Item title | Name | Comment
 */

var SHEET_NAME = "";       // "" = first sheet in the spreadsheet
var MAX_COMMENTS = 100;    // newest comments returned per item
var MAX_TEXT = 2000;       // characters of each comment returned

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = String(p.callback || "");
  if (callback && !/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) callback = "";

  var payload;
  try {
    var kind = String(p.kind || "").toLowerCase().slice(0, 20);
    var id = String(p.id || "").trim().slice(0, 100);
    payload = { ok: true, comments: (kind && id) ? readComments(kind, id) : [] };
  } catch (err) {
    payload = { ok: false, error: "Could not read comments.", comments: [] };
  }

  var body = JSON.stringify(payload);
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + body + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function readComments(kind, id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (!sheet) throw new Error("Sheet not found");

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var col = headerMap(values.shift());
  var iKind = col["item type"];
  var iId = col["item id"];
  var iName = col["name"];
  var iText = col["comment"];
  var iWhen = col["timestamp"];
  if (iKind == null || iId == null || iText == null) {
    throw new Error("Missing Item type, Item ID or Comment column");
  }

  var out = [];
  for (var r = values.length - 1; r >= 0; r--) {
    var row = values[r];
    if (String(row[iKind] || "").trim().toLowerCase() !== kind) continue;
    if (String(row[iId] || "").trim() !== id) continue;

    var text = String(row[iText] || "").trim();
    if (!text) continue;

    var when = iWhen == null ? "" : row[iWhen];
    out.push({
      t: when instanceof Date ? when.toISOString() : String(when || ""),
      n: iName == null ? "" : String(row[iName] || "").trim().slice(0, 80),
      m: text.slice(0, MAX_TEXT)
    });
  }

  /* Newest first. ISO timestamps sort correctly; rows without one keep the
     sheet order (form responses append at the bottom). */
  out.sort(function (a, b) {
    return String(b.t || "").localeCompare(String(a.t || ""));
  });
  return out.slice(0, MAX_COMMENTS);
}

function headerMap(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || "").trim().toLowerCase();
    if (h) map[h] = i;
  }
  return map;
}
