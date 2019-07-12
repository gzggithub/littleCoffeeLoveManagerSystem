import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route
} from 'react-router-dom';
import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';

class App extends Component {
    render() {
        return (
            <LocaleProvider locale={zh_CN}>
                <Router>
                    <div className="App">
                        <Route exact path="/" component={Login}/>
                        <Route path="/index" component={Home}/>
                    </div>
                </Router>
            </LocaleProvider>
        );
    }
}

export default App;
