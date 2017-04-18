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
        super(props)
        this.state = {
            modal: props.visible,
            soundsLike: []
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            modal: newProps.visible
        })
    }

    addSound = () => {
        var newSounds = [...this.state.soundsLike]
        if (newSounds.length < 5) {
            newSounds.push('')
        }
        this.setState({
            soundsLike: newSounds
        })
    }

    cancel = (e) => {
        e.preventDefault()
        this.toggle()
    }

    add = (e) => {
        e.preventDefault()
        var self = this
        var word = ReactDOM.findDOMNode(this.refs.word).value

        var sounds_like = []
        for (var i in this.state.soundsLike) {
            var sound = ReactDOM.findDOMNode(this.refs['sounds_like' + i]).value
            if (sound != '') {
                sounds_like.push(ReactDOM.findDOMNode(this.refs['sounds_like' + i]).value)
            }
        }

        var req = request.post('/api/add_word')

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        req.query({
            customization_id: this.props.customizationID,
            word: word
        })

        req.send({ sounds_like: sounds_like })

        var self = this
        req.end((err, res) => {
            self.props.done()
            self.toggle()
        })
    }

    toggle = () => {
        this.setState({
            modal: !this.state.modal,
            soundsLike: []
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
                                ref='word'
                                className='form-control'
                                type='text'
                                placeholder='word'/>
                            {this.state.soundsLike.map((c, i) => {
                                return (
                                    <input
                                        style={{marginBottom: '12px'}}
                                        key={i}
                                        ref={'sounds_like' + i}
                                        className='form-control'
                                        type='text'
                                        placeholder='pronunciation'/>
                                )
                            })}
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter style={{textAlign: 'right'}}>
                    <Button onClick={this.addSound} text={'Add sound'} style={{position: 'absolute', left:'15px'}}/>
                    <Button onClick={this.cancel} text={'Cancel'} style={{marginRight: '20px'}}/>
                    <Button onClick={this.add} kind={'bold'} text={'Create'}/>
                </ModalFooter>
            </Modal>
        )
    }
}
