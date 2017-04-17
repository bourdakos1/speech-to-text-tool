import React from 'react'
import Radium, {Style} from 'radium'

import Styles from './Styles'

@Radium
export default class TitleCard extends React.Component {
    render() {
        var cardStyle = {
            width: '100%',
            borderRadius: '5px',
            borderColor: '#dedede',
            borderWidth: 'thin',
            borderStyle: 'solid',
            background: 'white',
        }

        var container = {
            padding: '12px',
        }

        var text = {
            base: {
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #dedede',
                outline: 'none',
                width: '100%',
                padding: '10px',
                paddingRight: '45px',
                ':focus': {
                    borderBottom: `1px solid ${Styles.colorPrimary}`,
                }
            },
            error: {
                borderBottom: '2px solid #F44336',
            }
        }

        var optional = {
            font: Styles.fontDefault,
            color: '#9e9e9e',
        }

        return (
            <div id={this.props.id} style={[cardStyle, this.props.style]}>
                <div style={[text.base, this.props.inputStyle, {wordWrap: 'break-word'}]}>
                    {this.props.title}
                </div>
                <div style={[container, this.props.containerStyle]}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
