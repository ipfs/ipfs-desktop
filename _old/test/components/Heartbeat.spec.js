/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Heartbeat from '../../src/components/Heartbeat'

describe('<Heartbeat />', () => {
  describe('dead', () => {
    let element

    before(() => {
      element = shallow((
        <Heartbeat dead />
      ))
    })

    it('is image', () => {
      expect(element.is('img')).to.eql(true)
    })

    it('is not beating', () => {
      expect(element.hasClass('heartbeat')).to.eql(false)
    })
  })

  describe('alive', () => {
    let element

    before(() => {
      element = shallow((
        <Heartbeat />
      ))
    })

    it('is image', () => {
      expect(element.is('img')).to.eql(true)
    })

    it('is beating', () => {
      expect(element.hasClass('heartbeat')).to.eql(true)
    })
  })
})
