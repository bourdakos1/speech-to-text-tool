import React from 'react'
import Radium, { StyleRoot } from 'radium'
import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone'
import request from 'superagent'

import Styles from './Styles'
import Strings from './Strings'

@Radium
export default class MicButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            listening: false
         }
    }

    hover = () => {
        this.setState({hover: true})
    }

    clearHover = () => {
        this.setState({hover: false})
    }

    startListening = () => {
        var self = this
        if (!this.state.listening) {
            self.setState({listening: true})
            this.props.clearTransciption()
            var req = request.post('/api/token')

            req.query({username: localStorage.getItem('username')})
            req.query({password: localStorage.getItem('password')})

            req.end(function(err, res) {
                if (self.stream) {
                    self.stream.stop()
                    self.stream.removeAllListeners()
                    self.stream.recognizeStream.removeAllListeners()
                }

                if (self.props.customizationID) {
                    self.stream = recognizeMicrophone({
                        token: res.body.token,
                        smart_formatting: true, // formats phone numbers, currency, etc. (server-side)
                        format: true, // adds capitals, periods, and a few other things (client-side)
                        model: 'en-US_BroadbandModel',
                        customization_id: self.props.customizationID,
                        objectMode: true,
                        interim_results: true,
                        continuous: true
                    })
                } else {
                    self.stream = recognizeMicrophone({
                        token: res.body.token,
                        smart_formatting: true, // formats phone numbers, currency, etc. (server-side)
                        format: true, // adds capitals, periods, and a few other things (client-side)
                        model: 'en-US_BroadbandModel',
                        objectMode: true,
                        interim_results: true,
                        continuous: true
                    })
                }

                // grab the formatted messages and also handle errors and such
                self.stream.on('data', (msg) => {
                    self.props.onTransciption(msg)
                }).on('end', (msg) => {
                    console.log('end: ' + msg)
                    self.stream && self.stream.stop()
                    self.setState({listening: false})
                }).on('error', (msg) => {
                    console.error(msg)
                    self.stream && self.stream.stop()
                    self.setState({listening: false})
                })

                // when errors occur, the end event may not propagate through the helper streams.
                // However, the recognizeStream should always fire a end and close events
                self.stream.recognizeStream.on('end', () => {
                    self.stream && self.stream.stop()
                    self.setState({listening: false})
                })
            })
        } else {
            this.stream && this.stream.stop()
            this.setState({listening: false})
        }
    }

    render() {
        var micStyle = {
            cursor: 'pointer',
            borderRadius: '5px',
            borderColor: '#dedede',
            borderWidth: 'thin',
            borderStyle: 'solid',
            background:  'white',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }

        var micButtonStyle = {
            backgroundColor: 'transparent',
            backgroundImage: `url(${'/btn_mic.png'})`,
            height: '25px',
            width: '25px',
            backgroundPosition: '0 0',
            backgroundSize: '75px 25px',
            backgroundRepeat: 'no-repeat',
            border: 'none',
        }

        if (this.state.listening) {
            micButtonStyle.backgroundPosition = '-50px 0'
            micStyle.background = '#F44336'
            micStyle.borderColor = '#F44336'
        } else if (this.state.hover) {
            micButtonStyle.backgroundPosition = '-25px 0'
            micStyle.background = 'white'
            micStyle.borderColor = '#dedede'
        } else {
            micButtonStyle.backgroundPosition = '0 0'
            micStyle.background = 'white'
            micStyle.borderColor = '#dedede'
        }

        return (
            <div style={[micStyle, this.props.style]} onClick={this.startListening} onMouseEnter={this.hover} onMouseLeave={this.clearHover}>
                <button id='button--results--clear' style={micButtonStyle} />
            </div>
        )
    }
}
