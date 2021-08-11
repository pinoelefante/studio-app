import _ from 'lodash';
import React, { Component } from 'react';
import communicationApi from '../../services/communicationApi';
import { Checkbox, Input } from '../common/form';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import { AddButton, DeleteButton, SaveButton } from '../common/buttons';
import { toast } from 'react-toastify';
import MyModal from '../common/modal';

class MessageGroupView extends Component {
    state = { 
        messages: null,
        template: null,
        group: null,
        selectableFirms: [],
        selectedFirmId: [],
        selectAllFirmsCheck: false,
        applyAll: false
     }
    render() { 
        const {id: groupId} = this.props.match.params;
        const isLoaded = this.isLoaded();
        if (!isLoaded) {
            this.loadData(groupId);
        }
        return <div className="container-fluid">
            {isLoaded ? this.showData() : "Caricamento dati in corso"}
        </div>;
    }

    isLoaded() {
        const {messages, template} = this.state;
        return template !== null && messages !== null;
    }

    loadData(groupId) {
        communicationApi.getGroup(groupId)
            .then(r => {
                const {description, templateId, messages,} = r.data;
                communicationApi.getTemplate(templateId).then(r2 => {
                    const template = r2.data;
                    this.saveData(groupId, description, template, messages);
                });
            })
    }

    saveData(groupId, groupDescription, template, messages) {
        const group = {id: groupId, description: groupDescription};
        _.each(messages, m => {
            m["draftValues"] = this.combinePlaceholders(template.placeholders, m.values);
        });
        this.setState({group, template, messages});
    }

    showData() {
        const {messages, group, selectableFirms, selectedFirmId, selectAllFirmsCheck, applyAll} = this.state;
        return <React.Fragment>
            <div>
                <span style={{fontSize: "18px", fontWeight: "bold"}}>{`Gruppo ${group.id}`}</span>
                <span>&nbsp;-&nbsp;</span>
                <span>{group.description}</span>
            </div>
            <div className="row" style={{margin: "10px 0"}}>
                <AddButton text="Aggiungi azienda" onClick={this.showModalFirm}  />
                <SaveButton text="Salva dati" onClick={this.saveRemoteData}/>
            </div>
            <div className="row" style={{margin: "10px 0"}}>
                <Checkbox label="Applica a tutti" value={applyAll} checked={applyAll} onChange={this.markApplyAll} />
            </div>
            {messages.map(message => this.showMessage(message))}
            <MyModal id="myModal" title="Aggiungi azienda al messaggio" message={<div className="container">
                    <div className="row">
                        <div className="col">
                            <Checkbox label="SELEZIONA TUTTI" value={selectAllFirmsCheck} checked={selectAllFirmsCheck} onChange={this.selectAllFirms} />
                        {selectableFirms.map(firm => 
                            <Checkbox label={firm.name} value={firm.id} onChange={this.handleFirmSelected} checked={selectedFirmId.includes(firm.id)}/>
                        )}
                        </div>
                    </div>
            </div>}
            confirmText="Aggiungi" handleConfirm={() => this.onAddFirms()} cancelText="Annulla" handleCancel={() => this.closeAddFirm()}/>
        </React.Fragment>
    }

    showMessage(message) {
        const bgcolor = message.sent ? (message.error ? "red" : "green") : "yellow";
        const color = message.sent ? "white" : "black";
        const status = message.sent ? (message.error ? "In errore" : "Inviato") : "Da inviare";
        const values = message.draftValues;
        const isChanged = this.isChanged(message);
        return <React.Fragment key={`fragment_${message.id}` }>
            <div className="row">
                <div className="col-12" style={{backgroundColor:bgcolor, borderBottom: "1px solid black", color:color}}><span>{isChanged ? <FontAwesomeIcon icon={faEdit}/> : "" }</span>{status} - {message.firm.name} - {message.firm.fiscalCode}</div>
            </div>
            <div className="row">
                <div className="col-4">
                    {values.map(v => 
                        <div className="row">
                            <div className="col"><Input data-message={message.id} name={v.name} label={`${v.name} ${v.description ? `(${v.description})` : ""}`} value={v.value} onChange={this.handleChangeText}/></div>
                        </div>
                    )}
                </div>
                <div className="col-2" style={{margin: "10px"}}>
                    <DeleteButton text="Rimuovi" onClick={() => this.removeMessage(message)} />
                </div>
            </div>
        </React.Fragment>
    }

