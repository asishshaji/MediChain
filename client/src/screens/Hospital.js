import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Contract from "../contracts/MediChain.json";
import Form from 'react-bootstrap/Form'
import getWeb3 from "../getWeb3";

class Hospital extends Component {
    state = {
        contract: null,
        selectedAccount: null,
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

        console.log(await this.state.contract.methods.owner().call())
    }

    addDoctor = async () => {
        await this.state.contract.addDoctor(this.state.doctorAddress).send({
            from: this.state.selectedAccount
        }, (err, hash) => console.log(err))
    }
    render() {
        return (
            <div>
                <Container style={{ marginTop: "2rem", padding: '2rem' }}>
                    <Card style={{ marginTop: '1rem' }}>
                        <Card.Body>
                            <Card.Title>Add doctor</Card.Title>
                            <Form.Label>Doctor address</Form.Label>
                            <Form.Control type="text" size="sm"
                                placeholder="Enter doctor address" onChange={(val) =>
                                    this.setState({ doctorAddress: val.target.value })} />
                            <Button variant="outline-primary" size="sm" onClick={() => this.addDoctor()} style={{ marginTop: '1rem' }}>
                                Add doctor</Button>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        );
    }
}

export default Hospital;