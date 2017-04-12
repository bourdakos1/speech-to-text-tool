import React from 'react'
import Radium from 'radium'
import request from 'superagent'
import StackGrid from 'react-stack-grid'

import Styles from './Styles'
import Strings from './Strings'
import TitleCard from './TitleCard'
import Button from './Button'
import Class from './Class'
import ProgressModal from './ProgressModal'
import Base from './Base'

var myNum = 0

@Radium
export default class CreateModel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            classifierName: '',
            classes: [
                {name: '', file: null, id: 0},
                {name: '', file: null, id: 1},
                {negative: true, file: null, id: 2},
            ],
            errors: false,
            upload: false,
        }
        myNum = this.state.classes.length
    }

    onTextChange = (text) => {
        this.setState({ classifierName: text.target.value })
    }

    setClassFile = (file, key) => {
        var newClasses = $.extend([], this.state.classes)
        newClasses[key].file = file
        this.setState({ classes: newClasses })
    }

    setClassName = (text, key) => {
        var newClasses = $.extend([], this.state.classes)
        newClasses[key].name = text.target.value
        this.setState({ classes: newClasses })
    }

    deleteClass = (key) => {
        var newClasses = $.extend([], this.state.classes)
        newClasses.splice(key, 1)
        this.setState({classes: newClasses})
    }

    cancel = () => {
        this.props.history.push('/')
    }

    errorCheck = () => {
        var self = this
        self.setState({errors: false, error: null, titleError: null}, function() {
            var titleError = null
            var errors = this.state.errors
            if (this.state.classifierName == null || this.state.classifierName == '') {
                errors = true
                titleError = Strings.classifier_name_required_error
                self.setState({errors: errors, titleError: titleError})
            } else if (/[*\\|{}$/'`"\-]/.test(this.state.classifierName)) {
                errors = true
                var invalidChars = this.state.classifierName.match(/[*\\|{}$/'`"\-]/g)
                titleError = Strings.invalid_chars_error + invalidChars.join(' ')
                self.setState({errors: errors, titleError: titleError})
            }

            var validClasses = 0
            var hasNeg = false

            var totalbytes = 0

            // State takes time, so we can just take a tally here
            this.state.classes.map(function(c) {
                if (c.file != null) {
                    totalbytes += c.file[0].size
                }
                if (c.negative) {
                     if (c.file != null) {
                         validClasses++
                         hasNeg = true
                     }
                     return
                }
                if (c.name == null || c.name == '') {
                    errors = true
                    self.setState({errors: errors})
                    return
                }
                if (c.file == null) {
                    errors = true
                    self.setState({errors: errors})
                    return
                }
                validClasses++
            })

            var error = null

            var dupes = {}
            var classCount = 0
            this.state.classes.map(function(c) {
                if (c.name != null && c.name != '') {
                    dupes[c.name] = 1
                    classCount++
                    if (/[*\\|{}$/'`"\-]/.test(c.name)) {
                        errors = true
                        var invalidChars = c.name.match(/[*\\|{}$/'`"\-]/g)
                        error = Strings.invalid_chars_error + invalidChars.join(' ')
                        self.setState({errors: errors, error: error})
                    }
                }
            })
            console.log(Object.keys(dupes).length + ' / ' + classCount)
            if (Object.keys(dupes).length < classCount) {
                errors = true
                error = Strings.conflicting_class_name_error
                self.setState({errors: errors, error: error})
                return
            }

            console.log('total size: ' + totalbytes / (1000 * 1000) + 'MB')
            console.log('valid: ' + validClasses)

            if (totalbytes / (1000 * 1000) > 256) {
                errors = true
                error = Strings.mb250_error
                self.setState({errors: errors, error: error})
                return
            }

            if (validClasses < 2) {
                errors = true
                if (hasNeg) {
                    error = Strings.add_class_error
                } else if (validClasses == 1) {
                    error = Strings.add_neg_or_class_error
                } else {
                    error = Strings.no_classes_error
                }
                self.setState({errors: errors, error: error})
                return
            }

            if (!errors) {
                self.setState({upload: true})
            }
        })
    }

    // This is kind of messy but helps show progress faster
    create = (onProgress, onFinished) => {
        var req = request.post('/api/create_classifier')
        var self = this

        this.state.classes.map(function(c) {
            if (c.file != null) {
                name = c.name
                if (c.negative) {
                    name = 'NEGATIVE_EXAMPLES'
                }
                req.attach('files', c.file[0], name)
            }
        })

        req.query({ api_key: localStorage.getItem('apiKey') })

        req.query({ name: this.state.classifierName })

        req.on('progress', function(e) {
            if (e.direction == 'upload') {
                console.log(e.percent)
                onProgress(e.percent)
            }
        })

        req.then(function(res, err) {
            console.log(res)
            if (res.body == null) {
                alert(Strings.generic_error);
            } else if (res.body.error != null) {
                alert(res.body.error);
            }
            onFinished()
            self.setState({upload: false}, function() {
                this.props.history.push('/')
            })
        })
    }

    addClass = (e) => {
      var newClasses = $.extend([], this.state.classes)
      newClasses.splice(newClasses.length - 1, 0, {
        name: "",
        file: null,
        id: myNum
      })
      myNum++
      this.setState({classes: newClasses})
    }

    reloadServerData = () => {
        this.forceUpdate()
    }

    render() {
        var textStyles = {
            base: {
                color: Styles.colorTextLight,
                font: Styles.fontDefault,
            },
            header: {
                color: Styles.colorTextDark,
                font: Styles.fontHeader,
            },
            title: {
                color: Styles.colorTextDark,
                font: Styles.fontTitle,
            }
        }

        var margin = {
            marginTop: '5px',
        }

        var titleError = {
            paddingBottom: '10px',
            textDecoration:'none',
            display:'block',
            whiteSpace:'nowrap',
            overflow:'hidden',
            textOverflow:'ellipsis',
            color: '#F44336',
            font: Styles.fontDefault,
        }

        var error = {
            paddingTop: '5px',
            paddingLeft: '10px',
            textDecoration:'none',
            display:'block',
            whiteSpace:'nowrap',
            overflow:'hidden',
            textOverflow:'ellipsis',
            color: '#F44336',
            font: Styles.fontDefault,
        }

        const RGB=Styles.colorPrimary
        const A='0.1'
        const RGBA='rgba('+parseInt(RGB.substring(1,3),16)+','+parseInt(RGB.substring(3,5),16)+','+parseInt(RGB.substring(5,7),16)+','+A+')'
        const A2='0.3'
        const RGBA2='rgba('+parseInt(RGB.substring(1,3),16)+','+parseInt(RGB.substring(3,5),16)+','+parseInt(RGB.substring(5,7),16)+','+A2+')'

        var self = this
        return (
            <Base reloadServerData={this.reloadServerData}>
                <div id='create-classifier'>
                    <div style={[textStyles.header, {marginTop: '30px', marginBottom: '5px'}]}>
                        {Strings.create_classifier_title}
                    </div>
                    <div style={[textStyles.base, {marginTop: '5px', marginBottom: '18px'}]}>
                        {Strings.create_classifier_description}
                    </div>

                    {self.state.titleError ? <div id='error--create-classifier--title' style={titleError}>{self.state.titleError}</div> : null}
                    <TitleCard
                        inputId='input--create-classifier--classifier-name'
                        maxlength='30'
                        errors={self.state.errors}
                        placeholder={Strings.classifier_name}
                        title={self.state.classifierName}
                        onChange={this.onTextChange}
                        inputStyle={textStyles.title}>

                        <div style={[textStyles.header, {margin: '10px', marginTop: '0px', marginBottom: '5px'}]}>
                            {Strings.classes}
                        </div>
                        <div style={[textStyles.base, {margin: '10px', marginTop: '0px', marginBottom: '30px'}]}>
                            {Strings.classifier_requirements}
                        </div>
                        {self.state.error ? <div id='error--create-classifier--class' style={error}>{self.state.error}</div> : null}
                        <StackGrid className='gridz-are-real' columnWidth={292} gutterWidth={40} style={{marginTop: '10px'}}>{this.state.classes.map(function(c, i) {
                            return (
                                <Class
                                    inputClassName='input--create-classifier--class-name'
                                    dropzoneClassName='dropzone--create-classifier'
                                    errors={self.state.errors}
                                    negative={c.negative}
                                    title={c.name}
                                    style={{maxWidth:'30rem'}}
                                    key={c.id}
                                    id={i}
                                    setClassFile={self.setClassFile}
                                    setClassName={self.setClassName}
                                    delete={self.deleteClass}/>
                            )
                        })}</StackGrid>
                        <div style={{textAlign: 'right'}}>
                            <Button id='button--create-classifier--add-class' onClick={this.addClass} text={Strings.add_class} style={{float: 'left'}}/>
                            <Button id='button--create-classifier--cancel' onClick={this.cancel} text={Strings.cancel} style={{marginRight: '20px'}}/>
                            <Button id='button--create-classifier--create' onClick={this.errorCheck} text={Strings.create} kind='bold'/>
                        </div>
                    </TitleCard>
                    {this.state.upload ?
                        <ProgressModal
                            title={Strings.creating_classifier} load={this.create}/>
                        : null
                    }
                </div>
            </Base>
        )
    }
}