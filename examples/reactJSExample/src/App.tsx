import * as React from 'react';
import {decode} from "jsonwebtoken";
import {fetchData} from "./restCalls";
import {Card, Spin, Typography} from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export default class App extends React.Component {
    state = {
        loading: true,
        token: {
            email: "",
            name: "",
            preferred_username: "",
        },
        jwt: ''
    };

    async componentDidMount() {
        try {
            this.setState({
                loading: true,
            });
            const tokenString = await fetchData('/token', 'GET', {});
            const accessToken = JSON.parse(tokenString).activeToken;
            this.state.jwt = accessToken;
            debugger;
            this.setState({
                token: decode(accessToken),
                jwt: accessToken,
                loading: false,
            });
        } catch (e) {
            this.setState({
                loading: false,
                jwt: e.message
            });
        }

    }

    render() {

        return this.state.loading ? (<Spin tip="Get Access Token...">
        </Spin>) : (
            <div>
                <Typography>
                    <Title>Current User Info</Title>
                    <Card title={this.state.token.preferred_username} style={{ width: 300 }}>
                        <p>{this.state.token.name}</p>
                        <p>{this.state.token.email}</p>
                    </Card>
                    <Title level={2}>Access Token</Title>
                    <Paragraph>
                        {this.state.jwt}
                    </Paragraph>
                    <Title level={2}>Access Token Payload</Title>
                    <Paragraph>
                        {JSON.stringify(this.state.token)}
                    </Paragraph>
                </Typography>
            </div>
        );
    }
}
