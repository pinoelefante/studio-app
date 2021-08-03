import React, { Component } from 'react';
import authApi from '../services/authApi';
import Form from './common/form';

class LoginPage extends Form {
    state = {
        data: {},
        errors: {},
        canCreate: null
    }
    render() {
        const {canCreate} =this.state;
        if (canCreate === null) {
            this.checkCreation();
            return "";
        }
        if (canCreate) {
            return this.createSignInPage();
        } else {
            return this.createLoginPage();
        }
    }

    checkCreation() {
        authApi.canCreate().then(response => {
            const val = response.data;
            console.info("Can create", val);
            this.setState({canCreate: val});
        })
    }

    createSignInPage() {
        return <div>
        <h1>Registrazione al servizio</h1>
        <form>
            {this.renderInput("username", "Username", "text")}
            {this.renderInput("password", "Password", "password")}
            {this.renderSubmit("Registra")}
        </form>
        </div>;
    }

    createLoginPage() {
        return <div>
            <h1>Accesso al servizio</h1>
            <form>
                {this.renderInput("username", "Username", "text")}
                {this.renderInput("password", "Password", "password")}
                {this.renderSubmit("Accedi")}
            </form>
        </div>;
    }

    doSubmit() {
        const {canCreate} =this.state;
        const {username, password} = this.state.data;
        const promise = canCreate ? authApi.signin(username, password) : authApi.login(username, password);
        promise.then(response => {
            const token = response.data;
            authApi.setTokenHeader(token);
            window.location = "/";
        });
    }
}
 
export default LoginPage;