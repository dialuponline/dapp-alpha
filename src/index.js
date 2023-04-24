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
imp