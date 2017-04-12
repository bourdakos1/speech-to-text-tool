import React from 'react'
import ReactDOM from 'react-dom'
import Radium from 'radium'
import request from 'superagent'

import Button from './Button'
import Styles from './Styles'
import Strings from './Strings'

@Radium
export default class CredentialsModal extends React.Component {
    saveApiKey = (e) => {
        e.preventDefault()
        var self = this
        var username = ReactDOM.findDOMNode(this.refs.username).value
        var password = ReactDOM.findDOMNode(this.refs.password).value
        var modal = $(ReactDOM.findDOMNode(this))

        var req = request.post('/api/test_credentials')

        req.query({
            username: username,
            password: password
         })

        req.end(function(err, res) {
            if (res.body.valid) {
                modal.modal('hide')
                self.props.setCredentials(username, password)
            } else {
                self.setState({error: Strings.invalid_key})
            }
        })
    }

    logout = (e) => {
        e.preventDefault()
        $(ReactDOM.findDOMNode(this)).modal('hide')
        this.props.setCredentials('', '')
    }

    componentWillReceiveProps(newProps) {
        if (newProps.visible) {
            $(ReactDOM.findDOMNode(this)).modal('show')
            $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal)
        } else {
            $(ReactDOM.findDOMNode(this)).modal('hide')
        }
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
            <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <div style={{font: Styles.fontTitle, color: Styles.colorTextDark, display: 'inline-block'}}>{Strings.update_key}</div>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" style={deleteStyle}>
                    </button>
                  </div>
                  <div className="modal-body">
                      <p>{Strings.key_modal_description}</p>
                      <p><a href='https://console.ng.bluemix.net/catalog/services/speech-to-text/' target='_blank'>{Strings.sign_up}</a></p>
                      {this.state.error ? <p id='error--api-key-modal--api-key' style={error}>{this.state.error}</p> : null}
                      <form id="api-key-form" role="form" action="#">
                          <div className={this.state.error ? "form-group has-danger" : "form-group"}>
                              <input
                                  style={{marginBottom: '12px'}}
                                  id='input--api-key-modal--api-key'
                                  ref="username"
                                  className="form-control"
                                  type="text"
                                  placeholder="username"/>
                              <input
                                  ref="password"
                                  className="form-control"
                                  type="text"
                                  placeholder="password"/>
                          </div>
                      </form>
                  </div>
                  <div className="modal-footer" style={{textAlign: 'right'}}>
                      <Button id='button--api-key-modal--logout' onClick={this.logout} text={Strings.log_out} style={{marginRight: '20px'}}/>
                      <Button id='button--api-key-modal--submit' onClick={this.saveApiKey} kind={"bold"} text={Strings.save_key}/>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}
