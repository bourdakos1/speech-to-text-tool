import React from 'react'
import request from 'superagent'

import TitleBar from './TitleBar'

export default class Base extends React.Component {
    render() {
        return (
            <div>
                <TitleBar showModal={this.props.showModal}/>
                <div id={'page-content-wrapper'}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
