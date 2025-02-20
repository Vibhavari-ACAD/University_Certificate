
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import UniversityCert from "../artifacts/contracts/UniversityCert.sol/UniversityCert.json"
        
export default function Home() {
    const [walletAddress, setWalletAddress] = useState("");
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
            
    // Contract details (replace with your deployed contract's address and ABI)
    const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";  // Replace this
    const CONTRACT_ABI = UniversityCert.abi; // Replace with actual ABI
        
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);
        
    async function checkIfWalletIsConnected() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                setContract(contractInstance);
            }
        } else {
            alert("Please install MetaMask!");
        }
    }
        
    async function connectWallet() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const signer = provider.getSigner();
            const accounts = await provider.listAccounts();
            setWalletAddress(accounts[0]);
        
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(contractInstance);
        } else {
            alert("MetaMask not detected!");
        }
    }
        
    async function issueCertificate() {
        setLoading(true);
        const studentName = document.getElementById("studentName").value;
        const courseName = document.getElementById("courseName").value;
        const issueDate = document.getElementById("issueDate").value;
    
        if (!studentName || !courseName || !issueDate) {
            alert("Please fill in all fields.");
            setLoading(false);
            return;
        }
    
        try {
            // ✅ Issue Certificate
            const tx = await contract.issueCertificate(studentName, courseName, issueDate);
            await tx.wait();
    
            // ✅ Check if this is the first certificate
            const count = await contract.certificateCount();
            let certID = 0;
            if (count.toString() !== "0") {
                certID = await contract.getLastCertID();
            }
    
            alert(`Certificate Issued! CertID: ${certID}`);
            document.getElementById("certIdVerify").value = certID;  // Auto-fill verify input
        } catch (error) {
            console.error("Error issuing certificate:", error);
            alert("Error issuing certificate: " + error.message);
        }
        setLoading(false);
    }
    
    
        
        
    async function revokeCertificate() {
        setLoading(true);
        const certId = document.getElementById("certIdRevoke").value;
                
        try {
            const tx = await contract.revokeCertificate(certId);
            await tx.wait();
            alert("Certificate Revoked!");
        } catch (error) {
            alert("Error revoking certificate: " + error.message);
        }
        setLoading(false);
    }
        
    async function verifyCertificate() {
        const certId = document.getElementById("certIdVerify").value;
                
        try {
            const isValid = await contract.verifyCertificate(certId);
            alert(isValid ? "Valid Certificate" : "Revoked Certificate");
        } catch (error) {
            alert("Error verifying certificate: " + error.message);
        }
    }
        
    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", margin: "20px" }}>
            <h2>University Certificate DApp</h2>
        
            {walletAddress ? (
                <p><b>Connected Wallet:</b> {walletAddress}</p>
            ) : (
                <button onClick={connectWallet}>Connect MetaMask</button>
            )}
        
            <h3>Issue Certificate</h3>
            <input type="text" id="studentName" placeholder="Student Name" />
            <input type="text" id="courseName" placeholder="Course Name" />
            <input type="date" id="issueDate" />
            <button onClick={issueCertificate} disabled={loading}>
                {loading ? "Processing..." : "Issue Certificate"}
            </button>
        
            <h3>Revoke Certificate</h3>
            <input type="number" id="certIdRevoke" placeholder="Certificate ID" />
            <button onClick={revokeCertificate} disabled={loading}>
                {loading ? "Processing..." : "Revoke"}
            </button>
        
            <h3>Verify Certificate</h3>
            <input type="number" id="certIdVerify" placeholder="Certificate ID" />
            <button onClick={verifyCertificate}>Verify</button>
        </div>
    );
}
        

