import { ToastContainer } from 'react-toastify';
import React from "react";
import FirmList from './components/FirmList';
import AppNavBar from './components/AppNavBar';
import {Route, Switch } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import FirmPage from './components/FirmPage';
import MassOperation from './components/MassOperations';

function App() {
  return (
    <React.Fragment>
      <AppNavBar />
      <div className="content" style={{padding:"15px"}}>
      <Switch>
        <Route path="/massive-operations" component={MassOperation} />
        <Route path="/firm/:id" component={FirmPage} />
        <Route path="/firm" component={FirmList} />
        <Route path="/" component={FirmList} />
      </Switch>
      
    </div>
      <ToastContainer position="top-right" autoClose={5000}/>
    </React.Fragment>
  );
}

export default App;
