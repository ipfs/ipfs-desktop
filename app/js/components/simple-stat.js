import React, {PropTypes} from 'react'

import {Flex, Block} from 'jsxstyle'

export default class SimpleStat extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string
  }

  static defaultProps = {
    color: '#50d2c2'
  }

  render () {
    return (
      <Flex flexDirection='column' justifyContent='center'>
        <Block
          width='16px'
          height='16px'
          borderRadius='8px'
          border={`3px solid ${this.props.color}`}
          margin='0 auto'
          />
        <Block
          textTransform='uppercase'
          color='rgba(0, 0, 0, 0.5)'
          padding='10px 0 5px'
          fontSize='13px'
          font-weight='500'
          >
          {this.props.name}
        </Block>
        <Block
          textAlign='center'
          fontWeight='bold'
          fontSize='20px'
          >
          {this.props.value}
        </Block>
      </Flex>
    )
  }
}
