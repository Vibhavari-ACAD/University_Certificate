// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UniversityCert {
    address public university;

    struct Certificate {
        string studentName;
        string courseName;
        string issueDate;
        bool valid;
    }

    mapping(uint => Certificate) public certificates;
    uint public certificateCount;

    event CertificateIssued(uint certID, string studentName);

    constructor() {
        university = msg.sender;
    }

    function issueCertificate(string memory studentName, string memory courseName, string memory issueDate)
        public returns (uint)
    {
        require(msg.sender == university, "Only the university can issue certificates");

        certificates[certificateCount] = Certificate(studentName, courseName, issueDate, true);
        emit CertificateIssued(certificateCount, studentName);
        certificateCount++;

        return certificateCount - 1;
    }

    function getLastCertID() public view returns (uint) {
        require(certificateCount > 0, "No certificates yet");
        return certificateCount - 1;
    }
    
    function getCertificateCount() public view returns (uint256) {
    return certificateCount;
    }


    function revokeCertificate(uint certID) public {
        require(msg.sender == university, "Only the university can revoke certificates");
        require(certificates[certID].valid, "Already revoked");
        certificates[certID].valid = false;
    }

    function verifyCertificate(uint certID) public view returns (bool) {
        return certificates[certID].valid;
    }
}
