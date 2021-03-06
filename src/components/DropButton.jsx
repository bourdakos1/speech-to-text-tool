import React from 'react'
import Dropzone from 'react-dropzone'
import Radium, { StyleRoot } from 'radium'

import Styles from './Styles'
import Strings from './Strings'


@Radium
export default class DropButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            files: [],
            progress: 0,
            opacity: 0,
            hover: false,
            clearHover: false
         }
    }

    onDrop = (files, rejects) => {
        var self = this
        this.setState({ files: files }, () => {
            this.props.onDrop(this.state.files, rejects, () => {
                self.setState({ files: [] })
                setTimeout(() => {
                    self.setState({ opacity: 0 })
                    setTimeout(() => {
                        self.setState({ progress: 0 })
                    }, 500)
                }, 500)
            }, (p) => {
                self.setState({ progress: p, opacity: 1 })
            })
        })
        this.setState({hover: true, clearHover: false})
    }

    onOpenClick = () => {
        this.refs.dropzone.open()
        this.setState({hover: true, clearHover: false})
    }

    isHover = () => {
        this.setState({hover: true})
    }

    notHover = () => {
        this.setState({hover: false, clearHover: false})
    }

    isClearHover = () => {
        this.setState({clearHover: true})
    }

    notClearHover = () => {
        this.setState({clearHover: false})
    }

    clear = (e) => {
        e.stopPropagation()
        this.props.onDrop(null)
        this.setState({
            files: [],
            progress: 0,
            opacity: 0,
            hover: false,
            clearHover: false
        })
    }

    render() {
        var textStyles = {
            base: {
                color: Styles.colorTextLight,
                font: Styles.fontDefault,
            },
            link: {
                color: Styles.colorPrimary,
            },
            header: {
                font: Styles.fontBold,
                marginTop: '3px',
                marginBottom: '7px',
                textAlign: 'center',
            },
            subheader: {
                textAlign: 'center',
                marginBottom: '3px',
            },
            uploading: {
                font: Styles.fontBold,
                display: 'inline-flex',
                verticalAlign: 'middle',
            },
            ellipsis: {
                /* Required for text-overflow to do anything */
                maxWidth: '200px',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
            },
            clip: {
                /* Required for text-overflow to do anything */
                maxWidth: '140px',
                textOverflow: 'clip',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
            }
        }

        if (this.state.hover) {
            textStyles.link.textDecoration = 'underline'
        } else {
            textStyles.link.textDecoration = 'none'
        }

        const RGB = Styles.colorPrimary
        const A = '0.2'
        const RGBA = 'rgba('+parseInt(RGB.substring(1,3),16)+','+parseInt(RGB.substring(3,5),16)+','+parseInt(RGB.substring(5,7),16)+','+A+')'


        // Tempory fix of setting the maxHeight
        var dropzoneStyle = {
            position: 'relative',
            width: '100%',
            cursor: 'pointer',
            alignSelf: 'center',
            borderRadius: '5px',
            borderColor: '#959595',
            borderWidth: 'thin',
            borderStyle: 'dashed',
            background:  '#fcfcfc',
            padding: '25px 0px',
            maxHeight: '135px',
        }

        ////////////////////////////////////////////////////////////////////////
        // Polyfill
        ////////////////////////////////////////////////////////////////////////
        if (typeof Object.assign != 'function') {
            Object.assign = (target) => {
                'use strict'
                if (target == null) {
                    throw new TypeError('Cannot convert undefined or null to object')
                }

                target = Object(target)
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index]
                    if (source != null) {
                        for (var key in source) {
                            if (Object.prototype.hasOwnProperty.call(source, key)) {
                                target[key] = source[key]
                            }
                        }
                    }
                }
                return target
            }
        }
        ////////////////////////////////////////////////////////////////////////

        dropzoneStyle = Object.assign(dropzoneStyle, this.props.dropzoneStyle)

        if (this.props.errors && this.state.files.length == 0) {
            dropzoneStyle = Object.assign(dropzoneStyle, {
                borderColor: '#F44336',
                background:  '#feeceb',
            })
        }

        var imgStyle = {
            display: 'flex',
            margin: 'auto',
            maxHeight: '100%',
            maxWidth: '100%',
        }

        var containerStyles = {
            base: {
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
            },
            image: {
                width: '45px',
                height: '45px',
                border: '1px solid #dedede',
                marginRight: '10px',
            }
        }
        var cover = {
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${this.state.progress}%`,
            height: '100%',
            backgroundColor: RGBA,
            transition: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            borderRadius: '2px',
            opacity: this.state.opacity
        }

        var opacityKeyframes = Radium.keyframes({
            '0%': {opacity: '.2'},
            '20%': {opacity: '1'},
            '80%': {opacity: '1'},
            '100%': {opacity: '.2'},
        }, 'opacity')

        var dot = {
            animationName: opacityKeyframes,
            animationDuration: '1.4s',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
        }

        var two = {
            animationDelay: '.2s',
        }

        var three = {
            animationDelay: '.4s',
        }

        var deleteStyle = {
            position: 'absolute',
            top: '5px',
            right: '5px',
            backgroundColor: 'transparent',
            backgroundImage: `url(${'/btn_delete.png'})`,
            height: '25px',
            width: '25px',
            backgroundPosition: '0 0',
            backgroundSize: '75px 25px',
            backgroundRepeat: 'no-repeat',
            border: 'none',
            ':active': {
                backgroundPosition: '-50px 0',
            }
        }

        if (this.state.clearHover) {
            deleteStyle.backgroundPosition = '-25px 0'
        } else {
            deleteStyle.backgroundPosition = '0 0'
        }

        return (
            <div style={this.props.style}>
            {this.props.disabled ?
                <div id={this.props.id} style={[dropzoneStyle, {opacity: '0.4', cursor: 'default'}]}>
                    <div style={[textStyles.base, textStyles.header]}>
                        {this.props.text}
                    </div>
                    <div style={[textStyles.base, textStyles.subheader]}>
                        Or <span style={[textStyles.base, textStyles.link]}>{this.props.subtext}</span>
                    </div>
                </div>
                :
                <Dropzone ref={'dropzone'}
                    className={this.props.className}
                    id={this.props.id}
                    accept={this.props.accept}
                    maxSize={this.props.maxSize}
                    onDrop={this.onDrop}
                    multiple={false}
                    style={dropzoneStyle}
                    onMouseEnter={this.isHover}
                    onMouseLeave={this.notHover}>
                    {this.state.files.length > 0 ?
                        <div style={containerStyles.base}>
                            {this.state.hover && this.props.clear ?
                                <button style={deleteStyle}
                                    onMouseEnter={this.isClearHover}
                                    onMouseLeave={this.notClearHover}
                                    onClick={this.clear}>
                                </button> :
                                null
                            }
                            {this.state.files.map((file) => <div key={file.name} style={[containerStyles.base, containerStyles.image]}><img style={imgStyle} src={file.preview}/></div> )}
                            {this.props.upload ?
                                <div id={'loading-ellipsis'} style={[textStyles.base, textStyles.uploading]}>
                                    <div style={[textStyles.clip, this.props.clip]}>{Strings.uploading + this.state.files[this.state.files.length - 1].name}</div>
                                    <StyleRoot>
                                        <span style={dot}>.</span>
                                        <span style={[dot, two]}>.</span>
                                        <span style={[dot, three]}>.</span>
                                    </StyleRoot>
                                </div> :
                                <div id={'loading-ellipsis'} style={[textStyles.base, textStyles.uploading]}>
                                    <div style={textStyles.ellipsis}>{this.state.files[this.state.files.length - 1].name}</div>
                                </div>
                            }
                        </div> :
                        <div>
                            <div style={[textStyles.base, textStyles.header]}>
                                {this.props.text}
                            </div>
                            <div style={[textStyles.base, textStyles.subheader]}>
                                {Strings.or} <span style={[textStyles.base, textStyles.link]}>{this.props.subtext}</span>
                            </div>
                        </div>
                    }
                    <div style={cover}></div>
                </Dropzone>
            }
            </div>
        )
    }
}
