import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Contract from "../contracts/MediChain.json";
import Form from 'react-bootstrap/Form'
import getWeb3 from "../getWeb3";

class Doctor extends Component {
    state = {
        contract: null,
        selectedAccount: null,
        patientId: null,
        patientDocs: [],

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

        console.log(await this.state.contract.methods.owner().call())
    }

    viewRecordsDoc = async () => {
        const result = await this.state.contract.viewRecordsDoc(this.state.patientId).send({
            from: this.state.selectedAccount
        }, (err, hash) => console.log(err))

        this.setState({ patientDocs: result.events.sendIpfsHashes.returnValues[0] })

    }
    render() {
        return (
            <div>
                <Container style={{ marginTop: "2rem", padding: '2rem' }}>
                    <Card style={{ marginTop: '1rem' }}>
                        <Card.Body>
                            <Card.Title>View docs</Card.Title>
                            <Form.Label>Patient Id</Form.Label>
                            <Form.Control type="text" size="sm"
                                placeholder="Enter doctor address" onChange={(val) =>
                                    this.setState({ patientId: val.target.value })} />
                            <Button variant="outline-primary" size="sm" onClick={() => this.viewRecordsDoc()} style={{ marginTop: '1rem' }}>
                                View docs</Button>

                            <div style={{ marginTop: '1rem' }}>
                                {this.state.patientDocs.map((doc, i) => {
                                    const link = `https://gateway.ipfs.io/ipfs/${doc}`
                                    return (<a href={link} key={i} target="_blank" style={{ display: 'block' }}>Document {i + 1}</a>)
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        );
    }
}

export default Doctor;