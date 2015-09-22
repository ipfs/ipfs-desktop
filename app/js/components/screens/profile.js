import React, {PropTypes} from 'react'
import {Flex, Inline} from 'jsxstyle'

import SimpleStat from '../simple-stat'
import IconButton from '../icon-button'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../../styles/common.css'
import '../../../styles/fonts.css'

const stopButtonStyles = {
  background: 'none',
  border: 'none',
  position: 'absolute',
  top: '11px',
  right: '0'
}

export default class ProfileScreen extends React.Component {

  static propTypes = {
    peers: PropTypes.number,
    onStopClick: PropTypes.func,
    onConsoleClick: PropTypes.func,
    onBrowserClick: PropTypes.func,
    onSettingsClick: PropTypes.func
  }

  static defaultProps = {
    peers: 0,
    onStopClick () {},
    onConsoleClick () {},
    onBrowserClick () {},
    onSettingsClick () {}
  }

  render () {
    return (
      <Flex
        width='100%'
        height='100%'
        backgroundColor='#19b5fe'
        color='#FFFFFF'
        flexDirection='column'
        alignItems='center'
        >
        <Flex
          height='40px'>
          <Inline
            alignSelf='center'
            flex='1'
            paddingTop='4px'
            >
            IPFS
          </Inline>
          <IconButton
            icon='cross'
            onClick={this.props.onStopClick}
            style={stopButtonStyles}
            iconStyle={{fontSize: '21px'}}
            />
        </Flex>
        <Flex
          flex='1'
          backgroundColor='#FFFFFF'
          color='#000000'
          width='100%'
          height='30%'
          justifyContent='space-around'
          >
          <SimpleStat
            name='peers'
            value={this.props.peers}
            color='#50d2c2'
            />
        </Flex>
        <Flex
          height='70px'
          justifyContent='space-around'
          width='100%'
          >
          <IconButton
            name='Console'
            icon='gaming'
            onClick={this.props.onConsoleClick}
            />
          <IconButton
            name='Browser'
            icon='window'
            onClick={this.props.onBrowserClick}
            />
          <IconButton
            name='Settings'
            icon='gear'
            onClick={this.props.onSettingsClick}
            />
        </Flex>
      </Flex>
    )
  }
}
