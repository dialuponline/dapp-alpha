
import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import { debounce } from 'underscore';
import styles from './face_landmarks.css.js';

class FaceLandmarksService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.updateValid = this.updateValid.bind(this);
    this.updateValid = debounce(this.updateValid, 500);

    this.state = {
        fileUploaded: false,
        file: undefined,
        fileReader: undefined,
        methodName: "get_landmarks",  
        facesString: '[{"x":10,"y":10,"w":100,"h":100}]',
        landmarkModel: "68",
        inputValid: true,
    };
  }

  isComplete() {