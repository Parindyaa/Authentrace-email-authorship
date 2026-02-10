# model_lib.py
from __future__ import annotations

import os
import re
import math
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

# Optional ML loading (safe fallback if missing)
try:
    import joblib  # type: ignore
except Exception:
    joblib = None


def _safe_parse_datetime(s: str) -> Optional[datetime]:
    if not s:
        return None
    # Try a few common formats. Add more if needed.
    fmts = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S",
    ]
    for f in fmts:
        try:
            return datetime.strptime(s, f)
        except Exception:
            pass
    # Last resort: try fromisoformat
    try:
        return datetime.fromisoformat(s)
    except Exception:
        return None


def _extract_domain(addr: str) -> str:
    addr = (addr or "").strip().lower()
    m = re.search(r"@([a-z0-9.\-]+)$", addr)
    return m.group(1) if m else ""


def _count_urls(text: str) -> int:
    if not text:
        return 0
    return len(re.findall(r"(https?://\S+|www\.\S+)", text, flags=re.IGNORECASE))


def _ratio_upper(text: str) -> float:
    if not text:
        return 0.0
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return 0.0
    upp = sum(1 for c in letters if c.isupper())
    return upp / max(len(letters), 1)


def _ratio_punct(text: str) -> float:
    if not text:
        return 0.0
    punct = sum(1 for c in text if c in r"""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~""")
    return punct / max(len(text), 1)


