import React from 'react'
import ReactDOM from 'react-dom'
import Radium from 'radium'
import request from 'superagent'
import { Modal, ModalBody, ModalFooter } from 'reactstrap'

import Button from './Button'
import Styles from './Styles'
import Strings from './Strings'

@Radium
export default class CredentialsModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modal: props.visible
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            modal: newProps.visible
        })
    }

    saveApiKey = (e) => {
        e.preventDefault()
        var self = this
        var username = ReactDOM.findDOMNode(this.refs.username).value
        var password = ReactDOM.findDOMNode(this.refs.password).value

        var req = request.post('/api/test_credentials')

        req.query({
            username: username,
            password: password
         })

        req.end((err, res) => {
            if (res.body.valid) {
                self.toggle()
                self.props.setCredentials(username, password)
            } else {
                self.setState({error: Strings.invalid_key})
            }
        })
    }

    logout = (e) => {
        e.preventDefault()
        this.toggle()
        this.props.setCredentials('', '')
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

        var title = {
            font: Styles.fontTitle,
            color: Styles.colorTextDark,
            display: 'inline-block',
        }

        var error = {
            color: '#F44336',
            font: Styles.fontDefault,
        }

        return (
            <Modal isOpen={this.state.modal} toggle={this.toggle}>
                <div className='modal-header'>
                    <div style={title}>{Strings.update_key}</div>
                    <button onClick={this.toggle} style={deleteStyle} />
                </div>
                <ModalBody>
                    <p>{Strings.key_modal_description}</p>
                    <p><a href='https://console.ng.bluemix.net/catalog/services/speech-to-text/' target='_blank'>{Strings.sign_up}</a></p>
                    {this.state.error ? <p id='error--api-key-modal--api-key' style={error}>{this.state.error}</p> : null}
                    <form id='api-key-form' role='form' action='#'>
                        <div className={this.state.error ? 'form-group has-danger' : 'form-group'}>
                            <input
                                style={{marginBottom: '12px'}}
                                id='input--api-key-modal--api-key'
                                ref='username'
                                className='form-control'
                                type='text'
                                placeholder='username'/>
                            <input
                                ref='password'
                                className='form-control'
                                type='text'
                                placeholder='password'/>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter style={{textAlign: 'right'}}>
                    <Button
                        id='button--api-key-modal--logout'
                        onClick={this.logout}
                        text={Strings.log_out}
                        style={{marginRight: '20px'}}/>
                    <Button
                        id='button--api-key-modal--submit'
                        onClick={this.saveApiKey}
                        kind={'bold'}
                        text={Strings.save_key}/>
                </ModalFooter>
            </Modal>
        )
    }
}
