import React from 'react'
import Radium from 'radium'

import Styles from './Styles'

@Radium
export default class SearchBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
    }

    hideDropdown = () => {
        this.setState({
            showDropdown: false
        })
    }

    showDropdown = () => {
        this.setState({
            showDropdown: true
        })
    }

    clearValue = () => {
        this.setState({
            value: ''
        })
        this.searchChanged('')
    }

    handleChange = (event) => {
        this.setState({
            value: event.target.value
        })
        this.searchChanged(event.target.value)
    }

    setCorpus = (e) => {
        this.setState({
            value: 'corpus:' + e.target.id + ' '
        })
        this.searchChanged('corpus:' + e.target.id + ' ')
        this.hideDropdown()
    }

    searchChanged = (val) => {
        this.props.setSearch(val)
    }

    render() {
        var search = {
            backgroundColor: 'white',
            lineHeight: '0px',
            alignSelf: 'center',
            borderRadius: '2px',
            marginBottom: '20px',
            border: 'none',
            height: '52px',
            width: '100%',
            font: Styles.fontHeader,
            fontWeight: 'normal',
            padding: '0px 22px 0px 22px',
            color: Styles.colorTextDark,
            boxShadow: '0 2px 2px 0px rgba(0,0,0,.15), 0 0 0 1px rgba(0,0,0,.08)',
            transition: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            zIndex: '10',

            ':hover': {
                boxShadow: '0 3px 9px 0px rgba(0,0,0,.2), 0 0 0 1px rgba(0,0,0,.08)',
                transition: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            },
            ':focus': {
                outline: 'none',
            }
        }

        var deleteStyle = {
            position: 'absolute',
            top: '13.5px',
            right: '13.5px',
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

        var dropdown = {
            position: 'relative',
        }

        var dropdownContent = {
            borderRadius: '0 0 5px 5px',
            display: 'none',
            position: 'absolute',
            top: '52px',
            left: '0px',
            right: '0px',
            backgroundColor: 'white',
            boxShadow: '0 0 0 1pt rgba(0,0,0,0.08), 0px 8px 16px 0px rgba(0,0,0,0.2)',
            zIndex: '9',
        }

        var aStyle = {
            font: Styles.fontDefault,
            color: Styles.colorTextDark,
            padding: '12px 16px',
            textDecoration: 'none',
            display: 'block',
            ':hover': {
                backgroundColor: '#f9f9f9'
            }
        }

        var last = {
            borderRadius: '0 0 5px 5px',
        }

        if (this.state.showDropdown) {
            dropdownContent.display = 'block'
        }

        var self = this
        return (
            <div
                style={dropdown}
                onMouseLeave={this.hideDropdown}>

                {this.state.value != '' ?
                    <button
                        key={'button'}
                        style={deleteStyle}
                        onClick={this.clearValue}>
                    </button> :
                    null
                }

                <input
                    value={this.state.value}
                    onClick={this.showDropdown}
                    onChange={this.handleChange}
                    style={[search, this.props.style]}
                    type={'text'}
                    placeholder={'Search'} />
                {this.state.showDropdown ?
                    <div style={dropdownContent}>
                        {this.props.corpora.map((corpus, i) => {
                            return(
                                <div
                                    id={corpus.name}
                                    key={corpus.name}
                                    style={i == (self.props.corpora.length - 1) ? [aStyle, last] : aStyle}
                                    onClick={self.setCorpus}>
                                    {corpus.name}
                                </div>
                            )
                        })}
                    </div> :
                    null
                }
            </div>
        )
    }
}
