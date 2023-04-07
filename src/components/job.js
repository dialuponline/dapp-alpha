import React from 'react';

import { Root } from 'protobufjs';
import { grpcRequest, grpcJSONRequest, rpcImpl } from '../grpc.js'

import agentAbi from 'singularitynet-platform-contracts/abi/Agent.json';
import jobAbi from 'singularitynet-platform-contracts/abi/Job.json';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import { NETWORKS, ERROR_UTILS, AGENT_STATE, AGI, hasOwnDefinedProperty } from '../util';
import {JsonRpcClient} from "../jsonrpc";
import abiDecoder from 'abi-decoder';
import md5 from 'md5';

// Version 1 of the Agent contract expects the signed 20-byte job address and we've hardcoded the
// checksum of the bytecode for this version below. Version 2 expects the signed 42-byte hex-encoded
// job address.
const oldSigAgentBytecodeChecksum = "f4b0a8064a38abaf2630f5f6bd0043c8";

class Job extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      jobAddress:             undefined,
      jobPrice:               undefined,
      jobStep:                0,
      jobResult:              undefined,
      showModal:              false,
      modalFunctional:        undefined,
      waitingForMetaMask:     false,
    };

    this.fundJob       = this.fundJob.bind(this);
    this.approveTokens = this.approveTokens.bind(this);
    this.createJob     = this.createJob.bind(this);
    this.callApi       = this.callApi.bind(this);
    this.handleReject  = this.handleReject.bind(this);
    this.showModal     = this.showModal.bind(this);

    abiDecoder.addABI(agentAbi);
    abiDecoder.addABI(jobAbi);
  }

  componentDidMount() {
    this.jobDomNode.scrollIntoView();
  }

  nextJobStep() {
    this.clearModal();
    this.setState((prevState) => ({
      jobStep: prevState.jobStep + 1
    }));
  }

  showModal(modalFunctional) {
    this.setState({
      waitingForMetaMask: true,
      showModal: true,
      modalFunctional: modalFunctional,
    });
  }

  clearModal() {
    this.setState({
       showModal: false,
    });
  }

  handleReject(error) {
    console.log(ERROR_UTILS.sanitizeError(error));
    this.clearModal();
  }

  createJob() {
    this.props.agent['contractInstance'].createJob({from: this.props.account}).then(response => {

      this.setState({
        waitingForMetaMask: false,
      });

      this.waitForTransaction(response).then(receipt => {

        let decodedLogs = abiDecoder.decodeLogs(receipt.logs);
        let createdEvent = decodedLogs.find(log => log.name == "JobCreated" && log.address == this.props.agent['contractInstance'].address);

        if(createdEvent) {

          let jobAddress = createdEvent.events.find(item => item.name == 'job').value;
          let jobPrice   = createdEvent.events.find(item => item.name == 'jobPrice').value;

          console.log('Job: ' + jobAddress + ' for price: ' + AGI.toDecimal(jobPrice) + ' AGI was created');

          this.setState((prevState) => 