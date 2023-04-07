import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message} from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {NETWORKS, AGI} from '../util';

class Account extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    return(
      <Card title={
          <React.Fragment>
            <Icon type="user" />
            <Divider type="vertical"/>
            Account
          </React.Fragment>
        }
        extra={
          <Button size="small" type="primary" href="https://faucet.singularitynet.io" target="_blank">
            Get Kovan AGI
          </Button>
        }>
        { !this.props.account ?
          <Alert message="Unlock MetaMask and select the Kovan network to interact with the SingularityNET Alpha Dapp" type="info" showIcon />
          :
          <Row>
            <Col>
              <div style={{ marginBottom: '10px' }}>
                Address
                <Divider type="vertical"/>
                <Tag>
                  <a target="_blank" href={this.props.network && this.props.account && typeof NETWORKS[this.props.network] !== "undefined" ? `${NETWORKS[this.props.network].etherscan}/address/${this.props.account}` : undefined}>
                    {this.props.account}
   