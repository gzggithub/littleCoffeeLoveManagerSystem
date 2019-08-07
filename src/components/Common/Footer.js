import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import AppHome from './AppHome/AppHome';
import BackUserManage from './BackUserManage/BackUserManage';

import {
    Layout,
    Menu,
    Popconfirm,
    Input,
    message,
    Button,
    Modal,
    Form
} from 'antd';
import * as config from '../config';
import * as common from '../config/common';

const {Header, Footer} = Layout;
const FormItem = Form.Item;

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentWillMount() {}

    componentWillReceiveProps(nextProps) {}

    render() {
        return (
            <Footer className="footer">
                <div className="version-infor">Copyright © www.taoerxue.com, All Rights Reserved.</div>
                <div className="version-infor">浙江淘儿学教育科技有限公司</div>
            </Footer>
        )
    }
}

export default Home;