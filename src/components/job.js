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

          this.setState((prevState) => ({
            jobAddress: jobAddress,
            jobPrice: jobPrice,
            jobInstance: window.ethjs.contract(jobAbi).at(jobAddress),
          }));

          this.nextJobStep();
        }
      });
    }).catch(this.handleReject);
  }

  approveTokens() {

    this.props.token.approve(this.state.jobAddress, this.state.jobPrice, {from: this.props.account}).then(response => {

      this.setState({
        waitingForMetaMask: false,
      });

      this.waitForTransaction(response).then(receipt => {
        console.log('ECR20 approve called with ' + AGI.toDecimal(this.state.jobPrice) + ' AGI for Job: ' + this.state.jobAddress);
        this.nextJobStep();
      });
    }).catch(this.handleReject);
  }

  fundJob() {

    this.state.jobInstance.fundJob({ from: this.props.account }).then(response => {

      this.setState({
        waitingForMetaMask: false,
      });

      this.waitForTransaction(response).then(receipt => {

        console.log('FundJob called on Job: ' + this.state.jobAddress);
        this.nextJobStep();
      });
    
    }).catch(this.handleReject);
  }

  callApi(serviceName, methodName, params) {

    let addressBytes = [];
    for(let i=2; i< this.state.jobAddress.length-1; i+=2) {
      addressBytes.push(parseInt(this.state.jobAddress.substr(i, 2), 16));
    }

    window.ethjs.getCode(this.props.agent.contractInstance.address).then((bytecode) => {
      let bcBytes = [];
      for (let i = 2; i < bytecode.length; i += 2) {
        bcBytes.push(parseInt(bytecode.substr(i, 2), 16));
      }

      let bcSum = md5(bcBytes);
      let sigPayload = bcSum === oldSigAgentBytecodeChecksum ? Eth.keccak256(addressBytes) : Eth.fromUtf8(this.state.jobAddress);

      window.ethjs.personal_sign(sigPayload, this.props.account).then(signature => {

        this.setState({
          waitingForMetaMask: false,
        });

        let r = `0x${signature.slice(2, 66)}`;
        let s = `0x${signature.slice(66, 130)}`;
        let v = parseInt(signature.slice(130, 132), 16);

        this.props.agent.contractInstance.validateJobInvocation(this.state.jobAddress, v, r, s, {from: this.props.account}).then(validateJob => {
          console.log('job invocation validation returned: ' + validateJob[0]);

          const requestHeaders = { "snet-job-address": this.state.jobAddress, "snet-job-signature": signature }
          const requestObject = params

          const serviceSpecJSON = Root.fromJSON(this.props.serviceSpec[0])
          const packageName = Object.keys(serviceSpecJSON.nested)
            .find(key =>
              typeof serviceSpecJSON.nested[key] === "object" &&
              hasOwnDefinedProperty(serviceSpecJSON.nested[key], "nested")
            )
 
          if (this.props.serviceEncoding === "json") {
            grpcJSONRequest(this.props.agent.endpoint, packageName, serviceName, methodName, requestHeaders, requestObject)
              .then(response => {
                this.setState(() => ({ "jobResult": response }))
                this.nextJobStep()
              })
              .catch(console.error)
          } else if (this.props.serviceEncoding === "proto") {
            const Service = serviceSpecJSON.lookup(serviceName)
            const serviceObject = Service.create(rpcImpl(this.props.agent.endpoint, packageName, serviceName, methodName, requestHeaders), false, false)

            grpcRequest(serviceObject, methodName, requestObject)
              .then(response => {
                this.setState(() => ({ "jobResult": response }))
                this.nextJobStep()
              })
              .catch(console.error)
          } else {
            throw new Error(`Encoding "${this.props.serviceEncoding}" is not recognized`)
          }
        });
      }).catch(this.handleReject);
    }).catch((error) => {
      console.log("getCode error", error);
    });
  }

  async waitForTransaction(hash) {
    let receipt;
    while(!receipt) {
      receipt = await window.ethjs.getTransactionReceipt(hash);
    }

    if (receipt.status === "0x0") {
      throw receipt
    }

    return receipt;
  }
  
  render() {
    let modal = type => 
      <Modal title={null} footer={null} closable={false} visible={this.state.showModal}>
        <Steps size="small" current={this.state.waitingForMetaMask ? 0 : 1}>
          <Steps.Step title='MetaMask' icon={this.state.waitingForMetaMask ? <Icon type="loading" /> : null} />
          <Steps.Step title={type[0].toUpperCase().concat(type.slice(1))} icon={!this.state.waitingForMetaMask ? <Icon type="loading" /> : null} />
        </Steps>
        <br/>
        {
          this.state.waitingForMetaMask ?
            <Alert description="Waiting for interaction with MetaMask to complete." />
            : <Alert description={'Waiting for ' + (type === 'blockchain' ? 'transaction to be mined on the blockchain.' : 'API response')} />
        }
      </Modal>
    
    let blockchainModal = () => modal('blockchain');
    let serviceModal = () => modal('service');

    let steps = [
      {
        title: 'Create Job',
        render: () => {
          return(
            <p>
              The first step in calling the Agent's API is to create a Job contract with the Agent. The Job contract stores the negotiated price in AGI tokens for
              calling the API. The neg