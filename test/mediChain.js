const Medichain = artifacts.require("./MediChain.sol");

contract("Medichain", accounts => {
    let contract;

    const owner = accounts[0];

    const doctor1 = accounts[1];
    const doctor2 = accounts[2];
    const hospital = accounts[3];
    const researcher1 = accounts[4];
    const researcher2 = accounts[5];

    const patientAddress = accounts[6];

    before(async () => {
        contract = await Medichain.deployed();
        await contract.addDoctor(doctor1);
        await contract.addDoctor(doctor2);
    })

    describe('Medichain tests', async () => {

        it(`Owner is  ${owner}`, async () => {
            const contractOwner = await contract.owner();
            assert.equal(owner, contractOwner);
        });

        it('Patient added', async () => {
            const count = await contract.patientCount();
            const patient = await contract.registerPatient("Asish", "M", { from: patientAddress });
            const patientAdded = await contract.idToPatient(count);
            assert.equal("Asish", patientAdded.patientName, "Patient name is not correct");
        });

        it('Added documents', async () => {
            const patientId = 0;
            const result = await contract.addRecords(patientId, "randomhashtobeadded", { from: patientAddress });
        });

        it('View documents for patient', async () => {
            const patient = await contract.viewRecords(0, { from: patientAddress });
            assert.equal("randomhashtobeadded", patient[0], "Wrong document");
        });

        it('Add doctor to patient', async () => {
            await contract.addDoctorToPatient(0, doctor1, { from: patientAddress });
        });

        it('View documents for doctor', async () => {
            const records = await contract.viewRecordsDoc(0, { from: doctor1 })
            console.log(records)
        });


    })


});
