import React, { Component } from 'react'
import { connect } from 'react-umw'

import {
  App, Set, Row, Cell,
  ControlRow
} from './Styled'

class Board extends Component {
  renderBoard = () => {
    return <Set>
      {this.props.board.map(this.renderRow)}
    </Set>
  }

  renderRow = row => {
    return <Row>
      {row.map(this.renderCell)}
    </Row>
  }

  renderCell = content => {
    return <Cell onClick={() => this.props.do('MOVE', {x: 0, y: 0})}>
      {content}
    </Cell>
  }

  render() {
    return <App>
      {this.renderBoard()}
      <ControlRow>
        <button onClick={() => this.props.do('SELECT_SINGLE')}>Single Player</button>
        <button onClick={() => this.props.do('SELECT_VERSUS')}>Versus Player</button>
        <button onClick={() => this.props.do('SELECT_X')}>Select X</button>
        <button onClick={() => this.props.do('SELECT_O')}>Select O</button>
      </ControlRow>
    </App>
  }
}

export default connect()(Board)