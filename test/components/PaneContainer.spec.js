/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import PaneContainer from '../../src/components/PaneContainer'

describe('<PaneContainer />', () => {
  describe('with className', () => {
    let element
    let content
    let className

    before(() => {
      content = 'Hello, World!'
      className = 'hey'

      element = shallow((
        <PaneContainer className={className}>{content}</PaneContainer>
      ))
    })

    it('right content', () => {
      expect(element.text()).to.be.eql(content)
    })

    it('right class', () => {
      expect(element.hasClass(className)).to.be.eql(true)
    })
  })

  describe('without className', () => {
    let element
    let content
    let className

    before(() => {
      content = 'Hello, World!'
      className = 'hey'

      element = shallow((
        <PaneContainer>{content}</PaneContainer>
      ))
    })

    it('right content', () => {
      expect(element.text()).to.be.eql(content)
    })

    it('right class', () => {
      expect(element.hasClass(className)).to.be.eql(false)
    })
  })
})
