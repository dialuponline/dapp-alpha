import React from 'react';

import { Root } from 'protobufjs';
import { grpcRequest, grpcJSONRequest, rpcImpl } from '../grpc.js'

import agentAbi from 'singularitynet-platform-contracts/abi/Agent.json';
import jobAbi from 'singularitynet-platform-contracts/abi/Job.json';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Ta