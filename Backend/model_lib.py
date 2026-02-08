import pickle, math, re
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords

import nltk
nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)

STOPWORDS = set(stopwords.words("english"))
FUNCTION_WORDS = {
    "the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","as",
    "is","was","are","were","been","be","have","has","had","do","does","did","will","would",
    "should","could","may","might","must","can"
}

class MLPEncoder(nn.Module):
    def __init__(self, in_dim, embed_dim, hidden_dims, dropout):
        super().__init__()
        dims = [in_dim] + hidden_dims
        layers = []
        for a, b in zip(dims[:-1], dims[1:]):
            layers += [nn.Linear(a, b), nn.ReLU(), nn.Dropout(dropout)]
        layers += [nn.Linear(dims[-1], embed_dim)]
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)

def stylometry_features(text: str):
    t = re.sub(r"\s+", " ", str(text)).strip()
    if len(t) < 10:
        return np.zeros(10, dtype=np.float32)

    try:
        words = word_tokenize(t.lower())
        sents = sent_tokenize(t)
    except Exception:
        words = t.lower().split()
        sents = [s for s in t.split(".") if s.strip()]

    if not words:
        return np.zeros(10, dtype=np.float32)

    alpha = [w for w in words if w.isalpha()]
    avg_word_len = float(np.mean([len(w) for w in alpha])) if alpha else 0.0
    avg_sent_len = len(words) / max(len(sents), 1)
    ttr = len(set(words)) / len(words)

    punct = sum(1 for c in t if c in r"""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~""")
    punct_freq = punct / len(t)

    caps = sum(1 for c in t if c.isupper())
    cap_ratio = caps / len(t)

    digits = sum(1 for c in t if c.isdigit())
    digit_ratio = digits / len(t)

    func_ratio = sum(1 for w in words if w in FUNCTION_WORDS) / len(words)
    stop_ratio = sum(1 for w in words if w in STOPWORDS) / len(words)

    try:
        from textblob import TextBlob
        blob = TextBlob(t[:5000])
        pol = float(blob.sentiment.polarity)
        subj = float(blob.sentiment.subjectivity)
    except Exception:
        pol, subj = 0.0, 0.0

    return np.array([avg_word_len, avg_sent_len, ttr, punct_freq, cap_ratio, digit_ratio,
                        func_ratio, stop_ratio, pol, subj], dtype=np.float32)

def temporal_features(dt: pd.Timestamp):
    h = dt.hour
    d = dt.weekday()
    return np.array([
        math.sin(2*math.pi*h/24),
        math.cos(2*math.pi*h/24),
        math.sin(2*math.pi*d/7),
        math.cos(2*math.pi*d/7),
    ], dtype=np.float32)

class IdentityVerifier:
    def __init__(self, artifacts_dir="./artifacts", device="cpu"):
        self.device = torch.device(device)

        with open(f"{artifacts_dir}/feature_cfg.pkl", "rb") as f:
            cfg = pickle.load(f)
        self.cfg = cfg

        with open(f"{artifacts_dir}/scaler.pkl", "rb") as f:
            self.scaler = pickle.load(f)

        with open(f"{artifacts_dir}/caches.pkl", "rb") as f:
            self.caches = pickle.load(f)

        with open(f"{artifacts_dir}/prototypes.pkl", "rb") as f:
            self.prototypes = pickle.load(f)  # email -> np.array(embed_dim)

        self.encoder = MLPEncoder(
            in_dim=cfg["INPUT_DIM"],
            embed_dim=cfg["EMBED_DIM"],
            hidden_dims=cfg["HIDDEN_DIMS"],
            dropout=cfg["DROPOUT"]
        ).to(self.device)

        state = torch.load(f"{artifacts_dir}/encoder.pth", map_location=self.device)
        self.encoder.load_state_dict(state)
        self.encoder.eval()

    @torch.no_grad()
    def embed(self, x_scaled):
        t = torch.tensor(x_scaled, dtype=torch.float32, device=self.device).unsqueeze(0)
        z = self.encoder(t).squeeze(0).cpu().numpy()
        return z

    def featurize(self, claimed_sender, recipients, sent_at, body):
        dt = pd.to_datetime(sent_at, errors="coerce")
        if pd.isna(dt):
            dt = pd.Timestamp.utcnow()

        style = stylometry_features(body)
        temp  = temporal_features(dt)

        # Social (simple MVP): use zeros unless you saved a social cache
        social = np.zeros(6, dtype=np.float32)

        # Infra (simple MVP): use community mapping from caches if present; else fallback zeros
        # If your caches has user_comm and subnet_map, you can add the full infra logic later.
        infra = np.zeros(6, dtype=np.float32)

        x_raw = np.concatenate([style, temp, social, infra]).astype(np.float32)
        x_scaled = self.scaler.transform(x_raw.reshape(1, -1))[0].astype(np.float32)
        return x_scaled

    def verify(self, claimed_sender, recipients, sent_at, body, threshold=2.5):
        claimed_sender = claimed_sender.lower().strip()
        recipients = [r.lower().strip() for r in recipients if r.strip()]

        if claimed_sender not in self.prototypes:
            return {"decision": "UNKNOWN_USER", "reason": "No prototype enrolled for this sender."}

        x_scaled = self.featurize(claimed_sender, recipients, sent_at, body)
        z = self.embed(x_scaled)
        proto = self.prototypes[claimed_sender]

        dist = float(np.linalg.norm(z - proto))
        decision = "FLAGGED" if dist > threshold else "CLEAN"

        return {"decision": decision, "distance": dist, "threshold": float(threshold)}
