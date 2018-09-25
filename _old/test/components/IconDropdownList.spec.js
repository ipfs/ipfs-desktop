/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import IconDropdownList from '../../src/components/IconDropdownList'
import Icon from '../../src/components/Icon'

describe('<IconDropdownList />', () => {
  let element
  let onChange
  let icon
  let data
  let defaultValue

  before(() => {
    onChange = sinon.spy()
    icon = 'close'
    data = ['opt1', 'opt2', 'opt3']
    defaultValue = data[0]

    element = shallow(
      <IconDropdownList
        icon={icon}
        data={data}
        defaultValue={defaultValue}
        onChange={onChange} />
    )
  })

  it('correct icon', () => {
    const icns = element.find(Icon)

    expect(icns).to.have.length(1)
    expect(icns.prop('name')).to.eql(icon)
  })

  it('change event', () => {
    const evt = {
      preventDefault: () => {},
      target: {
        value: data[1]
      }
    }

    element.find('select').simulate('change', evt)
    expect(onChange.called).to.eql(true)
    expect(onChange.calledWith(evt.target.value)).to.eql(true)
  })
})
