import React from 'react'
import Radium from 'radium'
import request from 'superagent'
import { List, AutoSizer } from 'react-virtualized'

import Styles from './Styles'
import Strings from './Strings'
import TitleCard from './TitleCard'
import Button from './Button'
import Class from './Class'
import ProgressModal from './ProgressModal'
import Base from './Base'

var myNum = 1
var time = 0

@Radium
export default class UpdateModel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            classifierName: 'hiya',
            words: [
                // {
                //     word: 'word',
                //     display: 'display as',
                //     soundsLike: ['sounds like', 'sounds like'],
                //     source: [],
                //     count: 1,
                //     id: 0
                // }
            ],
            errors: false,
            upload: false,
            search: '',
        }
    }

    loadClassifiersFromServer = () => {
        var self = this
        var newWords = $.extend([], this.state.words)
        var req = request.post('/api/list_words')

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        req.query({ customization_id: this.props.match.params.customizationID })

        req.end(function(err, res) {
            if (err != null) {
                console.error('Server error')
            }
            if (res.body != null) {
                res.body.words.map(function(c) {
                    newWords.push({
                        word: c.word,
                        display: c.display_as,
                        soundsLike: c.sounds_like,
                        source: c.source,
                        count: c.count,
                        id: myNum
                    })
                    myNum++
                })
            }
            self.setState({words: newWords})
        })
    }

    componentDidMount() {
        this.loadClassifiersFromServer()
        this.forceUpdate()
    }

    rowRenderer = (item) => {
        var self = this
        return (
            <Class
                style={{margin: '20px'}, item.style}
                errors={this.state.errors}
                title={this.state.words.filter(function(element) {
                    if (self.state.search == '') {
                        return true
                    }
                    if (element.word.toLowerCase().includes(self.state.search.toLowerCase())) {
                        return true
                    }
                    return false
                })[item.index].word}
                fixedTitle={true}
                id={item.key}
                key={item.key}/>
        )
    }

    onTextChange = (text) => {
        this.setState({ search: text.target.value })
    }

    cancel = () => {
        this.props.history.push('/')
    }

    //
    // setClassFile = (file, key) => {
    //     var newClasses = $.extend([], this.state.classes)
    //     newClasses[key].file = file
    //     this.setState({ classes: newClasses })
    // }
    //
    // setClassName = (text, key) => {
    //     var newClasses = $.extend([], this.state.classes)
    //     newClasses[key].name = text.target.value
    //     this.setState({ classes: newClasses })
    // }
    //
    // deleteClass = (key) => {
    //     var newClasses = $.extend([], this.state.classes)
    //     newClasses.splice(key, 1)
    //     this.setState({classes: newClasses})
    // }
    //
    // errorCheck = () => {
    //     var self = this
    //     self.setState({errors: false, error: null}, function() {
    //         var errors = this.state.errors
    //         var validClasses = 0
    //
    //         var totalbytes = 0
    //         this.state.classes.map(function(c) {
    //             if (c.file != null) {
    //                 totalbytes += c.file[0].size
    //             }
    //
    //             if (c.negative || c.defaultClass) {
    //                  if (c.file != null) {
    //                      validClasses++
    //                  }
    //                  return
    //             }
    //             if (c.name == null || c.name == '') {
    //                 errors = true
    //                 self.setState({errors: errors})
    //                 return
    //             }
    //             if (c.file == null) {
    //                 errors = true
    //                 self.setState({errors: errors})
    //                 return
    //             }
    //             validClasses++
    //         })
    //
    //         var error = null
    //
    //         var dupes = {}
    //         var classCount = 0
    //         this.state.classes.map(function(c) {
    //             if (c.name != null && c.name != '') {
    //                 dupes[c.name] = 1
    //                 classCount++
    //                 if (/[*\\|{}$/'`"\-]/.test(c.name)) {
    //                     errors = true
    //                     var invalidChars = c.name.match(/[*\\|{}$/'`"\-]/g)
    //                     error = Strings.invalid_chars_error + invalidChars.join(' ')
    //                     self.setState({errors: errors, error: error})
    //                 }
    //             }
    //         })
    //         console.log(Object.keys(dupes).length + ' / ' + classCount)
    //         if (Object.keys(dupes).length < classCount) {
    //             errors = true
    //             error = Strings.conflicting_class_name_error
    //             self.setState({errors: errors, error: error})
    //             return
    //         }
    //
    //         console.log('total size: ' + totalbytes / (1000 * 1000) + 'MB')
    //         console.log('valid: ' + validClasses)
    //
    //         if (totalbytes / (1000 * 1000) > 256) {
    //             errors = true
    //             error = Strings.mb250_error
    //             self.setState({errors: errors, error: error})
    //             return
    //         }
    //
    //         if (validClasses < 1) {
    //             errors = true
    //             error = Strings.modify_class
    //             self.setState({errors: errors})
    //             return
    //         }
    //
    //         if (!errors) {
    //             self.setState({upload: true})
    //         }
    //     })
    // }
    //
    // // This is kind of messy but helps show progress faster
    // create = (onProgress, onFinished) => {
    //     var req = request.post('/api/update_classifier')
    //     var self = this
    //
    //     this.state.classes.map(function(c) {
    //         if (c.file != null) {
    //             name = c.name
    //             if (c.negative) {
    //                 name = 'NEGATIVE_EXAMPLES'
    //             }
    //             req.attach('files', c.file[0], name)
    //         }
    //     })
    //
    //     req.query({ api_key: localStorage.getItem('apiKey') })
    //
    //     req.query({ classifier_id: this.props.match.params.classifierID })
    //
    //     req.on('progress', function(e) {
    //         if (e.direction == 'upload') {
    //             console.log(e.percent)
    //             onProgress(e.percent)
    //         }
    //     })
    //
    //     req.then(function(res, err) {
    //         console.log(res)
    //         if (res.body == null) {
    //             alert(Strings.generic_error);
    //         } else if (res.body.error != null) {
    //             alert(res.body.error);
    //         }
    //         onFinished()
    //         self.setState({upload: false})
    //         self.props.history.push('/')
    //     })
    // }
    //
    // addClass = (e) => {
    //   var newClasses = $.extend([], this.state.classes)
    //   newClasses.push({
    //     name: "",
    //     file: null,
    //     id: myNum
    //   })
    //   myNum++
    //   this.setState({classes: newClasses})
    // }

    render() {
        var textStyles = {
            base: {
                color: Styles.colorTextLight,
                font: Styles.fontDefault,
            },
            header: {
                color: Styles.colorTextDark,
                font: Styles.fontHeader,
            }
        }

        var margin = {
            marginTop: '5px',
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

        var self = this
        return (
            <div>
                <div style={[textStyles.header, {marginTop: '30px', marginBottom: '5px'}]}>
                    {Strings.update_classifier}
                </div>
                <div style={[textStyles.base, {marginTop: '5px', marginBottom: '18px'}]}>
                    {Strings.create_classifier_description}
                </div>
                <TitleCard
                    errors={self.state.errors}
                    placeholder='Classifier name'
                    title={self.state.classifierName}
                    fixedTitle={true}
                    onChange={this.onTextChange}
                    inputStyle={textStyles.header}>

                    <input type='text'
                        id={'638tq7dhiuowiju8qw'}
                        placeholder={'search'}
                        onChange={this.onTextChange} />

                    {self.state.error ? <div style={error}>{self.state.error}</div> : null}
                    <AutoSizer disableHeight>
                        {({ width }) => (
                            <List
                                style={{marginTop: '10px', marginBottom: '40px'}}
                                width={width}
                                height={350}
                                overscanRowCount={10}
                                rowCount={this.state.words.filter(function(element) {
                                    if (self.state.search == '') {
                                        return true
                                    }
                                    if (element.word.toLowerCase().includes(self.state.search.toLowerCase())) {
                                        return true
                                    }
                                    return false
                                }).length}
                                rowHeight={80}
                                rowRenderer={this.rowRenderer} />
                        )}
                    </AutoSizer>

                    <div style={{textAlign: 'right'}}>
                        <Button onClick={this.addClass} text={Strings.add_class} style={{float: 'left'}}/>
                        <Button onClick={this.cancel} text={Strings.cancel} style={{marginRight: '20px'}}/>
                        <Button onClick={this.errorCheck} text={Strings.update} kind='bold'/>
                    </div>
                </TitleCard>
                {this.state.upload ?
                    <ProgressModal
                        title={Strings.updating_classifier} load={this.create}/>
                    : null
                }
            </div>
        )
    }
}
