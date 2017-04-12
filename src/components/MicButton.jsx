import React from 'react'
import Radium, { StyleRoot } from 'radium'

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
        this.setState({listening: !this.state.listening})
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
