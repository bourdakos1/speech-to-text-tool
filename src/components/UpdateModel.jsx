import React from 'react'
import Radium from 'radium'
import request from 'superagent'
import { List, AutoSizer } from 'react-virtualized'

import Styles from './Styles'
import Strings from './Strings'
import TitleCard from './TitleCard'
import Button from './Button'
import Class from './Class'
import AddWordModal from './AddWordModal'
import Base from './Base'
import DropButton from './DropButton'

var wordCount = 1
var corpusCount = 0

@Radium
export default class UpdateModel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            words: [],
            corpora: [],
            addWord: false,
            errors: false,
            search: '',
            corporaFilter: '',
        }
    }

    loadWords = () => {
        var self = this
        var words = []
        var req = request.post('/api/list_words')

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        // req.query({ word_type: 'user' })
        req.query({ customization_id: this.props.match.params.customizationID })

        req.end(function(err, res) {
            if (err != null) {
                console.error('Server error')
            }
            if (res.body != null) {
                res.body.words.map(function(c) {
                    words.push({
                        word: c.word,
                        display: c.display_as,
                        soundsLike: c.sounds_like,
                        source: c.source,
                        count: c.count,
                        id: wordCount
                    })
                    wordCount++
                })
            }
            self.setState({words: words})
        })
    }

    loadCorpora = () => {
        var self = this
        var corpora = []
        var req = request.post('/api/list_corpora')

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        req.query({ customization_id: this.props.match.params.customizationID })

        req.end(function(err, res) {
            if (err != null) {
                console.error('Server error')
            }
            if (res.body != null) {
                res.body.corpora.map(function(c) {
                    corpora.push({
                        name: c.name,
                        outOfVocabularyWords: c.out_of_vocabulary_words,
                        totalWords: c.total_words,
                        status: c.status,
                        id: corpusCount
                    })
                    corpusCount++
                })
            }
            self.setState({corpora: corpora})
        })
    }

    loadDetails = () => {
        var self = this
        var req = request.post('/api/get_model')

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        req.query({ customization_id: this.props.match.params.customizationID })

        req.end(function(err, res) {
            if (err != null) {
                console.error('Server error')
            }
            if (res.body != null) {
                self.setState({name: res.body.name})
            }
        })
    }

    componentDidMount() {
        this.loadDetails()
        this.loadCorpora()
        this.loadWords()
        this.forceUpdate()
    }

    rowRenderer = (item) => {
        var self = this
        var title = this.state.words.filter(function(element) {
            if (self.state.search == '' && self.state.corporaFilter == '') {
                return true
            }
            if (element.source.indexOf(self.state.corporaFilter) > -1) {
                if (self.state.search == '') {
                    return true
                }
                if (element.word.toLowerCase().includes(self.state.search.toLowerCase())) {
                    return true
                }
            }
            if (self.state.corporaFilter == '' && element.word.toLowerCase().includes(self.state.search.toLowerCase())) {
                return true
            }
            return false
        })[item.index].word
        return (
            <Class
                style={{margin: '20px'}, item.style}
                errors={this.state.errors}
                title={title}
                fixedTitle={true}
                id={item.key}
                key={item.key}/>
        )
    }

    onTextChange = (text) => {
        this.setState({ search: text.target.value })
    }

    onDrop = (files, rejects, onFinished, onProgress) => {
        var self = this
        var req = request.post('/api/add_corpus')
        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        req.query({ customization_id: this.props.match.params.customizationID })

        if (files[0]) {
            req.attach('file', files[0])
        }
        req.query({ name: files[0].name })

        req.on('progress', function(e) {
            console.log(e.direction + ' Percentage done: ' + e.percent)
            if (e.direction == 'upload') {
                onProgress(e.percent / 2)
            } else if (e.direction == 'download') {
                if (e.percent < 100) {
                    onProgress(50 + e.percent / 2)
                }
            }
        })

        req.end(function(err, res) {
            onProgress(100)
            console.log(res)
            onFinished()
            if (res.body.error != null) {
                alert(res.body.error)
            }
            self.loadCorpora()
            self.loadWords()
        })
    }

    cancel = () => {
        this.props.history.push('/')
    }

    train = (onProgress, onFinished) => {
        var req = request.post('/api/train')
        var self = this

        req.query({ username: localStorage.getItem('username') })
        req.query({ password: localStorage.getItem('password') })
        req.query({ customization_id: this.props.match.params.customizationID })

        req.then(function(res, err) {
            console.log(res)
            if (res.body == null) {
                alert(Strings.generic_error);
            } else if (res.body.error != null) {
                alert(res.body.error);
            }
            self.props.history.push('/')
        })
    }

    filterUser = () => {
        this.setState({
            corporaFilter: 'user'
        })
    }

    filterAll = () => {
        this.setState({
            corporaFilter: ''
        })
    }

    showAddWordModal = () => {
        this.setState({
            addWord: true
        })
    }

    onHidden = () => {
        this.setState({
            addWord: false
        })
    }

    uploaded = () => {
        this.loadWords()
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

        var extraPadding = {
            padding: '44px 0',
        }

        var divider = {
            marginTop: '33px',
            height: '1px',
            width: 'auto',
            marginLeft: '-22px',
            marginRight: '-22px',
            backgroundColor: '#dedede',
        }

        var self = this
        var items = this.state.words.filter(function(element) {
            if (self.state.search == '' && self.state.corporaFilter == '') {
                return true
            }
            if (element.source.indexOf(self.state.corporaFilter) > -1) {
                if (self.state.search == '') {
                    return true
                }
                if (element.word.toLowerCase().includes(self.state.search.toLowerCase())) {
                    return true
                }
            }
            if (self.state.corporaFilter == '' && element.word.toLowerCase().includes(self.state.search.toLowerCase())) {
                return true
            }
            return false
        })
        return (
            <div style={{marginTop: '40px', marginBottom: '40px'}}>
                {/*<div style={[textStyles.header, {marginTop: '30px', marginBottom: '5px'}]}>
                    {Strings.update_classifier_title}
                </div>
                <div style={[textStyles.base, {marginTop: '5px', marginBottom: '18px'}]}>
                    {Strings.create_classifier_description}
                </div>*/}
                <TitleCard
                    containerStyle={{padding: '22px'}}
                    errors={self.state.errors}
                    title={this.state.name}
                    fixedTitle={true}
                    onChange={this.onTextChange}
                    inputStyle={textStyles.header}>

                    <div style={[textStyles.header, {marginTop: '0px', marginBottom: '5px'}]}>
                        Corpora
                    </div>
                    <div style={[textStyles.base, {marginTop: '0px', marginBottom: '30px'}]}>
                        You can upload a corpus and speech to text will extract new words within context.
                    </div>

                    <DropButton
                        maxSize={200 * 1024 * 1024}
                        dropzoneStyle={extraPadding}
                        accept={'text/plain'}
                        upload={true}
                        clip={{maxWidth: '500px'}}
                        errors={this.props.negative ? false : this.props.errors}
                        text={Strings.drag_zip}
                        subtext={Strings.choose_file}
                        onDrop={this.onDrop}/>

                    <div>
                        {this.state.corpora.map(function(corpus) {
                            return(
                                <div key={corpus.id}>{corpus.name} : {corpus.status}</div>
                            )
                        })}
                    </div>

                    <div style={divider}></div>

                    <div style={[textStyles.header, {marginTop: '30px', marginBottom: '5px'}]}>
                        Words
                    </div>
                    <div style={[textStyles.base, {marginTop: '0px', marginBottom: '30px'}]}>
                        Sounds like are variations of how people can pronounce the words.
                    </div>

                    <input type='text'
                        id={'638tq7dhiuowiju8qw'}
                        placeholder={'search'}
                        onChange={this.onTextChange} />
                    <button onClick={this.filterUser}>user</button>
                    <button onClick={this.filterAll}>all</button>

                    {self.state.error ? <div style={error}>{self.state.error}</div> : null}
                    <AutoSizer disableHeight>
                        {({ width }) => (
                            <List
                                style={{marginTop: '10px', marginBottom: '40px'}}
                                width={width}
                                height={items.length * 80 < 350? items.length * 80: 350}
                                overscanRowCount={10}
                                rowCount={items.length}
                                rowHeight={80}
                                rowRenderer={this.rowRenderer} />
                        )}
                    </AutoSizer>

                    <div style={{textAlign: 'right'}}>
                        <Button onClick={this.showAddWordModal} text={Strings.add_class} style={{float: 'left'}}/>
                        <Button onClick={this.cancel} text={Strings.cancel} style={{marginRight: '20px'}}/>
                        <Button onClick={this.train} text={Strings.train} kind='bold'/>
                    </div>
                </TitleCard>
                <AddWordModal visible={this.state.addWord} customizationID={this.props.match.params.customizationID} onHidden={this.onHidden} done={this.uploaded} />
            </div>
        )
    }
}
