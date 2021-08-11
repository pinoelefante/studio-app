import React, { Component } from 'react';

class MyModal extends Component {
    state = {  }
    render() { 
        const {title, message, confirmText, cancelText, handleConfirm, handleCancel, id} = this.props;
        return ( 
            <div id={id} className="modal fade" role="dialog" tabIndex="-1">
                <div className="modal-dialog modal-dialog-scrollable" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">{title}</h3>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Chiudi" onClick={handleCancel}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            {message}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-success" data-dismiss="modal" onClick={handleConfirm}>{confirmText}</button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={handleCancel}>{cancelText}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default MyModal;