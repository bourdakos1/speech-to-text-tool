import React from 'react'
import Radium from 'radium'

import Styles from './Styles'
import Strings from './Strings'

@Radium
export default class Word extends React.Component {

    render() {
        var styles = {
            // this is where styles go
        }

        return (
            <div>{this.props.corpus.name} : {this.props.corpus.status}</div>
        )
    }
}