@dataclass
class IdentityVerifier:
    artifacts_dir: str = "./artifacts"
    device: str = "cpu"

    def __post_init__(self) -> None:
        self.model = None
        self.model_kind = "heuristic"
        self._try_load_model()

    def _try_load_model(self) -> None:
        """Try to load a pre-trained sklearn pipeline/model if present."""
        if joblib is None:
            return

        candidates = [
            os.path.join(self.artifacts_dir, "model.joblib"),
            os.path.join(self.artifacts_dir, "model.pkl"),
            os.path.join(self.artifacts_dir, "pipeline.joblib"),
            os.path.join(self.artifacts_dir, "pipeline.pkl"),
        ]
        for path in candidates:
            if os.path.exists(path):
                try:
                    self.model = joblib.load(path)
                    self.model_kind = "ml"
                    print(f"✅ Loaded ML model from: {path}")
                    return
                except Exception as e:
                    print(f"⚠️ Failed loading model at {path}: {e}")

        # No model -> heuristic
        self.model = None
        self.model_kind = "heuristic"
        print("ℹ️ No ML model loaded. Using heuristic verification fallback.")

    # ----------------------------
    # Heuristic feature pipeline
    # ----------------------------
    def featurize_one(self, claimed_sender: str, recipients: List[str], sent_at: str, body: str) -> Dict[str, Any]:
        """
        A working feature extractor (fixes your NotImplementedError).
        If you later align to your training pipeline, update this to match it.
        """
        dt = _safe_parse_datetime(sent_at)
        hour = dt.hour if dt else -1
        weekday = dt.weekday() if dt else -1  # 0=Mon

        sender_domain = _extract_domain(claimed_sender)
        recip_domains = [_extract_domain(r) for r in (recipients or [])]
        uniq_recip_domains = len(set([d for d in recip_domains if d]))

        text = body or ""
        body_len = len(text)
        urls = _count_urls(text)
        upper_ratio = _ratio_upper(text)
        punct_ratio = _ratio_punct(text)
        has_money = bool(re.search(r"[$€£]\s*\d+|\bwire\b|\bpayment\b|\binvoice\b", text, re.IGNORECASE))
        has_urgent = bool(re.search(r"\burgent\b|\bimmediately\b|\basap\b|\baction required\b", text, re.IGNORECASE))
        has_creds = bool(re.search(r"\bpassword\b|\blogin\b|\bverify your\b|\baccount\b", text, re.IGNORECASE))

        return {
            "hour": hour,
            "weekday": weekday,
            "num_recipients": len(recipients or []),
            "sender_domain": sender_domain,
            "uniq_recip_domains": uniq_recip_domains,
            "body_len": body_len,
            "num_urls": urls,
            "upper_ratio": upper_ratio,
            "punct_ratio": punct_ratio,
            "has_money": has_money,
            "has_urgent": has_urgent,
            "has_creds": has_creds,
        }

    def _heuristic_score(self, feats: Dict[str, Any]) -> Tuple[float, List[str]]:
        """
        Returns (risk_score, reasons). Higher score => more suspicious.
        Threshold default in your UI is 2.5 (so we keep score in that range).
        """
        score = 0.0
        reasons: List[str] = []

        # Very short messages (likely auto-reply or phishing hook)
        if feats["body_len"] < 20:
            score += 0.8
            reasons.append("Extremely short body (likely phishing hook) (+0.80)")
        elif feats["body_len"] < 60:
            score += 0.4
            reasons.append("Very short body (+0.40)")
            
        # Links are suspicious
        if feats["num_urls"] >= 3:
            score += 1.5
            reasons.append(f"Multiple URLs detected ({feats['num_urls']} URLs) (+1.50)")
        elif feats["num_urls"] >= 1:
            add = min(1.0, 0.5 + 0.4 * feats["num_urls"])
            score += add
            reasons.append(f"Contains URL(s) (+{add:.2f})")
        
        # Extremely long messages (suspicious bulk)
        if feats["body_len"] > 8000:
            score += 0.7
            reasons.append("Unusually long message (possible bulk mail) (+0.70)")
        elif feats["body_len"] > 5000:
            score += 0.3
            reasons.append("Long message body (+0.30)")
        
        # Language cues
        if feats["has_money"]:
            score += 1.2
            reasons.append("Financial/payment language (high phishing indicator) (+1.20)")
        if feats["has_urgent"]:
            score += 0.8
            reasons.append("Urgent/action-required language detected (+0.80)")
        if feats["has_creds"]:
            score += 1.3
            reasons.append("Login/credential/account verification language (HIGH RISK) (+1.30)")
        
        # Shouting / punctuation spam
        if feats["upper_ratio"] > 0.50:
            score += 0.6
            reasons.append("Excessive uppercase (SHOUTING) (+0.60)")
        elif feats["upper_ratio"] > 0.35:
            score += 0.3
            reasons.append("High uppercase ratio (+0.30)")
        if feats["punct_ratio"] > 0.18:
            score += 0.5
            reasons.append("Excessive punctuation/special chars (+0.50)")
        elif feats["punct_ratio"] > 0.12:
            score += 0.2
            reasons.append("High punctuation density (+0.20)")
        
        # Missing recipients hurts confidence
        if feats["num_recipients"] == 0:
            score += 0.6
            reasons.append("No recipients (indicates BCC/spoofed) (+0.60)")
        elif feats["num_recipients"] > 50:
            score += 0.8
            reasons.append("Mass recipient list (bulk mail indicator) (+0.80)")
        
        # Weird send hour
        if feats["hour"] in (1, 2, 3, 4, 5) and feats["hour"] != -1:
            score += 0.5
            reasons.append("Sent at suspicious early morning hour (+0.50)")
        elif feats["hour"] in (22, 23) and feats["hour"] != -1:
            score += 0.2
            reasons.append("Sent at late night (+0.20)")
        
        # Same sender and recipient (self-email or forwarded)
        if feats["num_recipients"] == 1 and feats.get("sender_domain") and feats.get("uniq_recip_domains") == 1:
            # check if sender and recipient are in same domain (internal)
            score += 0.15
            reasons.append("Internal communication (low risk) (+0.15)")
        
        # Clamp a bit
        score = max(0.0, min(score, 10.0))
        return score, reasons

    # ----------------------------
    # Public API used by FastAPI
    # ----------------------------
    def verify(self, claimed_sender: str, recipients: List[str], sent_at: str, body: str, threshold: float = 2.5) -> Dict[str, Any]:
        """
        Returns a stable result for the frontend.
        If ML model is available and works, uses it.
        Otherwise uses heuristic and never throws NotImplementedError.
        """
        recipients = recipients or []
        feats = self.featurize_one(claimed_sender, recipients, sent_at, body)

        # Try ML first if loaded
        if self.model is not None and self.model_kind == "ml":
            try:
                # Many sklearn pipelines accept a list of dicts
                X = [{
                    "claimed_sender": claimed_sender,
                    "recipients": recipients,
                    "sent_at": sent_at,
                    "body": body,
                    **feats,
                }]

                # Predict probability if possible
                if hasattr(self.model, "predict_proba"):
                    proba = self.model.predict_proba(X)[0]
                    # assume class 1 = suspicious
                    risk = float(proba[-1])
                    score = risk * 5.0
                    is_authentic = score < threshold
                    return {
                        "method": "ml",
                        "is_authentic": bool(is_authentic),
                        "score": float(score),
                        "confidence": float(max(proba)),
                        "threshold": float(threshold),
                        "features": feats,
                    }

                # Else fallback to predict
                pred = self.model.predict(X)[0]
                score = 4.0 if int(pred) == 1 else 0.5
                is_authentic = score < threshold
                return {
                    "method": "ml",
                    "is_authentic": bool(is_authentic),
                    "score": float(score),
                    "confidence": 0.5,
                    "threshold": float(threshold),
                    "features": feats,
                }

            except Exception as e:
                # ML failed -> fallback heuristic
                print(f"⚠️ ML verify failed, using heuristic fallback: {e}")

        # Heuristic fallback (always works)
        score, reasons = self._heuristic_score(feats)
        is_authentic = score < threshold

        # confidence is higher when we have recipients + timestamp
        conf = 0.55
        if feats["num_recipients"] > 0:
            conf += 0.15
        if feats["hour"] != -1:
            conf += 0.10
        conf = min(conf, 0.90)

        return {
            "method": "heuristic",
            "is_authentic": bool(is_authentic),
            "score": float(score),
            "confidence": float(conf),
            "threshold": float(threshold),
            "reasons": reasons,
            "features": feats,
        }
