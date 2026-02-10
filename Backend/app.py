# app.py
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_lib import IdentityVerifier
import os
import csv
import re
from itertools import islice
from typing import Any, Dict, List, Optional

app = FastAPI(title="Identity Verification API")

# Simple API Key Authentication
API_KEY = os.getenv("AUTHENTRACE_API_KEY", "authentrace_secret_key_2024")

def verify_api_key(x_api_key: str = Header(None)) -> str:
    """Verify API key from headers"""
    if x_api_key is None:
        raise HTTPException(status_code=401, detail="Missing X-API-Key header")
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

app = FastAPI(title="Identity Verification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-API-Key"],
)

# CSV path configuration
CSV_PATH = "D:/FYP/Authentrace/Backend/artifacts/emails.csv"

# Safety cap for pagination
MAX_LIMIT = 500


class VerifyRequest(BaseModel):
    claimed_sender: str
    recipients: list[str]
    sent_at: str
    body: str
    threshold: float = 2.5


class CSVPathRequest(BaseModel):
    path: str


# Initialize verifier (will load ML artifacts if available; otherwise uses heuristic fallback)
verifier = IdentityVerifier(artifacts_dir="./artifacts", device="cpu")


def _pick(row: Dict[str, Any], keys: List[str], default: str = "") -> str:
    for k in keys:
        v = row.get(k)
        if v is None:
            continue
        s = str(v).strip()
        if s:
            return s
    return default


def _extract_email_headers(message: str) -> Dict[str, str]:
    """Extract email headers from RFC 822 formatted message."""
    headers = {}
    lines = message.split('\n') if message else []
    
    current_key = None
    # Handle folded headers: lines starting with whitespace continue previous header
    for raw_line in lines[:200]:  # check more lines for complex headers
        line = raw_line.rstrip('\r')
        if not line.strip():
            break

        if line[0].isspace() and current_key:
            # continuation of previous header
            headers[current_key] = headers.get(current_key, '') + ' ' + line.strip()
            continue
        m = re.match(r"^([^:\s]+)\s*:\s*(.*)$", line)
        if not m:
            continue
        key, value = m.group(1), m.group(2)
        key_lower = key.lower()

        # store common headers and any x- headers generically
        if key_lower in ('from', 'to', 'subject', 'date'):
            headers[key_lower] = value.strip()
        elif key_lower.startswith('x-'):
            headers[key_lower.replace('-', '_')] = value.strip()
        else:
            # keep other headers if useful
            headers[key_lower] = value.strip()
        current_key = key_lower
    
    return headers


def _parse_name_email(value: str) -> Dict[str, str]:
    """Parse a header like 'Phillip K Allen <phillip.allen@enron.com>' into name/email."""
    if not value:
        return {"name": "", "email": ""}

    v = value.strip()
    # common formats: Name <email@example.com>, "Name" <email>, email alone
    m = re.search(r"\s*<?([^<>\s]+@[^<>\s]+)>?\s*$", v)
    email = ""
    name = ""
    if m:
        email = m.group(1).strip()
        # name is everything before the '<'
        if '<' in v:
            name = v.split('<', 1)[0].strip().strip('"')
        else:
            # try to remove email portion
            name = v.replace(email, "").strip().strip('"')
    else:
        # no email found; maybe only a name or malformed
        if '@' in v:
            email = v
        else:
            name = v

    return {"name": name, "email": email}


