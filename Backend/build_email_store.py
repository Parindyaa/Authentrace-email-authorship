import os
import json
import re
import pandas as pd
from email import policy
from email.parser import BytesParser
from email.utils import parsedate_to_datetime, getaddresses

# =========================
# CONFIG (change paths)
# =========================
ENRON_CSV_PATH = r"D:\FYP\Authentrace\Backend\artifacts\emails.csv"  # <- your current CSV
OUT_PATH = os.path.join(os.path.dirname(__file__), "artifacts", "emails_store.json")
MAX_EMAILS = 2000  # increase later if you want

def clean_str(x):
    if x is None:
        return ""
    return str(x).replace("\r", " ").replace("\n", " ").strip()

def parse_rfc822(raw_message: str):
    """
    raw_message is the 'message' column text (RFC822-like).
    We parse headers safely and return from/recipients/date/subject/body.
    """
    if raw_message is None:
        raw_message = ""

    # BytesParser expects bytes
    msg = BytesParser(policy=policy.default).parsebytes(raw_message.encode("utf-8", errors="ignore"))

    # From
    from_hdr = clean_str(msg.get("From", ""))

    # To/Cc/Bcc -> recipients list
    recips = []
    for hdr in ["To", "Cc", "Bcc"]:
        v = msg.get(hdr, "")
        if v:
            recips += [email for name, email in getaddresses([v]) if email]

    # Subject
    subject = clean_str(msg.get("Subject", ""))

    # Date
    sent_at = ""
    date_hdr = msg.get("Date", None)
    if date_hdr:
        try:
            dt = parsedate_to_datetime(str(date_hdr))
            if dt:
                # store as "YYYY-MM-DD HH:MM:SS"
                sent_at = dt.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            sent_at = ""

    # Body (prefer text/plain)
    body = ""
    try:
        if msg.is_multipart():
            parts = []
            for part in msg.walk():
                ctype = part.get_content_type()
                if ctype == "text/plain":
                    parts.append(part.get_content())
            body = "\n".join([p for p in parts if p])
        else:
            body = msg.get_content() or ""
    except Exception:
        body = ""

    body = clean_str(body)

    # preview (first 160 chars)
    preview = clean_str(re.sub(r"\s+", " ", body))[:160]

    return {
        "from": from_hdr if from_hdr else "unknown@enron.com",
        "recipients": recips[:50],
        "sent_at": sent_at if sent_at else "2001-01-01 00:00:00",
        "subject": subject if subject else "(no subject)",
        "body": body,
        "preview": preview,
    }

def main():
    if not os.path.exists(ENRON_CSV_PATH):
        raise FileNotFoundError(f"CSV not found: {ENRON_CSV_PATH}")

    df = pd.read_csv(ENRON_CSV_PATH)

    if "message" not in df.columns:
        raise ValueError("Expected columns ['file','message'] but 'message' not found.")

    items = []
    n = min(len(df), MAX_EMAILS)

    for i in range(n):
        raw = df.iloc[i]["message"]
        parsed = parse_rfc822(raw)
        parsed["id"] = f"enron_{i}"
        items.append(parsed)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False)

    print(f"✅ Saved {len(items)} emails -> {OUT_PATH}")

if __name__ == "__main__":
    main()
