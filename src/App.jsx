import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter, IndexRoute } from 'react-router-dom'

import Base from './components/Base'
import Classifiers from './components/Classifiers'
import CreateClassifier from './components/CreateClassifier'
import UpdateClassifier from './components/UpdateClassifier'

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    {/*Classifiers*/}
                    <Route exact path="/" component={Classifiers}/>
                    <Route path="/create_classifier" component={CreateClassifier}/>
                    <Route path="/update_classifier/:classifierID" component={UpdateClassifier}/>
                </div>
            </BrowserRouter>
        )
    }
}

ReactDOM.render(
    <App />, document.getElementById("main")
)
