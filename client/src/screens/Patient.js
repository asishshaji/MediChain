import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Contract from "../contracts/MediChain.json";
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import getWeb3 from "../getWeb3";
import ipfs from '../ipfs';

class Patient extends Component {
    state = {
        contract: null,
        loaderShow: false,
        doc: null,
        ipfsHash: "",
        patientId: null,
        selectedAccount: null,
        web3: null,
        name: "",
        sex: "",
        patientDocs: [],
        doctorAddress: null
    }
    async componentDidMount() {
        const web3 = await getWeb3();

        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Contract.networks[networkId];
        const instance = new web3.eth.Contract(
            Contract.abi,
            deployedNetwork && deployedNetwork.address,
        );

        this.setState({
            contract: instance,
            selectedAccount: accounts[0]
        })

    }

    sendToIpfs = async (event) => {
        this.setState({ loaderShow: true })
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
    }

    convertToBuffer = async (reader) => {
        //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
        this.setState({ doc: buffer });

        await ipfs.add(this.state.doc, (err, hash) => {
            this.setState({ ipfsHash: hash[0].path })
            this.setState({ loaderShow: false })
            alert(`Hash is ${hash[0].path}`)
        })

    };

    submitRecord = async () => {
        await this.state.contract.methods.addRecords(this.state.patientId, this.state.ipfsHash).send({
            from: this.state.selectedAccount
        })
    }
    registerUser = async () => {

        console.log(this.state.name, this.state.sex)
        const result = await this.state.contract.methods.registerPatient(this.state.name, this.state.sex).send({
            from: this.state.selectedAccount, gasPrice: 2100
        }, (err, hash) => console.log(err))
        alert('Patient ID is ' + result.events.patientRegistered.returnValues[0])
    }

    getRecords = async () => {
        const result = await this.state.contract.methods.viewRecords(this.state.patientId).send({
            from: this.state.selectedAccount
        }, (err, hash) => console.log(hash, err))

        this.setState({ patientDocs: result.events.sendIpfsHashes.returnValues[0] })
    }

    addDoctor = async () => {
        await this.state.contract.methods.addDoctorToPatient(this.state.patientId, this.state.doctorAddress).send({
            from: this.state.selectedAccount
        }, (err, hash) => console.log(hash, err))

    }

    render() {
        return (
            <div>
                <Container style={{ marginTop: "2rem", padding: '2rem' }}>
                    <Card style={{ marginTop: '1rem' }}>
                        <Card.Body>
                            <Card.Title>Register as Patient</Card.Title>
                            <Form.Label>Patient name</Form.Label>
                            <Form.Control type="text" size="sm" placeholder="Enter name" onChange={(val) => this.setState({ name: val.target.value })} />
                            <Form.Label>Patient Sex</Form.Label>
                            <Form.Control type="text" size="sm" placeholder="(M/F)" onChange={(val) => this.setState({ sex: val.target.value })} />


                            <Button variant="outline-primary" size="sm" onClick={() => this.registerUser()} style={{ marginTop: '1rem' }}>
                                Register</Button>
                        </Card.Body>
                    </Card>

                    {/* Add docs */}
                    <Card style={{ marginTop: '1rem' }}>
                        <Card.Body>
                            <Card.Title>Add Medical Record</Card.Title>
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control type="number" size="sm" placeholder="Enter patient id" onChange={(val) => this.setState({ patientId: val.target.value })} />

                            <Form.Group style={{ marginTop: '1rem' }}>
                                <Form.File
                                    id="medical-record"
                                    label="Select medical record"
                                    custom
                                    onChange={(event) => this.sendToIpfs(event)}
                                />
                            </Form.Group>
                            <Button variant="outline-primary" size="sm" onClick={() => this.submitRecord()}>
                                {this.state.loaderShow ? <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="false"
                                /> : null}
                                Add</Button>
                        </Card.Body>
                    </Card>

                    <Card style={{ marginTop: '1rem' }}>
                        <Card.Body>
                            <Card.Title>Get medical records</Card.Title>
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control type="number" size="sm" placeholder="Enter patient id" onChange={(val) => this.setState({ patientId: val.target.value })} />

                            <Button variant="outline-primary"
                                style={{ marginTop: '1rem' }}
                                size="sm" onClick={() => this.getRecords()}>

                                Get Records</Button>
                            <div style={{ marginTop: '1rem' }}>
                                {this.state.patientDocs.map((doc, i) => {
                                    const link = `https://gateway.ipfs.io/ipfs/${doc}`
                                    return (<a href={link} key={i} target="_blank" style={{ display: 'block' }}>Document {i + 1}</a>)
                                })}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card style={{ marginTop: '1rem' }}>
                        <Card.Body>
                            <Card.Title>Add medical representatives who can access patient data</Card.Title>
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control type="number" size="sm" placeholder="Enter patient id" onChange={(val) => this.setState({ patientId: val.target.value })} />

                            <Form.Label>Doctor address</Form.Label>
                            <Form.Control type="text" size="sm" placeholder="Enter doctor address" onChange={(val) => this.setState({ doctorAddress: val.target.value })} />

                            <Button variant="outline-primary"
                                style={{ marginTop: '1rem' }}
                                size="sm" onClick={() => this.addDoctor()}>

                                add</Button>

                        </Card.Body>
                    </Card>


                </Container>
            </div>
        );
    }
}

export default Patient;