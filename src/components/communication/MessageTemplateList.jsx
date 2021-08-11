import React, { Component } from 'react';
import { toast } from 'react-toastify';
import communicationApi from '../../services/communicationApi';
import { AddButton, DeleteButton, EditButton, ViewButton } from '../common/buttons';
import MyModal from '../common/modal';
import $ from 'jquery';
import { Input } from '../common/form';

class MessageTemplateList extends Component {
    state = { 
        templates: [],
        init: true,
        creatingGroupTemplate: null,
        data: {creatingGroupName: ""}
    };
    
    render() { 
        const {templates, init} = this.state;
        if (init) {
            this.loadTemplates();
            return <div></div>
        }
        const { creatingGroupName } = this.state.data;
        return (<React.Fragment>
            <h3>Elenco Template</h3>
            <AddButton text="Aggiungi template" useLink={true} href="/message/template/new" />
            { templates.length > 0 ?
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xl-1">
                        <b>id</b>
                    </div>
                    <div className="col-xl-2">
                        <b>oggetto</b>
                    </div>
                    <div className="col-xl-2">
                        <b>corpo messaggio</b>
                    </div>
                    <div className="col-xl-6">
                        <b>azioni</b>
                    </div>
                </div>
                {templates.map(t => 
                    <div className="row" key={"div_" + t.id}>
                        <div className="col-xl-1" style={{border:"1px solid black"}}>
                            <p>{t.id}</p>
                        </div>

                        <div className="col-xl-2" style={{border:"1px solid black"}}>
                            <p>{t.subject}</p>
                        </div>

                        <div className="col-xl-2" style={{border:"1px solid black"}}>
                            <p>{t.message}</p>
                        </div>

                        <div className="col-xl-6" style={{border:"1px solid black"}}>
                            <AddButton text="Nuovo gruppo" onClick={() => this.createGroup(t.id)} />
                            <ViewButton useLink={true} href={`/message/template/${t.id}/groups`} />
                            <EditButton useLink={true} href={`/message/template/${t.id}`} />
                            <DeleteButton onClick={() => this.deleteTemplate(t.id)} />
                        </div>
                    </div>
                        
                    )}
            </div>
            : <p>Al momento non ci sono template disponibili</p>}
            <MyModal id="myModal" title="Crea nuovo gruppo" message={<div className="container">
                    <div className="row">
                        <div className="col"><Input name="creatingGroupName" label="Descrizione gruppo" value={creatingGroupName} onChange={this.handleChange}/></div>
                    </div>
            </div>}
            confirmText="Crea" handleConfirm={() => this.onCreateGroup()} cancelText="Annulla" handleCancel={() => this.closeCreateGroup()}/>
        </React.Fragment>);
    }

    loadTemplates() {
        communicationApi.getTemplates()
        .then(r => {
            const {data:templates} = r;
            this.setState({init:false, templates});
        }).catch(r => {
            toast.error("Si è verificato un errore durante il caricamento dei template");
        });
    }

    deleteTemplate = (id) => {
        communicationApi.deleteTemplate(id).then(r => {
            this.loadTemplates();
        }).catch(r => {
            toast.error("Si è verificato un errore");
        });
    }

    createGroup = (templateId) => {
        this.setState({creatingGroupTemplate: templateId});
        $("#myModal").modal("show");
    }

    closeCreateGroup = () => {
        this.setState({creatingGroupTemplate: null});
    }

    onCreateGroup = () => {
        const {creatingGroupTemplate: templateId} = this.state;
        const {creatingGroupName: name} = this.state.data;
        const newGroup = {templateId: templateId, description: name};
        communicationApi.createGroup(newGroup).then(r => {
            const group = r.data;
            toast.info("Gruppo creato - " + group.groupId);
        }).catch(r => {
            toast.info("Si è verificato un errore durante la creazione del gruppo");
        })
    }

    handleChange = ({ currentTarget: input }) => {
		const data = { ...this.state.data };
		data[input.name] = input.value;
		this.setState({ data });
	};
}
 
export default MessageTemplateList;