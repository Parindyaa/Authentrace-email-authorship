from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_lib import IdentityVerifier

app = FastAPI(title="Identity Verification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

verifier = IdentityVerifier(artifacts_dir="./artifacts", device="cpu")

class VerifyRequest(BaseModel):
    claimed_sender: str
    recipients: list[str]
    sent_at: str
    body: str
    threshold: float = 2.5

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/verify")
def verify(req: VerifyRequest):
    return verifier.verify(req.claimed_sender, req.recipients, req.sent_at, req.body, req.threshold)
