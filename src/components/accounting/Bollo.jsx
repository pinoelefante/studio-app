import React, { Component } from 'react';
import accountingApi from '../../services/accountingApi';
import YearSelector from '../common/yearSelector';
import ItalianDateRenderer from '../common/date';

class BolloFrame extends Component {
    state = { bollo: null, year: null}
    render() {
        const { firmId } = this.props;
        const { bollo, year } = this.state;
        if (year == null) {
            this.setState({year: new Date().getFullYear()});
            return <div></div>
        }

        if (bollo == null) {
            this.loadBollo(firmId, year);
            return <div></div>
        }
        
        return this.createPage(bollo, year);
    }

    loadBollo = async(firmId, year) => {
        accountingApi.getBollo(firmId, year)
            .then(res => this.setState({bollo: res.data, year}))
            .catch(err => console.error(err));
    }

    onYearChanged = async(newValue) => {
        const { firmId } = this.props;
        this.loadBollo(firmId, newValue);
    }

    createPage(bollo, year) {
        return <table>
            <tr>
                <YearSelector from={2019} to={new Date().getFullYear()} current={year} onYearChanged={this.onYearChanged} />
            </tr>
            <tr>
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Trimestre</th>
                        <th>n. fatture</th>
                        <th>da pagare</th>
                        <th>scadenza</th>
                    </tr>
                </thead>
                <tbody>
                {bollo.map(d => {
                        return (
                        <tr key={`${d.trimestre}`}>
                            <td>{d.trimestre}</td>
                            <td>{d.invoiceCount}</td>
                            <td>€ {d.amount}</td>
                            <td><ItalianDateRenderer date={d.expire} /></td>
                        </tr>)
                    })}
                </tbody>
            </table>
            </tr>
        </table>
    }
}

export default BolloFrame