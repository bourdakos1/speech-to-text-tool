import React from 'react'
import Radium from 'radium'

import Styles from './Styles'
import Strings from './Strings'
import TitleCard from './TitleCard'

@Radium
export default class Word extends React.Component {
    delete = () => {
        this.props.delete(this.props.word.word)
    }

    render() {
        var textStyles = {
            header: {
                color: Styles.colorTextDark,
                font: Styles.fontDefault,
                fontWeight: 'bold',
            }
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

        var deleteStyle = {
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
            <div style={this.props.style}>
                <TitleCard
                    title={this.props.word.word}
                    fixedTitle={true}
                    inputStyle={textStyles.header}>
                    <div style={{position: 'relative', width: '100%', minWidth: '100%'}}>
                        <div style={{position: 'absolute', top: '-43px', right: '0'}}>
                            <button
                                className={'delete-class'}
                                key={this.props.id}
                                style={deleteStyle}
                                onClick={this.delete}>
                            </button>
                        </div>
                    </div>

                    {this.props.word.soundsLike.map((c)=> {
                        return(
                            <div key={c}>{c}</div>
                        )
                    })}
                </TitleCard>
            </div>
        )
    }
}
