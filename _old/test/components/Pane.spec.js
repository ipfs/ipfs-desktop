/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Pane from '../../src/components/Pane'
import Footer from '../../src/components/Footer'

describe('<Pane />', () => {
  describe('with className', () => {
    let element
    let content
    let className

    before(() => {
      content = 'Hello, world!'
      className = 'my-pane'

      element = shallow((
        <Pane className={className}>{content}</Pane>
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

    before(() => {
      content = 'Hello, world!'

      element = shallow((
        <Pane>{content}</Pane>
      ))
    })

    it('right content', () => {
      expect(element.text()).to.be.eql(content)
    })
  })

  describe('with Footer', () => {
    let element

    before(() => {
      element = shallow((
        <Pane>
          <Footer>Hello, World!</Footer>
        </Pane>
      ))
    })

    it('footer class', () => {
      expect(element.hasClass('has-footer')).to.be.eql(true)
    })
  })
})
