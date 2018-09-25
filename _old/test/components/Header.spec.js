/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Header from '../../src/components/Header'

describe('<Header />', () => {
  it('content check', () => {
    const title = 'TITLE'
    const content = 'hey'
    const element = shallow(
      <Header title={title}>{content}</Header>
    )

    expect(element.find('.title')).to.have.length(1)
    expect(element.find('.title').text()).to.eql(title)
    expect(element.find('.subtitle')).to.have.length(0)
    expect(element.html()).to.have.string(content)
  })

  it('with subtitle', () => {
    const title = 'TITLE'
    const subtitle = 'SUBTITLE'
    const content = 'hey'
    const element = shallow(
      <Header title={title} subtitle={subtitle}>{content}</Header>
    )

    expect(element.find('.title')).to.have.length(1)
    expect(element.find('.title').text()).to.eql(title)
    expect(element.find('.subtitle')).to.have.length(1)
    expect(element.find('.subtitle').text()).to.eql(subtitle)
  })

  it('with loading', () => {
    const title = 'TITLE'
    const content = 'hey'
    const element = shallow(
      <Header loading title={title}>{content}</Header>
    )

    expect(element.find('.title')).to.have.length(1)
    expect(element.find('.title').text()).to.eql(title)
    expect(element.find('.subtitle')).to.have.length(0)
    expect(element.hasClass('loading')).to.eql(true)
  })
})
