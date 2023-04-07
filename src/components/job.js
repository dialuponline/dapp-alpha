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
    abiDecoder.addABI(jo