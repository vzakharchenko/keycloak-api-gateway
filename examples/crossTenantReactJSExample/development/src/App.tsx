import {decode} from "jsonwebtoken";
import {Button, Card, Spin, Typography} from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
// eslint-disable-next-line  no-use-before-define
import * as React from 'react';

import {fetchData} from "./restCalls";


export default class App extends React.Component {
  state = {
    loading: true,
    token: {
      email: "",
      name: "",
      iss: "",
            // eslint-disable-next-line babel/camelcase
      preferred_username: "",
    },
    jwt: '',
  };

  getRealmName(url: string) {
    const n = url.lastIndexOf('/');
    return url.substring(n + 1);
  }

  async componentDidMount() {
    try {
      this.setState({
        loading: true,
      });
      const tokenString = await fetchData('/token', 'GET', {});
      const accessToken = JSON.parse(tokenString).activeToken;
      const token = decode(accessToken);
      this.setState({
        token,
        jwt: accessToken,
        loading: false,
      });
    } catch (e) {
      this.setState({
        loading: false,
        jwt: e.message,
      });
    }

  }

  render() {

    return this.state.loading ? (<Spin tip="Get Access Token...">
        </Spin>) : (
            <div>
                <Typography>
                    <Title>Current Tenant</Title>
                    <Title level={2}>  {`Tenant Name: ${this.getRealmName(this.state.token.iss)}`}</Title>
                    <p><Button type="primary" onClick={() => {
                      location.replace('/logout');
                    }}>Logout</Button></p>
                    <p><Button type="primary" onClick={() => location.replace('/tenantSelector')}>Switch to Another Tenant</Button></p>
                    <br/>
                    <Title>Current User Info</Title>
                    <Card title={`User Name: ${this.state.token.preferred_username}`} style={{width: 300}}>
                        <p>{`Full name: ${this.state.token.name}`}</p>
                        <p>{`Email: ${this.state.token.email}`}</p>
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
