import React from 'react'
import request from 'superagent'
import Radium from 'radium'
import StackGrid from 'react-stack-grid'

import ModelDetail from './ModelDetail'
import Button from './Button'
import Strings from './Strings'

@Radium
export default class Models extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            models: []
        }
    }

    reloadTraining = (timeout) => {
        var self = this
        if (this.state.training != null && this.state.training.length > 0) {
            setTimeout(() => {
                self.loadModels()
            }, timeout * 1000)
        }
    }

    loadModels = () => {
        var self = this
        var req = request.post('/api/list_models')

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })

        req.end((err, res) => {
            var training = []
            var models = []

            if (res.body == null) {
                alert(Strings.generic_error)
            } else if (res.body.error != null) {
                alert(res.body.error)
            } else {
                models = res.body.customizations
                models.sort((a, b) => {
                    return new Date(b.created) - new Date(a.created)
                })
                models.push({name: 'en-US_BroadbandModel', status: 'available'})
            }

            for (var i in models) {
                // Maybe do this for pending too, but pending may never be ready
                if (models[i].status == 'training') {
                    training.push(models[i].customization_id)
                }
            }

            self.setState({ models: models, training: training }, () => {
                if (this.state.training != null) {
                    self.reloadTraining(30)
                }
            })
        })
    }

    createModel = () => {
        var name = prompt("Please choose a name for your model", "My Custom Model")
        if (name) {
            var self = this
            var req = request.post('/api/create_model')

            req.query({ username: localStorage.getItem('username') })
            req.query({ password: localStorage.getItem('password') })

            req.query({ name: name })

            req.end((err, res) => {
                self.props.history.push('/update_model/' + res.body.customization_id)
            })
        }
    }

    reDraw = () => {
        this.forceUpdate()
    }

    componentDidMount() {
        this.loadModels()
    }

    componentWillReceiveProps(newProps) {
        this.loadModels()
    }

    render() {
        var self = this
        return (
            <div>
                <Button
                    style={{margin: '21px 0px'}}
                    id='button--classifiers--create'
                    text={Strings.create_classifier}
                    kind={'bold'}
                    icon={'/btn_create.png'}
                    onClick={this.createModel}/>

                <StackGrid
                    style={{marginLeft: '-10px', marginRight: '-10px'}}
                    columnWidth={300}
                    gutterWidth={50}>
                    {this.state.models.map((c) => {
                        return (
                            <ModelDetail
                                history={self.props.history}
                                customizationID={c.customization_id}
                                name={c.name}
                                status={c.status}
                                reDraw={self.reDraw}
                                key={c.customization_id || c.name}/>
                        )
                    })}
                </StackGrid>
            </div>
        )
    }
}
