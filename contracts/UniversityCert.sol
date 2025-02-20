// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UniversityCert {
    // The university's address (only this address can issue or revoke certificates)
    address public university;

    // A structure to hold certificate details
    struct Certificate {
        string studentName;
        string courseName;
        string issueDate;
        bool valid; // Is the certificate valid or revoked?
    }

    // A way to store certificates (each certificate is identified by a unique ID)
    mapping(uint => Certificate) public certificates;

    // A counter to keep track of certificate IDs
    uint public certificateCount=0;

    // This constructor runs when the contract is first deployed
    constructor() {
        university = msg.sender; // Set the deployer of the contract as the university
    }

    // Function to issue a certificate
    function issueCertificate(string memory studentName, string memory courseName, string memory issueDate) 
    public returns (uint) 
    {
        require(msg.sender == university, "Only the university can issue certificates");

        uint certID = certificateCount; // Store the current ID before incrementing
        certificates[certID] = Certificate(studentName, courseName, issueDate, true);
        certificateCount++; // Increment for the next certificate

        return certID; // Return the issued certificate ID
    }

    function getLastCertID() public view returns (uint) {
        if (certificateCount == 0) {
            return 0;  // ✅ Return 0 instead of reverting
        }
        return certificateCount - 1;
    }


    // Function to revoke a certificate
    function revokeCertificate(uint certID) public {
        require(msg.sender == university, "Only the university can revoke certificates");
        certificates[certID].valid = false; // Mark the certificate as invalid
    }

    // Function to verify if a certificate is valid
    function verifyCertificate(uint certID) public view returns (bool) {
        return certificates[certID].valid;
    }
}
