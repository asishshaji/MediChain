import { BrowserRouter, Route, Switch } from 'react-router-dom';

import ContractOwner from './ContractOwner';
import Doctor from './screens/Doctor';
import Hospital from './screens/Hospital'
import Patient from './screens/Patient'
import React from "react";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/patient" exact component={() => <Patient />} />
        <Route path="/doctor" exact component={Doctor} />
        <Route path="/Hospital" exact component={Hospital} />
        <Route path="/Owner" exact component={ContractOwner} />

      </Switch>
    </BrowserRouter>
  );
}