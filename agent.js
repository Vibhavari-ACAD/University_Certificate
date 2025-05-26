// agent.js
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Load contract details
const abi = JSON.parse(fs.readFileSync("./abi/UniversityCert.json", "utf8")).abi;
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// API endpoint to issue a certificate
app.post("/issue-certificate", async (req, res) => {
  const { studentName, courseName, issueDate } = req.body;

  if (!studentName || !courseName || !issueDate) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  try {
    const tx = await contract.issueCertificate(studentName, courseName, issueDate);
    const receipt = await tx.wait();

    let certID = null;
    const event = receipt.events?.find(e => e.event === "CertificateIssued");
    if (event && event.args && event.args.certID) {
      certID = event.args.certID.toString();
    }
    const count = await contract.getCertificateCount();
    console.log("Current certificate count:", count.toString());

    return res.json({
      success: true,
      txHash: receipt.transactionHash,
      certID: certID || "0"
    },
    console.log("Returned certID:", certID));
    
  } catch (err) {
    console.error("Agent error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Verify certificate status
app.get("/verify-certificate/:certID", async (req, res) => {
  const certID = req.params.certID;

  try {
    const isValid = await contract.verifyCertificate(certID);
    res.json({ valid: isValid });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to verify certificate." });
  }
});

// Revoke certificate
app.post("/revoke-certificate", async (req, res) => {
  const { certID } = req.body;

  if (certID === undefined || certID === "") {
    return res.status(400).json({ success: false, error: "certID is required" });
  }

  try {
    const tx = await contract.revokeCertificate(certID);
    const receipt = await tx.wait();
    console.log(`Certificate ${certID} revoked. Tx: ${receipt.transactionHash}`);
    res.json({ success: true, txHash: receipt.transactionHash });
  } catch (error) {
    console.error("Revoke error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch full certificate details
app.get("/fetch-certificate/:certID", async (req, res) => {
  const certID = req.params.certID;

  try {
    const cert = await contract.certificates(certID);

    // Optional: skip empty/default certificates
    if (!cert || cert.studentName.trim() === "") {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json({
      studentName: cert.studentName,
      courseName: cert.courseName,
      issueDate: cert.issueDate,
      valid: cert.valid
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ error: "Failed to fetch certificate" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🎓 Certificate Agent running at http://localhost:5000`);
});
