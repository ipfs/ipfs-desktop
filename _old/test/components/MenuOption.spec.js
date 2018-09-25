/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import MenuOption from '../../src/components/MenuOption'
import Icon from '../../src/components/Icon'

describe('<MenuOption />', () => {
  let element
  let onClick
  let icon
  let title
  let active

  before(() => {
    onClick = sinon.spy()
    icon = 'icon'
    title = 'A Option'
    active = false

    element = shallow((
      <MenuOption
        onClick={onClick}
        icon={icon}
        title={title}
        active={active} />
    ))
  })

  it('click event', () => {
    element.simulate('click')
    expect(onClick.calledOnce).to.eql(true)
  })

  it('title', () => {
    expect(element.find('p').text()).to.eql(title)
  })

  it('icon', () => {
    expect(element.find(Icon)).to.have.length(1)
  })

  it('active', () => {
    element.setProps({ active: true })
    expect(element.hasClass('active')).to.eql(true)
  })
})
