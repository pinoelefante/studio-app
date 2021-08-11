import React, { Component } from 'react';
import { toast } from 'react-toastify';
import communicationApi from '../../services/communicationApi';
import { GoButton } from '../common/buttons';

class MessageGroupListView extends Component {
    state = { 
        init: false,
        templates: []
     }
    
    render() {
        const {init} = this.state;
        if (!init) {
            const { id: templateId } = this.props.match.params
            this.loadGroups(templateId);
            return <p>Recupero gruppi in corso</p>;
        }
        const {templates} = this.state;
        return <div className="container-fluid">
            <h3>Elenco gruppi</h3>
            <div className="row">
                <div className="col"><b>id</b></div>
                <div className="col-2"><b>descrizione</b></div>
                <div className="col"><b>inviati</b></div>
                <div className="col"><b>da inviare</b></div>
                <div className="col"><b>errore</b></div>
                <div className="col-4"><b>azioni</b></div>
            </div>
            {templates.map(t => 
                <div className="row" key={`tr_${t.groupId}`} style={{marginBottom: "10px"}}>
                    <div className="col">{t.groupId}</div>
                    <div className="col-2">{t.description}</div>
                    <div className="col"><span style={{color: "green", fontWeight:"bold"}}></span></div>
                    <div className="col"><span style={{color: "yellow", fontWeight:"bold"}}></span></div>
                    <div className="col"><span style={{color: "red", fontWeight:"bold"}}></span></div>
                    <div className="col-4">
                        <GoButton useLink={true} href={`/message/group/${t.groupId}`} />
                    </div>
                </div>
            )}
        </div>;
    }

    loadGroups = (templateId) => {
        communicationApi.getTemplateGroups(templateId)
            .then(r => {
                const templates = r.data;
                this.setState({templates, init: true});
            })
            .catch(r => toast.error("Si è verificato un errore durante il caricamento dei gruppi"))
    }


}
 
export default MessageGroupListView;