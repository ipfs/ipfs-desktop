import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Header from '../../components/view/header'
import Footer from '../../components/view/footer'
import File from '../../components/view/file'
import IconButton from '../../components/view/icon-button'

export default class PinnedScreen extends Component {
  static propTypes = {
    files: [],
    changeRoute: PropTypes.func,
    pinned: PropTypes.array
  }

  static defaultProps = {
    files: []
  }

  render () {
    const files = this.props.files.map(file => {
      return (<File {...file} />)
    })

    return (
      <div className='files'>
        <Header title='Pinned Hashes' />

        <div className='main'>
          {files}
        </div>

        <Footer>
          <IconButton onClick={() => { this.props.changeRoute('files') }} icon='files' />
          <IconButton onClick={() => { this.props.changeRoute('peers') }} icon='pulse' />
        </Footer>
      </div>
    )
  }
}
