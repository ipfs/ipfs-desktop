/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import FileBlock from '../../src/components/FileBlock'
import IconButton from '../../src/components/IconButton'
import Button from '../../src/components/Button'

describe('<FileBlock />', () => {
  describe('directory', () => {
    let navigate = sinon.spy()
    let fn = copy = remove = sinon.spy()
    let name = 'afile'
    let hash = 'ahash'
    let size = 123

    before(() => {
      element = shallow(
        <FileBlock
          navigate={navigate}
          copy={copy}
          remove={remove}
          name={name}
          hash={hash}
          size={size}
          type='directory' />
      )
    })

    it('dir icon', () => {
      expect(element.state('icon')).to.eql('folder')
    })

    it('navigate instead of open', () => {
      element.dive().simulate('click')
      expect(navigate.calledOnce).to.eql(true)
    })

    it('other fns were not called', () => {
      expect(fn.called).to.eql(false)
    })
  })

  describe('generic file', () => {
    let open = sinon.spy()
    let fn = copy = remove = sinon.spy()
    let name = 'afile'
    let hash = 'ahash'
    let size = 123

    before(() => {
      element = shallow(
        <FileBlock
          open={open}
          copy={copy}
          remove={remove}
          name={name}
          hash={hash}
          size={size}
          type='file' />
      )
    })

    it('file icon', () => {
      expect(element.state('icon')).to.eql('file')
    })

    it('open instead of navigate', () => {
      element.dive().simulate('click')
      expect(open.calledOnce).to.eql(true)
    })

    it('other fns were not called', () => {
      expect(fn.called).to.eql(false)
    })
  })

  describe('file with known extension', () => {
    let open = sinon.spy()
    let fn = copy = remove = sinon.spy()
    let name = 'afile.png'
    let hash = 'ahash'
    let size = 123

    before(() => {
      element = shallow(
        <FileBlock
          open={open}
          copy={copy}
          remove={remove}
          name={name}
          hash={hash}
          size={size}
          type='file' />
      )
    })

    it('file icon', () => {
      expect(element.state('icon')).to.eql('image')
    })

    it('other fns were not called', () => {
      expect(fn.called).to.eql(false)
    })
  })

  let element
  let name
  let hash
  let size
  let navigate
  let copy
  let remove
  let type
  let open

  before(() => {
    navigate = sinon.spy()
    open = sinon.spy()
    copy = sinon.spy()
    remove = sinon.spy()
    name = 'A File'
    hash = 'ahash'
    size = 1456
    type = 'file'

    element = shallow(
      <FileBlock
        navigate={navigate}
        open={open}
        copy={copy}
        remove={remove}
        name={name}
        hash={hash}
        size={size}
        type={type} />
    )
  })

  it('icon button count', () => {
    expect(element.dive().find(IconButton)).to.have.length(2)
  })

  it('copy event', () => {
    element.dive()
      .find(IconButton)
      .at(0)
      .simulate('click', new window.Event('click'))

    expect(copy.calledOnce).to.eql(true)
    expect(copy.calledWith(hash)).to.eql(true)
  })

  it('click delete and then cancel', () => {
    element.dive()
      .find(IconButton)
      .at(1)
      .simulate('click', new window.Event('click'))

    expect(element.state('deleting')).to.eql(true)
    element.update()
    expect(element.dive().find(Button)).to.have.length(2)

    element.dive()
      .find(Button)
      .at(0)
      .simulate('click', new window.Event('click'))

    expect(remove.called).to.eql(false)
    expect(element.state('deleting')).to.eql(false)
    element.update()
    expect(element.dive().find(Button)).to.have.length(0)
  })

  it('click delete and then confirm', () => {
    element.dive()
      .find(IconButton)
      .at(1)
      .simulate('click', new window.Event('click'))

    expect(element.state('deleting')).to.eql(true)
    element.update()
    expect(element.dive().find(Button)).to.have.length(2)

    element.dive()
      .find(Button)
      .at(1)
      .simulate('click', new window.Event('click'))

    expect(remove.called).to.eql(true)
  })
})
