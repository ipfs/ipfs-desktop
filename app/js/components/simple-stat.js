import React, {PropTypes} from 'react'

import {Flex, Block} from 'jsxstyle'

export default class SimpleStat extends React.Component {
  static propTypes = {
    name: PropTypes.string.required,
    value: PropTypes.number.required,
    color: PropTypes.string
  }

  static defaultProps = {
    color: '#50d2c2'
  }

  render () {
    return (
      <Flex flexDirection='column' justifyContent='center'>
        <Block
          width='20px'
          height='20px'
          borderRadius='10px'
          border={`3px solid ${this.props.color}`}
          margin='0 auto'
          />
        <Block
          textTransform='uppercase'
          color='rgba(0, 0, 0, 0.5)'
          padding='10px 0'>
          {this.props.name}
        </Block>
        <Block textAlign='center'>
          {this.props.value}
        </Block>
      </Flex>
    )
  }
}
