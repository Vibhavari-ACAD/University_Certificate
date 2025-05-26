import { useState, useRef } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
    const [previewCert, setPreviewCert] = useState(null);
    const [previewURL, setPreviewURL] = useState("");
    const revokeCertIdRef = useRef(null);
    const [loading, setLoading] = useState(false);

    async function issueCertificate() {
        setLoading(true);
        const studentName = document.getElementById("studentName").value;
        const courseName = document.getElementById("courseName").value;
        const issueDate = document.getElementById("issueDate").value;

        if (!studentName || !courseName || !issueDate) {
            alert("Fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/issue-certificate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentName, courseName, issueDate })
            });

            const data = await res.json();
            if (data.success) {
                const certID = data.certID || "0";
                const blockchainID = `0x${certID.toString(16).padStart(64, "0")}`;
                generateCertificatePDF(certID, studentName, courseName, issueDate, blockchainID);
                alert(`Certificate Issued! CertID: ${certID}`);
                document.getElementById("certIdVerify").value = certID;
            } else {
                alert("Error issuing certificate: " + data.error);
            }
        } catch (error) {
            console.error("Issue error:", error);
            alert("Error communicating with agent: " + error.message);
        }

        setLoading(false);
    }

    function generateCertificatePDF(certID, studentName, courseName, issueDate, blockchainID) {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.setFillColor(240, 230, 200);
        doc.rect(0, 0, 297, 210, "F");
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(4);
        doc.rect(10, 10, 277, 190);

        const logo = new Image();
        logo.src = "/atria_university_logo.png";
        logo.onload = () => {
            doc.addImage(logo, "PNG", 20, 15, 40, 40);
            doc.setFont("times", "bold");
            doc.setFontSize(40);
            doc.text("Atria University", 148.5, 50, { align: "center" });
            doc.setFontSize(24);
            doc.text("Certificate of Completion", 148.5, 70, { align: "center" });
            doc.setFontSize(16);
            doc.setFont("times", "normal");
            doc.text("This is to certify that", 148.5, 95, { align: "center" });
            doc.setFont("times", "bold");
            doc.setFontSize(18);
            doc.text(studentName, 148.5, 105, { align: "center" });
            doc.setFont("times", "normal");
            doc.setFontSize(16);
            doc.text("has successfully completed the course", 148.5, 115, { align: "center" });
            doc.setFont("times", "bold");
            doc.setFontSize(18);
            doc.text(courseName, 148.5, 125, { align: "center" });
            doc.setFont("times", "normal");
            doc.setFontSize(16);
            doc.text("successfully.", 148.5, 135, { align: "center" });
            doc.setFontSize(14);
            doc.text(`Issued on: ${issueDate}`, 40, 180);
            doc.text(`Certificate ID: ${certID}`, 240, 180, { align: "right" });
            doc.setFontSize(12);
            doc.text(`Verification ID: ${blockchainID}`, 148.5, 195, { align: "center" });
            doc.save(`AtriaUniversity_Certificate_${certID}.pdf`);
        };
        logo.onerror = () => {
            alert("Error loading logo. Make sure 'atria_university_logo.png' exists in public folder.");
        };
    }

    async function verifyCertificate() {
        const certId = document.getElementById("certIdVerify").value;
        try {
            const res = await fetch(`http://localhost:5000/verify-certificate/${certId}`);
            const data = await res.json();
            alert(data.valid ? "✅ Certificate is VALID" : "❌ Certificate has been REVOKED");
        } catch (error) {
            alert("Error verifying certificate.");
        }
    }

    async function fetchCertificate(certId) {
        try {
            const res = await fetch(`http://localhost:5000/fetch-certificate/${certId}`);
            return await res.json();
        } catch (err) {
            alert("Error fetching certificate.");
            return null;
        }
    }

    async function revokeCertificate() {
        const certId = document.getElementById("certIdRevoke").value;
        revokeCertIdRef.current = certId;
        const certDetails = await fetchCertificate(certId);

        if (!certDetails || !certDetails.studentName) {
            alert("Certificate not found!");
            return;
        }

        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.setFillColor(240, 230, 200);
        doc.rect(0, 0, 297, 210, "F");
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(4);
        doc.rect(10, 10, 277, 190);
        doc.setFont("times", "bold");
        doc.setFontSize(40);
        doc.text("Atria University", 148.5, 50, { align: "center" });
        doc.setFontSize(24);
        doc.text("Certificate of Completion", 148.5, 70, { align: "center" });
        doc.setFontSize(16);
        doc.setFont("times", "normal");
        doc.text("This is to certify that", 148.5, 95, { align: "center" });
        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.text(certDetails.studentName, 148.5, 105, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text("has successfully completed the course", 148.5, 115, { align: "center" });
        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.text(certDetails.courseName, 148.5, 125, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text("successfully.", 148.5, 135, { align: "center" });
        doc.setFontSize(14);
        doc.text(`Issued on: ${certDetails.issueDate}`, 40, 180);
        doc.text(`Certificate ID: ${certId}`, 240, 180, { align: "right" });
        doc.setFontSize(12);
        doc.text(`Verification ID: 0x${certId.toString(16).padStart(64, "0")}`, 148.5, 195, { align: "center" });

        const blob = doc.output("blob");
        setPreviewURL(URL.createObjectURL(blob));
        setPreviewCert(certDetails);
    }

    async function handleRevokeConfirm() {
        const certId = revokeCertIdRef.current;
        try {
            const res = await fetch("http://localhost:5000/revoke-certificate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ certID: certId })
            });
            const data = await res.json();
            alert(data.success ? `✅ Certificate ${certId} revoked.` : "❌ Error: " + data.error);
        } catch (err) {
            alert("❌ Failed to revoke: " + err.message);
        } finally {
            setPreviewCert(null);
            revokeCertIdRef.current = null;
        }
    }

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial", margin: "20px" }}>
            <h2>University Certificate DApp (Agent-Based)</h2>
            <h3>Issue Certificate</h3>
            <input type="text" id="studentName" placeholder="Student Name" />
            <input type="text" id="courseName" placeholder="Course Name" />
            <input type="date" id="issueDate" />
            <button onClick={issueCertificate} disabled={loading}>
                {loading ? "Processing..." : "Issue Certificate"}
            </button>

            <h3>Verify Certificate</h3>
            <input type="number" id="certIdVerify" placeholder="Certificate ID" />
            <button onClick={verifyCertificate}>Verify</button>

            <h3>Revoke Certificate</h3>
            <input type="number" id="certIdRevoke" placeholder="Certificate ID" />
            <button onClick={revokeCertificate}>Preview & Revoke</button>

            {previewCert && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white", padding: 20, borderRadius: 10,
                        width: "80%", height: "80%", display: "flex", flexDirection: "column"
                    }}>
                        <h3>Preview Certificate</h3>
                        <iframe src={previewURL} title="Certificate Preview" style={{ flex: 1, border: "1px solid #ccc", marginBottom: "10px" }} />
                        <div style={{ textAlign: "right" }}>
                            <button onClick={handleRevokeConfirm} style={{ marginRight: 10 }}>Revoke</button>
                            <button onClick={() => setPreviewCert(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}