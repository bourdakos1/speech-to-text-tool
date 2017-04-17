import React from 'react'
import ReactDOM from 'react-dom'
import Radium from 'radium'
import request from 'superagent'
import { Modal, ModalBody, ModalFooter } from 'reactstrap'

import Button from './Button'
import Styles from './Styles'
import Strings from './Strings'

@Radium
export default class AddWordModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: props.visible
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            modal: newProps.visible
        })
    }

    cancel = (e) => {
        e.preventDefault()
        this.toggle()
    }

    add = (e) => {
        e.preventDefault()
        this.toggle()
    }

    toggle = () => {
        this.setState({
            modal: !this.state.modal
        }, () => {
            if (this.state.modal == false) {
                this.props.onHidden()
            }
        })
    }

    render() {
        var deleteStyle = {
            backgroundColor: 'transparent',
            backgroundImage: `url(${'/btn_delete.png'})`,
            height: '25px',
            width: '25px',
            backgroundPosition: '0 0',
            backgroundSize: '75px 25px',
            backgroundRepeat: 'no-repeat',
            border: 'none',
            ':hover': {
                backgroundPosition: '-25px 0',
            },
            ':active': {
                backgroundPosition: '-50px 0',
            }
        }

        var error = {
            color: '#F44336',
            font: Styles.fontDefault,
        }

        return (
            <Modal isOpen={this.state.modal} toggle={this.toggle}>
                <div className="modal-header">
                    <div style={{font: Styles.fontTitle, color: Styles.colorTextDark, display: 'inline-block'}}>{'Add word'}</div>
                    <button onClick={this.toggle} style={deleteStyle} />
                </div>
                <ModalBody>
                    <p>{Strings.key_modal_description}</p>
                    {this.state.error ? <p id='error--api-key-modal--api-key' style={error}>{this.state.error}</p> : null}
                    <form id="api-key-form" role="form" action="#">
                        <div className={this.state.error ? "form-group has-danger" : "form-group"}>
                            <input
                                style={{marginBottom: '12px'}}
                                ref="username"
                                className="form-control"
                                type="word"
                                placeholder="word"/>
                            <input
                                ref="sounds_like"
                                className="form-control"
                                type="text"
                                placeholder="sounds like"/>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter style={{textAlign: 'right'}}>
                    <Button onClick={this.cancel} text={'cancel'} style={{marginRight: '20px'}}/>
                    <Button onClick={this.add} kind={"bold"} text={'add'}/>
                </ModalFooter>
            </Modal>
        )
    }
}
