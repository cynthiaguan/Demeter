import React from "react";
import {loginStyle} from "./styles/login";
import {pageStyle} from "./styles/page";
import {connect} from "react-redux";
import {login} from "../actions/user";
import {Button, Checkbox, Form, Icon, Input} from "antd";
import FooterView from "../components/FooterView";
import {MSG_ACCOUNT, MSG_PASSWORD} from "../constants/stringConstant";
import {goToHomePage, goToModifyPasswordPage} from "../../util/router";
import {RES_SUCCEED} from "../../util/status";

const FormItem = Form.Item;

// 登录页面
class LoginPage extends React.Component {

    constructor() {
        super();
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <div>
                {this._loginStatus()}
                <div style={pageStyle.page_header}>
                    {'Demeter'}
                </div>
                <div style={pageStyle.page_content}>
                    <Form onSubmit={this._handleSubmit.bind(this)} style={loginStyle.view_form}>
                        <FormItem>
                            {getFieldDecorator('account', {
                                rules: [{required: true, min: 3, message: MSG_ACCOUNT}],
                            })(
                                <Input prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="账号"/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{required: true, min: 6, message: MSG_PASSWORD}],
                            })(
                                <Input prefix={<Icon type="lock" style={{fontSize: 13}}/>} type="password"
                                       placeholder="密码"/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(
                                <div style={loginStyle.view_remember}>
                                    <Checkbox>{'记住密码'}</Checkbox>
                                </div>
                            )}
                            <a
                                style={loginStyle.text_modify_password}
                                onClick={()=> goToModifyPasswordPage(this.props.history)}>
                                {'修改密码'}
                            </a>
                            <Button type="primary" htmlType="submit" style={loginStyle.button_login}>
                                {'登录'}
                            </Button>
                            <div style={loginStyle.view_contact}>
                                {'注册账号/重置密码 请联系管理员'}
                            </div>
                        </FormItem>
                    </Form>
                </div>
                <div style={pageStyle.page_footer}>
                    <FooterView />
                </div>

            </div>
        );
    }

    /**
     * 表单数据回调
     * @param e
     * @private
     */
    _handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.login(values.account, values.password);
            }
        });
    }

    /**
     * 登录状态处理
     * @private
     */
    _loginStatus() {
        if (this.props.loginStatus === RES_SUCCEED) {
            localStorage.token = this.props.token;
            localStorage.uId = this.props.uId;
            goToHomePage(this.props.history);
        }
    }
}

const LoginPageForm = Form.create()(LoginPage);

function select(state) {
    return {
        loginStatus: state.user.loginStatus, // 登录状态
        uId: state.user.uId, // 用户uId
        token: state.user.token // 用户token
    };
}

function mapDispatchToProps(dispatch) {
    return {
        login: (account, pwd) => login(dispatch, account, pwd),
    }
}

export default connect(select, mapDispatchToProps)(LoginPageForm);