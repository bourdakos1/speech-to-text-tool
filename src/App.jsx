import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter, IndexRoute } from 'react-router-dom'

import Base from './components/Base'
import Models from './components/Models'
import CreateModel from './components/CreateModel'
import UpdateModel from './components/UpdateModel'
import CredentialsModal from './components/CredentialsModal'
import LandingPage from './components/LandingPage'

// This is the base of the App
// It holds our "Base" component which is just a TitleBar and content
// Depending on the path; the "Models", "CreateModel" or "UpdateModel" component
// are shown.
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {showModal: false}
    }

    // Our two points of entry (CredentialsModal/LandingPage) should give us
    // valid credentials or null.
    setApiKey = (key) => {
        localStorage.setItem('apiKey', key)
        this.props.reloadServerData()
    }

    showModal = () => {
        this.setState({
            showModal: true
        })
    }

    hideModal = () => {
        this.setState({
            showModal: false
        })
    }

    render() {
        return (
            <BrowserRouter>
                {localStorage.getItem('apiKey') == 'undefined'
                    || localStorage.getItem('apiKey') == null
                    || localStorage.getItem('apiKey') == '' ?
                    <LandingPage setApiKey={this.setApiKey}/> :
                    <Base showModal={this.showModal}>
                        <Route exact path="/" render={routeProps =>
                            <Models {...routeProps} someProp={100}/>
                        }/>
                        <Route exact path="/create_model" render={routeProps =>
                            <CreateModel {...routeProps}/>
                        }/>
                        <Route exact path="/update_model/:classifierID" render={routeProps =>
                            <UpdateModel {...routeProps}/>
                        }/>
                        <CredentialsModal
                            visible={this.state.showModal}
                            setApiKey={this.setApiKey}/>
                    </Base>
                }
            </BrowserRouter>
        )
    }
}

// This takes our app and injects it into the "main" element in index.html
ReactDOM.render(
    <App />, document.getElementById("main")
)
