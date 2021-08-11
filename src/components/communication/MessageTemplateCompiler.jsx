import _ from 'lodash';
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { AddButton, DeleteButton, SaveButton } from '../common/buttons';
import {InlineInput, Input} from '../common/form';
import communicationApi from '../../services/communicationApi';

class MessageTemplateCompiler extends Component {
    state = {
        template: { id: null, placeholders: [], subject: "", message: "" },
        data: {new_placeholder_id:"", new_placeholder_desc:""},
        init: false
    };

    render() { 
        const {init} = this.state;
        const { id: templateId } = this.props.match.params
        if (!init && templateId && templateId !== 'new') {
            this.loadTemplate(templateId);
            return <div></div>
        }
        const {id, placeholders, subject, message} = this.state.template;
        const title = id ? `Modifica template messaggio - ${id}` : "Creazione nuovo template messaggio";
        return <React.Fragment>
            <h3>{title}</h3>
            <div>
                {this.createPlaceholdersView(placeholders)}
                <Input name="subject" label="Oggetto" onChange={this.handleTemplateChange} value={subject}/>
                <div>
                    <textarea name="message" className="form-control" rows={10} cols={120} value={message} onChange={this.handleTemplateChange}/>
                </div>
                <div style={{width:"50%", margin:"15px auto", padding:"0 auto"}}>
                    <SaveButton text="Salva template" onClick={this.saveTemplate} />
                </div>
                
            </div>
        </React.Fragment>;
    }

    initFromTemplate(template) {
        const emptyTemplate = { id: null, placeholders: [], subject: "", message: "" };
        const toUseTemplate = template ? template : emptyTemplate;
        this.setState({init:true, template:toUseTemplate});
    }

    loadTemplate(id) {
        communicationApi.getTemplate(id)
        .then(r => {
            const {data:template} = r;
            this.setState({init:true, template});
        })
        .catch(r => {
            toast.error("Si è verificato un errore");
        });
    }

    createPlaceholdersView(placeholders) {
        const {new_placeholder_id, new_placeholder_desc} = this.state.data;
        return <div>
            <h5>Elenco parametri</h5>
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Nome parametro</th>
                        <th>Descrizione</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {placeholders.map(p => <tr key={`tr_${p.name}`}>
                        <td>$({p.name})</td>
                        <td>{p.description}</td>
                        <td><DeleteButton onClick={() => this.removePlaceholder(p)} /></td>
                    </tr>)}
                    <tr>
                        <td>
                            <InlineInput name="new_placeholder_id" onChange={this.handleTextChange} value={new_placeholder_id}/>
                        </td>

                        <td>
                            <InlineInput name="new_placeholder_desc" onChange={this.handleTextChange}  value={new_placeholder_desc} />
                        </td>
                        <td>
                            <AddButton text="Aggiungi" onClick={this.onClickAdd} />            
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>;
    }

    handleTextChange = ({ currentTarget: input }) => {
		const data = { ...this.state.data };
		data[input.name] = input.value;
		this.setState({ data });
	};

    handleTemplateChange = ({ currentTarget: input }) => {
		const template = { ...this.state.template };
		template[input.name] = input.value;
		this.setState({ template });
	};

    onClickAdd = (evt) => {
        const {new_placeholder_id, new_placeholder_desc} = this.state.data;
        if (!new_placeholder_id || !new_placeholder_id.trim()) {
            return;
        }
        if (this.isPlaceholderExists(new_placeholder_id)) {
            toast.error(`Il parametro $(${new_placeholder_id}) già esiste`);
            return;
        }
        const newPlaceholder = {"name": new_placeholder_id, "description": new_placeholder_desc};
        let {placeholders} = this.state.template;
        placeholders.push(newPlaceholder);
        this.setState({placeholders, data: {new_placeholder_id:"", new_placeholder_desc:""} });
    }

    removePlaceholder = (p) => {
        console.log("trying to remove", p);
        let {placeholders} = {...this.state.template};
        _.remove(placeholders, x => x.name === p.name);
        this.setState({placeholders});
    }

    isPlaceholderExists(id) {
        const {placeholders} = this.state.template;
        return _.find(placeholders, x => x.name === id);
    }

    saveTemplate = (evt) => {
        const {template} = this.state;
        console.info(template)
        communicationApi.saveTemplate(template).then(r => {
            const {data:template} = r;
            toast.info(`Template salvato`, {
                autoClose: 3000,
                pauseOnHover: false,
                closeButton: true
            });
            this.setState({template});
        }).catch(r => {
            toast.info(`Si è verificato un errore durante il salvataggio del template`);
        });
    }
}
 
export default MessageTemplateCompiler;