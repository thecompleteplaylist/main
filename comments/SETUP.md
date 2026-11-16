# Comments — Google Form + Sheet setup

The comment section on song and film pages is powered by Google, but it no
longer embeds Google's white form. The site shows its own dark-themed form with
just **Name** and **Comment**; the item fields are submitted as hidden values.

```
song/film page (themed form: name + comment)
   │  POST with hidden Item type / Item ID / Item title
   ▼
Google Form response endpoint ──► linked Google Sheet
                                      │
                        Apps Script reader (JSONP)
                                      ▼
                              comments on the page
```

* The **form** records the comment in the **sheet**.
* The **Apps Script** in the sheet returns the latest comments for one item.
* A normal **“Open the Google Form”** link is still available next to the form
  for anyone who prefers Google's own UI.

While `assets/comments-config.js` has an empty `formUrl` or `apiUrl`, the
comment section is hidden and the rest of the site is unchanged.

> **Google Forms cannot hide pre-filled questions.** In the Google Form itself,
> the item fields are always visible. The site's own form hides them; the
> “Open the Google Form” link shows Google's version with the item fields
> filled in.

---

## 1. Create the form

1. Go to <https://forms.new> (or Google Drive → New → Google Forms).
2. Title it something like **“Comments about this song or film”**.
3. Add exactly these five questions, in this order:

| Question | Type | Required | Notes |
| --- | --- | --- | --- |
| `Item type` | Short answer | **Yes** | Submitted hidden as `song` or `movie`. |
| `Item ID` | Short answer | **Yes** | Submitted hidden as the database id. |
| `Item title` | Short answer | **Yes** | Submitted hidden, so you can identify the row. |
| `Name` | Short answer | No | Shown on the site form; empty becomes “Listener”. |
| `Comment` | Paragraph | **Yes** | Shown on the site form. |

Use these exact question titles: the Apps Script finds the columns by header
name (`Item type`, `Item ID`, `Name`, `Comment`, `Timestamp`). The site's own
form enforces a non-empty comment even if the Google Form marks `Comment`
optional; making it required also protects the fallback link.

In the form's **Settings** tab:

* **Responses → Collect email addresses**: **Off**. Otherwise the custom form
  POST is rejected or requires sign-in.
* **Responses → Limit to 1 response**: **Off**. Otherwise only the first
  comment per browser is accepted.
* Leave the default “Anyone with the link” audience on. On a Google Workspace
  account the administrator may restrict this; a personal Google account works
  without restrictions.

## 2. Link the responses to a Sheet

1. Open the **Responses** tab.
2. Click **Link to Sheets** → **Create a new spreadsheet**.
3. Name it, for example, **“Malayalam Film Songs — comments”**.
4. The responses sheet will be called **“Form Responses 1”** (the first sheet).

Keep this spreadsheet **private** (only you). The site never reads it
directly; the Apps Script does, acting as you. Do not publish the sheet.

## 3. Get the form and entry ids

All five questions need an entry id: the site posts Name and Comment with the
same ids Google uses, and it posts the three item fields as hidden values.

1. In the form, open the three-dot menu (**⋮**) → **Get pre-filled link**.
2. Fill in a sample value for every question (for example `song`, `2104`,
   `Test song`, `Test name`, `Hello`), click **Get link**, then **Copy link**.
3. The link looks like:

   ```
   https://docs.google.com/forms/d/e/1FAIpQLS…/viewform?usp=pp_url&entry.111111=song&entry.222222=2104&entry.333333=Test+song&entry.444444=Test+name&entry.555555=Hello
   ```

4. Keep the part before `?` as **`formUrl`**:
   `https://docs.google.com/forms/d/e/1FAIpQLS…/viewform`
5. Note the five entry ids:

   | Config key | Question |
   | --- | --- |
   | `entries.kind` | Item type |
   | `entries.id` | Item ID |
   | `entries.title` | Item title |
   | `entries.name` | Name |
   | `entries.text` | Comment |

The site derives the POST endpoint by replacing `/viewform` with
`/formResponse`, so it always posts to the same form.

## 4. Add the reader script

1. In the **spreadsheet**, open **Extensions → Apps Script**.
2. Delete the sample `Code.gs` content and paste the whole of
   [`appsscript.gs`](appsscript.gs) from this folder.
