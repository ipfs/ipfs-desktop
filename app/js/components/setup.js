import React from 'react'
import {Flex, Block, Inline, curry} from 'jsxstyle'

import FileInput from './file-input'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../styles/common.css'
import '../../styles/fonts.css'

const StartButton = curry(Inline, {
  component: 'button',
  color: '#000000',
  border: 'none',
  backgroundColor: 'white',
  width: '300px',
  padding: '10px'
})

export default class Setup extends React.Component {

  render () {
    return (
      <Flex
        width='100%'
        height='100%'
        backgroundColor='#19b5fe'
        color='#FFFFFF'
        flexDirection='column'
        alignItems='center'
        padding='20'
        justifyContent='space-between'
        >
        <Inline
          textAlign='center'
          marginBottom='20px'
          fontSize='38px'
          >
          Welcome to IPFS
        </Inline>
        <Block
          fontSize='18px'
          maxWidth='600px'
          >
          We are happy you found your way here. Before you can start there is just one thing you need to tell us, where should we store all the awesomeness that is IPFS?
        </Block>
        <FileInput
          directory
          value='~/.ipfs'
          />
        <StartButton>
          Continue
        </StartButton>
      </Flex>
    )
  }
}
