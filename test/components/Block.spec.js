/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import Block from '../../src/components/Block'

describe('<Block />', () => {
  describe('with onClick and custom class', () => {
    let element
    let wrapped
    let unwrapped
    let className
    let onClick

    before(() => {
      onClick = sinon.spy()
      wrapped = 'Hello, World'
      unwrapped = <span>Hello, Universe</span>
      className = 'class'

      element = shallow((
        <Block
          onClick={onClick}
          wrapped={wrapped}
          unwrapped={unwrapped}
          className={className} />
      ))
    })

    it('has custom class', () => {
      expect(element.hasClass(className)).to.equal(true)
    })

    it('two divs', () => {
      expect(element.find('div')).to.have.length(2)
    })

    it('wrapped', () => {
      const div = element.children().find('div')
      expect(div).to.have.length(1)
      expect(div.text()).to.eql(wrapped)
    })

    it('unwrapped', () => {
      const sth = element.children().find(unwrapped.type)
      expect(sth).to.have.length(1)
      expect(sth.getElement()).to.eql(unwrapped)
    })

    it('click event', () => {
      element.simulate('click')
      expect(onClick.calledOnce).to.equal(true)
    })
  })

  describe('without onClick', () => {
    let element
    let wrapped
    let className

    before(() => {
      wrapped = 'Hello, World'
      className = 'class'

      element = shallow((
        <Block wrapped={wrapped} className={className} />
      ))
    })

    it('has custom class', () => {
      expect(element.hasClass(className)).to.equal(true)
    })

    it('two divs', () => {
      expect(element.find('div')).to.have.length(2)
    })

    it('wrapped', () => {
      const div = element.children().find('div')
      expect(div).to.have.length(1)
      expect(div.text()).to.eql(wrapped)
    })
  })

  describe('without custom className', () => {
    let element
    let wrapped

    before(() => {
      wrapped = 'Hello, World'

      element = shallow((
        <Block wrapped={wrapped} />
      ))
    })

    it('two divs', () => {
      expect(element.find('div')).to.have.length(2)
    })

    it('wrapped', () => {
      const div = element.children().find('div')
      expect(div).to.have.length(1)
      expect(div.text()).to.eql(wrapped)
    })
  })
})