    isChanged(message) {
        const drafts = message.draftValues;
        const actual = message.values;
        if (drafts.length !== _.size(actual)) 
            return true;
        
        let changed = false;
        _.each(drafts, draft => {
            if (!actual[draft.name] || actual[draft.name] !== draft.value) {
                changed = true;
            }
        });
        return changed;
    }

    combinePlaceholders(placeholders, values) {
        let compiled = []
        _.each(placeholders, p => {
            let found = values[p.name];
            compiled.push({name: p.name, description: p.description, value: found});
        })
        return compiled;
    }

    handleChangeText = ({ currentTarget: input }) => {
        const messages = [...this.state.messages];
        const value = input.value;

        const {applyAll} = this.state;
        
        if (applyAll) {
            _.each(messages, m => {
                const property = _.find(m.draftValues, p => p.name === input.name);
                property.value = value;
            });
        } else {
            const messageId = $(input).data("message");
            const message = _.find(messages, m => m.id === Number.parseInt(messageId));
            if (!message) return;
            const property = _.find(message.draftValues, p => p.name === input.name);
            property.value = value;
        }
        this.setState({messages});
    }

    saveRemoteData = () => {
        const { messages } = this.state;
        const drafts = [];
        _.each(messages, m => {
            if (this.isChanged(m)) {
                drafts.push({id: m.id, values: this.createMessageDto(m)});
            }
        });
        if (drafts.length === 0) {
            toast.warning("Non ci sono modifiche da salvare");
            return;
        }
        communicationApi.saveMessageDraft(drafts)
            .then(r => {
                const {id: groupId} = this.props.match.params;
                toast.info("Modifiche salvate correttamente");
                this.loadData(groupId);
            })
            .catch(r => toast.error("Non è stato possibile salvare i dati"));
    }

    createMessageDto(message) {
        const drafts = message.draftValues;
        console.log(drafts);
        let item = {};
        _.each(drafts, v => {
            item[v.name] = v.value;
        });
        return item;
    }

    showModalFirm = () => {
        const {id: groupId} = this.props.match.params;
        communicationApi.getFirmsForGroup(groupId)
            .then(r => {
                const firms = r.data;
                this.setState({selectableFirms: firms, selectedFirmId: []})
                $("#myModal").modal("show");
            });
    }

    selectAllFirms = () => {
        const {selectableFirms, selectAllFirmsCheck} = this.state;
        const newVal = !selectAllFirmsCheck;
        if (newVal) {
            const ids = _.map(selectableFirms, f => f.id);
            this.setState({selectedFirmId:ids, selectAllFirmsCheck: newVal});
        } else {
            this.setState({selectedFirmId:[], selectAllFirmsCheck: newVal});
        }

    }

    handleFirmSelected = ({currentTarget: check}) => {
        let { selectedFirmId } = {...this.state};
        const value = Number.parseInt(check.value);
        selectedFirmId.push(value);
        this.setState({selectedFirmId});
    }

    closeAddFirm = () => {
        this.setState({selectedFirmId: [], selectAllFirmsCheck: false});
    }

    onAddFirms = () => {
        const {selectedFirmId: firms} = this.state;
        if (firms.length === 0) {
            toast.warning("Non sono state selezionate aziende dall'elenco");
            return;
        }
        const {id: groupId} = this.props.match.params;
        communicationApi.addFirmsToGroup(groupId, firms)
            .then(r => {
                this.loadData(groupId);
            })
            .finally(() => {
                this.closeAddFirm();
            });
    }

    removeMessage = (message) => {
        communicationApi.deleteMessage(message.id)
            .then(r => {
                const status = r.data.status;
                if (!status) {
                    toast.error("Non è stato possibile cancellare il messaggio");
                    return;
                }
                const messages = [...this.state.messages];
                const removed = _.remove(messages, m => m.id === message.id);
                if (removed.length > 0) {
                    this.setState({messages});
                }
            })
    }

    markApplyAll = () => {
        const {applyAll} = this.state;
        const newVal = !applyAll;
        this.setState({applyAll:newVal});
    }
}
 
export default MessageGroupView;