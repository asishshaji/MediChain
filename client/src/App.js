import { BrowserRouter, Route, Switch } from 'react-router-dom';
import React, { useEffect, useState } from "react";

import Doctor from './screens/Doctor';
import Hospital from './screens/Hospital'
import Patient from './screens/Patient'
import getWeb3 from "./getWeb3";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/patient" exact component={() => <Patient />} />
        <Route path="/doctor" exact component={Doctor} />
        <Route path="/Hospital" exact component={Hospital} />
      </Switch>
    </BrowserRouter>
  );
}