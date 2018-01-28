/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import Button from '../../src/components/Button'

describe('<Button />', () => {
  let element
  let text
  let onClick

  before(() => {
    text = 'This is a Button'
    onClick = sinon.spy()

    element = shallow((
      <Button
        text={text}
        onClick={onClick} />
    ))
  })

  it('text', () => {
    expect(element.find('span').text()).to.be.eql(text)
  })

  it('click event', () => {
    element.find('button').simulate('click')
    expect(onClick.calledOnce).to.be.eql(true)
  })
})
