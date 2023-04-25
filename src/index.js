import React from 'react';
import ReactDOM from 'react-dom';
import Eth from 'ethjs';
import AlphaRegistryNetworks from 'singularitynet-platform-contracts/networks/AlphaRegistry.json';
import AlphaRegistryAbi from 'singularitynet-platform-contracts/abi/AlphaRegistry.json'
import RegistryNetworks from 'singularitynet-platform-contracts/networks/Registry.json';
import RegistryAbi from 'singularitynet-platform-contracts/abi/Registry.json'
import tokenNetworks from 'singularitynet-token-contracts/networks/SingularityNetToken.json';
import tokenAbi from 'singularitynet-token-contracts/abi/SingularityNetToken.json';
import agentAbi from 'singularitynet-platform-contracts/abi/Agent.json';
import {Layout, Divider, Card, Icon, Spin, message, Alert, Row, Col} from 'antd';
import Account from './components/account';
import Services from './components/services';
import Job from './components/job';
import { NETWORKS, AGI, SERVICE_SPEC_PROVIDER_URL,ERROR_UTILS } from './util';

import DefaultService from './components/service/default';
import AlphaExampleService from './components/service/alpha_example';
import FaceDetectService from './components/service/face_detect';
import FaceLandmarksService from './components/service/face_landmarks';
import FaceAlignmentService from './components/service/face_alignment';
import FaceRecognitionService from './components/service/face_recognition';
import ExchangeService from './components/service/exchange';


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      account:                    undefined,
      ethBalance:                 0,
      agiBalance:                 0,
      chainId:                    undefined,
      selectedAgent:              undefined,
      serviceEncoding:            undefined,
      serviceSpec:                undefined,
      agentCallComponent:         undefined,
      usingDefaultCallComponent:  false,
    };

    this.serviceNameToComponent = {
      'Alpha TensorFlow Agent': AlphaExampleService,
      'face_detect': FaceDetectService,
      'face_landmarks': FaceLandmarksService,
      'face_alignment': FaceAlignmentService,
      'face_recognition': FaceRecognitionService,
      'Exchange AGI for BTC': ExchangeService
    };
    this.serviceDefaultComponent = DefaultService;
    

    this.web3               = undefined;
    this.eth                = undefined;
    this.watchWalletTimer   = undefined;
    this.watchNetworkTimer  = undefined;
    this.agentContract      = undefined;
    this.registryInstances  = undefined;
    this.tokenInstance      = undefined;
  }

  componentWillMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
  }

  componentWillUnmount() {
    if(this.watchWalletTimer) {
      clearInterval(this.watchWalletTimer);
    }
    if(this.watchNetworkTimer) {
      clearInterval(this.watchNetworkTimer);
    }
  }

  async handleWindowLoad() {
    if(typeof window.ethereum !== 'undefined') {
      try {
        window.web3 = new Web3(ethereum);
        await window.ethereum.enable();
        this.initialize();
      } catch (error) {
          console.log(ERROR_UTILS.sanitizeError(error));
      }
    } else if(typeof window.web3 !== 'undefined') {
      this.initialize();
    }
  }

  initialize() {
      this.web3          = window.web3;
      this.eth           = new Eth(window.web3.currentProvider);
      window.ethjs       = this.eth;
      this.agentContract = this.eth.contract(agentAbi);

      this.watchWalletTimer  = setInterval(() => this.watchWallet(), 500);
      this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
  }

  watchWallet() {
    this.eth.accounts().then(accounts => {

      if(accounts.length === 0) {
        console.log('wallet is locked');
        this.setState({account: undefined});
        return;
      } else if(accounts[0] !== this.state.account) {
        console.log('account: ' + accounts[0] + ' unlocked');
        this.setState({ account: accounts[0] });
      }

      this.eth.getBalance(accounts[0]).then(response => {
        let balance = Number(response.toString());
        if(balance !== this.state.ethBalance) {
          console.log('account eth balance is: ' + Eth.fromWei(balance, 'ether'));
          this.setState({ethBalance: balance});
        }
      })

      if(this.tokenInstance) {
        this.tokenInstance.balanceOf(this.state.account).then(response => {
          let balance = Number(response['balance']);
          if(balance !== this.state.agiBalance) {
            console.log('account agi balance is: ' + AGI.toDecimal(balance));
            this.setState({agiBalance: balance})
          }
        })
      } else {
        this.setState({agiBalance: 0})