3. If the responses are not on the first sheet, set `SHEET_NAME` at the top
   to the tab name, e.g. `"Form Responses 1"`.
4. Save (**Ctrl+S**).
5. **Deploy → New deployment**:
   * Type: **Web app**
   * Description: `comments`
   * **Execute as: Me**
   * **Who has access: Anyone**
6. Click **Deploy** and authorise the script when Google asks. (The warning
   “Google hasn’t verified this app” is normal for your own script: choose
   **Advanced → Go to … (unsafe)**.)
7. Copy the **Web app URL** — it ends in `/exec`.

This reader is only for **displaying** comments. Writing uses the Google Form's
own response endpoint, so no extra `doPost` deployment is needed.

If you change the script later, use **Deploy → Manage deployments → ✏️ → New
version → Deploy**; the `/exec` URL stays valid.

## 5. Fill in the site config

Edit [`assets/comments-config.js`](../assets/comments-config.js):

```js
window.MSI_COMMENTS = {
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLS…/viewform",
  apiUrl:  "https://script.google.com/macros/s/AKfy…/exec",
  entries: {
    kind:  "entry.111111",
    id:    "entry.222222",
    title: "entry.333333",
    name:  "entry.444444",
    text:  "entry.555555"
  }
};
```

`name` and `text` are the visible Name and Comment fields; the other three are
hidden inputs. All five are required for the themed form to work.

Bump `?v=3` (or higher) on `comments-config.js` in `index.html` if the browser
has cached an older file.

## 6. Test it

1. Open the reader directly in a browser:

   ```
   https://script.google.com/macros/s/…/exec?kind=song&id=2104
   ```

   It should return JSON such as
   `{"ok":true,"comments":[{"t":"2026-11-15T…","n":"Ravi","m":"Lovely song."}]}`.

2. Open a song page. Click **Write a comment**. You should see only
   **Your name** and **Comment** — no item fields.
3. Submit a test comment. The page should say “Comment submitted”, clear the
   fields and refresh the list. Check that the row appears in the Sheet.
4. The **Open the Google Form ↗** link should open Google's form with the item
   values filled in.
5. Delete the test row in the sheet when you are done.

If **no row appears in the sheet**, the custom POST was rejected. Check:

* “Collect email addresses” and “Limit to 1 response” are both **off**.
* The five entry ids in the config match the questions.
* The required item fields are being sent (they are hidden; the page source of
  the form will show them).
* Try the **Open the Google Form** link once — if that records a row, the form
  itself is fine and only the custom POST is being blocked.

## Day-to-day moderation

* Open the linked spreadsheet and **delete the row** to remove a comment (or
  clear the **Comment** cell; empty comments are skipped). It disappears from
  the site on the next page view or **Refresh**.
* Nothing appears on the site until a row exists in the sheet.
* The site shows the **latest 100 comments** for an item, newest first, up to
  2000 characters each. Older rows stay in the sheet.
* Comment text is inserted as plain text: HTML and links are not rendered.

## Notes and troubleshooting

* **Section does not appear** — `formUrl` or `apiUrl` is still empty, or the
  old `app.js` / `comments-config.js` is cached. Hard-reload.
* **“Comments could not be loaded”** — open the `/exec` URL from step 6. If
  that fails, re-check **Deploy → Manage deployments** (access **Anyone**,
  execute as **Me**) and that the sheet headers still contain `Item type`,
  `Item ID` and `Comment`.
* **Comment posted but not in the sheet** — see the checklist in step 6. The
  custom form uses Google's undocumented `formResponse` endpoint; Google can
  change it, and the site cannot read Google's reply. The **Open the Google
  Form** link is the supported fallback.
* **The item fields are visible in Google's form** — that is expected. Google
  Forms has no hidden fields; the site's own form is what hides them.
* **Spam** — Google's own bot checks do not cover a custom form. Comments are
  public and moderated in the sheet; delete rows that you do not want.
* **Privacy** — comments and names are public, and the Sheet contains them.
  Tell commenters so. Do not collect email addresses in the form unless you
  need them.
* **Real protection** — as with the catalogue, the site is static: the reader
  URL is public and anyone can query comments for any item. That is fine for
  public comments; moderation lives in the sheet.
