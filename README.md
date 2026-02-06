---
noteId: "31cfc09001a011f1bb6d15350498771e"
tags: []

---

# AuthenTrace: Identity-Centric Lateral Phishing Detection

**AuthenTrace** is an advanced security prototype designed to detect **Lateral Spear-Phishing** within enterprise environments. Unlike traditional filters that look for "spammy" content, AuthenTrace focuses on **Identity Verification**—determining if the sender is truly who they claim to be by analyzing their "Digital DNA."

## 🚀 Research Overview
In internal phishing attacks, a compromised account is used to target colleagues. Since these emails originate from trusted internal servers, standard security protocols like SPF and DKIM often pass. AuthenTrace fills this gap by using **Few-Shot Learning** and **Stylometric Analysis** to verify the authorship of every internal communication.

### 🧪 Core ML Techniques
- **Prototypical Networks (Few-Shot Learning):** Enables high-accuracy identity verification with as few as 5 historical email samples, solving the "cold-start" problem for new employees.
- **Stylometric Fingerprinting:** Analyzes 26 distinct linguistic features (punctuation density, vocabulary richness, etc.) to create a unique behavioral profile for each user.
- **Simulated Network Subnets:** Incorporates community-derived network metadata to add a second layer of identity verification beyond just text.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS v4, Recharts (Forensic Dashboards).
- **ML Core:** PyTorch (Prototypical Networks, Triplet Margin Loss).
- **Analysis:** Stylometry, Authorship Verification, and Graph-based Subnet Simulation.

## 📊 Key Features
- **Forensic Dashboard:** A visual intelligence center showing threat trends and model confidence.
- **Explainable AI (XAI):** Radar charts that explain *why* an email was flagged (e.g., "Stylometric Mismatch" or "Time Variance").
- **Protected Inbox:** A simulated email client that alerts users to identity anomalies in real-time.

## 📅 Project Timeline
This research is currently in the implementation phase, with a final completion and evaluation date set for **May 2026**.

---
*Developed as a Final Year Research Project by a Computer Science Undergraduate.*