def _normalize_email_row(row: Dict[str, Any], idx: int) -> Dict[str, Any]:
    # Try to extract from message headers if available
    message = _pick(row, ["message", "Message", "body", "Body"], "")
    email_headers = _extract_email_headers(message) if message else {}
    
    # Extract sender - try CSV columns first, then email headers
    raw_sender = _pick(row, ["sender", "from", "From", "FROM", "Sender", "FromAddress", "FromEmail"], "")
    if not raw_sender:
        raw_sender = email_headers.get('from', '')

    # Try to obtain display name and email separately
    parsed = _parse_name_email(raw_sender)
    sender_email = parsed.get("email") or _pick(row, ["senderEmail", "fromEmail", "FromEmail"], "")
    sender_name = _pick(row, ["senderName", "SenderName", "FromName", "from_name", "DisplayName"], "")
    if not sender_name:
        # prefer X-From name if available
        sender_name = email_headers.get('x_from', '')
    if not sender_name and parsed.get("name"):
        sender_name = parsed.get("name")
    # final fallback to email local-part
    if not sender_name and sender_email:
        sender_name = sender_email.split("@")[0]
    
    # prefer sender_email if available; else keep raw_sender (may be name)
    sender = sender_email or raw_sender
    
    subject = _pick(row, ["subject", "Subject", "SUBJECT"], "")
    if not subject:
        subject = email_headers.get('subject', '(no subject)')
    
    # Body can be the full message or just the content
    body = message if message else _pick(row, ["body", "Body", "content", "Content", "text"], "")
    
    preview = _pick(row, ["preview", "Preview", "snippet", "Snippet", "summary"], "")
    if not preview:
        # Generate preview from body, removing headers
        body_text = body
        if '\n\n' in body_text:
            # Skip email headers and get first paragraph
            body_text = body_text.split('\n\n', 1)[1]
        preview = (body_text[:160] + "…") if len(body_text) > 160 else body_text

    timestamp = _pick(row, ["timestamp", "Timestamp", "time", "Time", "date", "Date", "sent_at", "SentAt"], "")
    if not timestamp:
        timestamp = email_headers.get('date', '')

    # Recipients can be in many formats
    rec_raw = row.get("recipients") or row.get("to") or row.get("To") or row.get("TO") or email_headers.get('to', '')
    if isinstance(rec_raw, list):
        recipients = [str(x).strip() for x in rec_raw if str(x).strip()]
    else:
        recipients = [r.strip() for r in str(rec_raw).split(",") if r.strip()]

    def _to_bool(x: Any) -> bool:
        if isinstance(x, bool):
            return x
        if x is None:
            return False
        return str(x).strip().lower() in ("1", "true", "yes", "y", "t")

    read = _to_bool(row.get("read") or row.get("Read") or row.get("is_read"))
    starred = _to_bool(row.get("starred") or row.get("Starred") or row.get("is_starred"))

    return {
        "id": str(idx),
        "sender": sender,
        "senderName": sender_name,
        # If this message appears to be from a Sent folder, prefer showing the first recipient as the display name
        "displayName": None,
        "subject": subject,
        "preview": preview,
        "body": body,
        "timestamp": timestamp,
        "time": timestamp,
        "recipients": recipients,
        "read": read,
        "starred": starred,
        "raw": row,  # keep original row for debugging if needed
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/emails")
def get_emails(
    limit: int = Query(50, ge=1, le=MAX_LIMIT),
    offset: int = Query(0, ge=0),
    x_api_key: str = Header(None),
):
    """Fetch emails from CSV with pagination + normalization + risk assessment (low memory)."""
    # Optional API key validation
    if x_api_key and x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

    try:
        if not os.path.exists(CSV_PATH):
            raise HTTPException(status_code=404, detail=f"CSV file not found at path: {CSV_PATH}")

        with open(CSV_PATH, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            raw_slice = list(islice(reader, offset, offset + limit))

        emails = []
        for i, row in enumerate(raw_slice):
            normalized = _normalize_email_row(row, idx=offset + i)

            # Compute risk level for each email
            try:
                risk_result = verifier.verify(
                    claimed_sender=normalized.get("sender", ""),
                    recipients=normalized.get("recipients", []),
                    sent_at=normalized.get("timestamp", ""),
                    body=normalized.get("body", ""),
                    threshold=2.5,
                )

                # Map risk score to risk level
                score = float(risk_result.get("score", 0.0))
                if score >= 1.5:
                    risk_level = "high"
                elif score >= 0.8:
                    risk_level = "suspicious"
                else:
                    risk_level = "safe"

                normalized["riskLevel"] = risk_level
                normalized["riskScore"] = score
                normalized["mlResult"] = risk_result
            except Exception as e:
                print(f"⚠️ Risk assessment failed for email {normalized.get('id')}: {e}")
                normalized["riskLevel"] = "pending"
                normalized["riskScore"] = 0.0
            # If this mail appears to be in a Sent folder, swap the display name to the first recipient
            try:
                raw_msg = normalized.get('raw', {}) or {}
                msg_text = raw_msg.get('message', '')
                headers = _extract_email_headers(msg_text) if msg_text else {}
                folder = (headers.get('x_folder') or headers.get('x-folder') or '').lower()
                # Prefer using X-To/To header as a display name (useful for sent folders)
                to_hdr = headers.get('x_to') or headers.get('x-to') or headers.get('to') or ''
                first = ''
                if to_hdr:
                    # to_hdr may contain multiple recipients
                    first = to_hdr.split(',')[0].strip()
                elif normalized.get('recipients'):
                    first = normalized['recipients'][0]

                if first and not normalized.get('displayName'):
                    parsed = _parse_name_email(first)
                    normalized['displayName'] = parsed.get('name') or parsed.get('email') or first
            except Exception:
                pass

            emails.append(normalized)

        print(f"✅ Loaded {len(emails)} emails (offset={offset}, limit={limit}) from {CSV_PATH}")
        return {"success": True, "limit": limit, "offset": offset, "count": len(emails), "emails": emails}

    except Exception as e:
        print(f"❌ Error loading emails: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading emails: {str(e)}")


@app.get("/emails/count")
def get_emails_count():
    """Total email row count (excluding header)."""
    try:
        if not os.path.exists(CSV_PATH):
            raise HTTPException(status_code=404, detail=f"CSV file not found at path: {CSV_PATH}")

        with open(CSV_PATH, "r", encoding="utf-8-sig", newline="") as f:
            total = sum(1 for _ in f) - 1

        return {"success": True, "total": max(total, 0)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error counting emails: {str(e)}")


@app.post("/verify")
def verify(req: VerifyRequest):
    """Verify email identity (ML if available; otherwise heuristic fallback)."""
    try:
        print(
            f"🔍 VERIFY: sender={req.claimed_sender}, sent_at={req.sent_at}, "
            f"body_len={len(req.body)}, recipients={len(req.recipients)}, thr={req.threshold}"
        )

        result = verifier.verify(
            claimed_sender=req.claimed_sender,
            recipients=req.recipients,
            sent_at=req.sent_at,
            body=req.body,
            threshold=req.threshold,
        )
        return {"success": True, "result": result}

    except Exception as e:
        # Never crash the server; always return detail
        print(f"❌ Verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@app.post("/config/csv-path")
def update_csv_path(req: CSVPathRequest):
    global CSV_PATH
    if os.path.exists(req.path):
        CSV_PATH = req.path
        return {"success": True, "message": f"CSV path updated to: {CSV_PATH}"}
    raise HTTPException(status_code=404, detail=f"Path does not exist: {req.path}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
