import React from 'react'
import Radium from 'radium'
import { Tooltip } from 'reactstrap'

import Styles from './Styles'
import Strings from './Strings'

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

@Radium
export default class Transcript extends React.Component {
    render(){
        var textStyles = {
            base: {
                color: Styles.colorTextLight,
                font: Styles.fontDefault,
            },
            dark: {
                color: Styles.colorTextDark,
            },
            topClass: {
                color: Styles.colorTextDark,
                font: Styles.fontHeader,
            },
            topScore: {
                color: Styles.colorTextLight,
                font: Styles.fontHeader,
                fontWeight: '200',
            },
        }

        var imgStyle = {
            height: 'auto',
            width: '100%',
            border: '1px solid #dedede',
            marginTop: '10px',
            borderRadius: '5px',
        }
        var textbox = {
            padding: '12px',
            height: 'auto',
            width: '100%',
        }

        var divider = {
            marginTop: '33px',
            height: '1px',
            width: '100%',
            backgroundColor: '#dedede',
        }

        var deleteStyle = {
            position: 'absolute',
            top: '5px',
            right: '5px',
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
        return (
            <div style={{position: 'relative'}}>
                <button id='button--results--clear' style={deleteStyle}
                    onClick={this.props.clearClassifier}>
                </button>
                <div style={imgStyle}>
                    <div style={divider}></div>
                    <div style={textbox}>
                        {this.props.results[0].results? this.props.results.map(msg => {
                            return msg.results.map((result, i) => (
                                <span key={`result-${msg.result_index + i}`}>{result.alternatives[0].transcript}</span>
                            ));
                        }).reduce((a, b) => a.concat(b), []): this.props.results}
                    </div>
                </div>
            </div>
        )
    }
}
