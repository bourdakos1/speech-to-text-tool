import React from 'react'
import request from 'superagent'
import Radium from 'radium'
import { Tooltip } from 'reactstrap'
import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone'

import Styles from './Styles'
import Strings from './Strings'
import Transcript from './Transcript'
import MicButton from './MicButton'
import DropButton from './DropButton'
import Card from './Card'
import DropDown from './DropDown'

@Radium
export default class ModelDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tooltipOpen: false,
            transcript: []
        }
    }

    toggle = () => {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    stateChanged = () => {
        this.setState({
            tooltipOpen: false
        })
        this.props.reDraw()
    }

    deleteClassifier = (e) => {
        e.preventDefault()
        if (confirm('Delete ' + this.props.name + '?') == true) {
            var req = request.post('/api/delete_model')
            var self = this
            req.query({customization_id: this.props.customizationID})
            req.query({username: localStorage.getItem('username')})
            req.query({password: localStorage.getItem('password')})
            req.end((err, res) => {
                if (res.body.error != null) {
                    alert(res.body.error)
                }
                self.props.history.push('/')
            })
        }
    }

    updateClassifier = (e) => {
        e.preventDefault()
        this.props.history.push('/update_model/'+this.props.customizationID)
    }

    onDrop = (files, rejects, onFinished, onProgress) => {
        var self = this
        var req
        self.setState({ error: null }, self.stateChanged)
        if (files == null || files.length <= 0) {
            if (rejects != null && rejects[0].size > 200 * 1024 * 1024
                && (rejects[0].type == 'audio/wav'
                || rejects[0].type == 'audio/l16'
                || rejects[0].type == 'audio/ogg'
                || rejects[0].type == 'audio/flac')) {
                self.setState({ error: Strings.mb2_error }, self.stateChanged)
                return
            }
            self.setState({ error: Strings.invalid_image_error }, self.stateChanged)
            return
        }

        req = request.post('/api/transcribe')
        req.query({customization_id: this.props.customizationID})

        if (files[0]) {
            req.attach('file', files[0])
        }

        req.query({username: localStorage.getItem('username')})
        req.query({password: localStorage.getItem('password')})

        req.on('progress', (e) => {
            console.log(e.direction + ' Percentage done: ' + e.percent)
            if (e.direction == 'upload') {
                onProgress(e.percent / 2)
            } else if (e.direction == 'download') {
                if (e.percent < 100) {
                    onProgress(50 + e.percent / 2)
                }
            }
        })

        req.end((err, res) => {
            onProgress(100)
            console.log(res)
            var results = res.body.results[0].alternatives[0].transcript
            self.setState({ results: results }, self.stateChanged)
            onFinished()
        })
    }

    getResults = () => {
        const final = this.state.transcript.filter(r => r.results && r.results.length && r.results[0].final)
        const interim = this.state.transcript[this.state.transcript.length - 1]
        if (!(!interim || !interim.results || !interim.results.length || interim.results[0].final)) {
            final.push(interim)
        }

        var text = ''

        final.map(msg => {
            for (var i in msg.results) {
                text +=  msg.results[i].alternatives[0].transcript
            }
        }).reduce((a, b) => a.concat(b), [])

        return text
    }

    clearTransciption = () => {
        this.setState({ file: null, results: null, transcript: [] }, this.stateChanged)
    }

    onTransciption = (result) => {
        this.setState({transcript: this.state.transcript.concat(result)}, () => {
            this.setState({ results: this.getResults() }, this.stateChanged)
        })
    }

    clearClassifier = () => {
        this.setState({ file: null, results: null, transcript: [] }, this.stateChanged)
    }

    render() {
        var textStyle = {
            paddingTop: '5px',
            textDecoration:'none',
            display:'block',
            whiteSpace:'nowrap',
            overflow:'hidden',
            textOverflow:'ellipsis',
            color: Styles.colorTextLight,
            font: Styles.fontDefault,
        }

        var titleStyle = {
            textDecoration:'none',
            display:'block',
            whiteSpace:'nowrap',
            overflow:'hidden',
            textOverflow:'ellipsis',
            color: Styles.colorTextDark,
            font: Styles.fontHeader,
        }

        var status = {
            marginBottom: '-1px',
            marginRight: '5px',
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '5px',
        }

        var error = {
            paddingBottom: '10px',
            textDecoration:'none',
            display:'block',
            whiteSpace:'nowrap',
            overflow:'hidden',
            textOverflow:'ellipsis',
            color: '#F44336',
            font: Styles.fontDefault,
        }

        var color
        if (this.props.status == 'available') {
            color = '#64dd17'
        } else if (this.props.status == 'ready' || this.props.status == 'training'  || this.props.status == 'pending'){
            color = '#ffab00'
        } else {
            color = '#F44336'
        }

        return(
            <Card style={{maxWidth:'30rem'}}>
                {this.props.customizationID ?
                    <DropDown className='dropdown--classifier-detail' delete={this.deleteClassifier} update={this.updateClassifier}/>:
                    null
                }

                <div style={titleStyle}>{this.props.name}</div>
                <div style={textStyle}>{this.props.customizationID}</div>
                <div style={textStyle}><div style={[status, {background: color}]}/>{this.props.status == 'ready' ? <span>{'ready for training'}</span> : this.props.status}</div>

                {/*To soothe my pain*/}
                {this.props.customizationID ? null : <div style={{height: '1em', marginTop: '2px'}}></div>}

                <div style={{width: '100%', height:'20px'}}></div>
                {this.state.error ? <div id='error--classifier-detail' style={error}>{this.state.error}</div> : null}
                <div style={{width: '100%', display:'flex'}}>
                    {this.props.status == 'available' ?
                        <DropButton
                            style={{flex: '1'}}
                            id={this.props.customizationID || this.props.name}
                            className='dropzone--classifier-detail'
                            accept={'audio/wav, audio/l16, audio/ogg, audio/flac, .wav, .ogg, .opus, .flac'}
                            maxSize={200 * 1024 * 1024}
                            upload={true}
                            onDrop={this.onDrop}
                            text={Strings.drag_image}
                            subtext={Strings.choose_image} />
                        :
                        <DropButton
                            style={{flex: '1'}}
                            id={this.props.customizationID || this.props.name}
                            text={Strings.drag_image}
                            subtext={Strings.choose_image}
                            disabled={true}/>
                    }
                    {recognizeMicrophone.isSupported ?
                        <MicButton clearTransciption={this.clearTransciption} customizationID={this.props.customizationID} onTransciption={this.onTransciption} style={{marginLeft: '12px', width: '48px'}}/> :
                        null
                    }
                </div>
                {this.state.results ? <Transcript id={this.props.customizationID || this.props.name} clearClassifier={this.clearClassifier} file={this.state.file} results={this.state.results}/> : null}
            </Card>
        )
    }
}
