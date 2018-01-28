/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import Breadcrumbs from '../../src/components/Breadcrumbs'

describe('<Breadcrumbs />', () => {
  let element
  let path
  let navigate

  before(() => {
    path = '/this/is/a/path'
    navigate = sinon.spy()

    element = shallow((
      <Breadcrumbs
        path={path}
        navigate={navigate} />
    ))
  })

  it('with trailing slash', () => {
    const el = shallow(<Breadcrumbs path={`${path}/`} navigate={navigate} />)
    expect(el.html()).to.eql(element.html())
  })

  it('number of divisors', () => {
    expect(element.children().find('span')).to.have.length(4)
  })

  it('number of links', () => {
    expect(element.children().find('a')).to.have.length(5)
  })

  it('click to navigate', () => {
    element.children().find('a').forEach(element => {
      element.simulate('click')
    })

    expect(navigate.callCount).to.be.equal(5)
  })
})
