import React from 'react'
import Connection from './Connection'
import { connect } from 'redux-bundler-react'

const NewConnnection = () => (
  <Connection isNew />
)

export default connect(
  'doUpdateHash',
  NewConnnection
)
