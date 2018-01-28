/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import IconButton from '../../src/components/IconButton'
import Icon from '../../src/components/Icon'

describe('<IconButton />', () => {
  let element
  let icon
  let onClick

  before(() => {
    icon = 'close'
    onClick = sinon.spy()

    element = shallow((
      <IconButton
        icon={icon}
        onClick={onClick} />
    ))
  })

  it('icon', () => {
    expect(element.find(Icon)).to.have.length(1)
    expect(element.find(Icon).prop('name')).to.eql(icon)
  })

  it('active', () => {
    element.setProps({ active: true })
    element.update()
    expect(element.hasClass('active')).to.eql(true)
  })

  it('click event', () => {
    element.find('button').simulate('click')
    expect(onClick.calledOnce).to.be.eql(true)
  })
})
