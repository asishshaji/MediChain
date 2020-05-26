pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Roles.sol";


contract MediChain is Ownable {
    // instance of Patient
    struct Patient {
        uint256 pid;
        string patientName;
        string patientSex;
        address patientAddress;
        string[] patientRecords; // The ipfs hashes of all the documents related to patient's condition
        address[] medicalViewers; // The addresses of all the medical people who can access the patient details
    }

    uint256 public patientCount = 0;

    // Roles involved, later add medical representatives and other medical bodies
    Roles.Role private doctors;

    // datastructure mapping id to patent(like hashmap)
    mapping(uint256 => Patient) private idToPatient;

    modifier onlyDoctor(uint256 pid) {
        require(Roles.has(doctors, msg.sender), "You are not a doctor"); // checks if the sender of the transaction is really a doctor

        // checks if the doctor has permission to access the records
        Patient memory patient = idToPatient[pid];
        bool access = false;
        for (uint256 i = 0; i < patient.medicalViewers.length; i++) {
            if (patient.medicalViewers[i] == msg.sender) {
                access = true;
                break;
            }
        }
        require(access, "You don't have access");
        _;
    }

    modifier onlyPatient(uint256 pid) {
        // checks if the sender of transaction is the owner of patient with id (pid)
        require(
            idToPatient[pid].patientAddress == msg.sender,
            "You are not authorised"
        );
        _;
    }

    // events to be emitted
    event patientRegistered(uint256 _patientId);
    event recordAdded(string message);
    event doctorAddedToPatient(string message);
    event sendIpfsHashes(string[] hashes);

    // adding doctors to the contract instance, only owner of the contract can access this function. The owner is the address which deployed the contract
    function addDoctor(address _docAddress) public onlyOwner {
        Roles.add(doctors, _docAddress);
    }

    // Registering patient instance
    function registerPatient(
        string memory _patientName,
        string memory _patientSex
    ) public returns (uint256) {
        Patient memory patient;
        patient.pid = patientCount;
        patient.patientName = _patientName;
        patient.patientSex = _patientSex;
        patient.patientAddress = msg.sender;

        idToPatient[patientCount] = patient;

        // emitting event with patient id
        emit patientRegistered(patientCount);
        patientCount++;
    }

    // Allowing patients to add their ipfshash of medical records
    function addRecords(uint256 pid, string memory _ipfsHash)
        public
        onlyPatient(pid)
    {
        Patient storage patient = idToPatient[pid];
        patient.patientRecords.push(_ipfsHash);

        emit recordAdded("Record added");
    }

    // Allowing patients to add the address of their doctors, so that these doctors can later access their records
    function addDoctorToPatient(uint256 pid, address _docAddress)
        public
        onlyPatient(pid)
    {
        Patient storage patient = idToPatient[pid];
        patient.medicalViewers.push(_docAddress);

        emit doctorAddedToPatient("Doctor added to patient");
    }

    function viewRecords(uint256 pid)
        public
        onlyPatient(pid)
        returns (string[] memory)
    {
        // only doctor added by patient can access this function
        Patient memory patient = idToPatient[pid];
        emit sendIpfsHashes(patient.patientRecords);
    }

    function viewRecordsDoc(uint256 pid)
        public
        onlyDoctor(pid)
        returns (string[] memory)
    {
        // only doctor added by patient can access this function
        Patient memory patient = idToPatient[pid];
        emit sendIpfsHashes(patient.patientRecords);
    }
}
