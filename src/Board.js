import React, { Component } from 'react'
import { connect } from 'react-umw'

import {
  App, Set, Row, Cell,
  ControlRow, Display,
  Modal, BigTextButton
} from './Styled'

const baguettes = require('./baguettes.svg')
const donut = require('./donut.svg')

const CHARACTER_X = Symbol.for('CHARACTER_X')
const CHARACTER_O = Symbol.for('CHARACTER_O')

class Board extends Component {
  renderBoard = () => {
    return <Set>
      {this.props.board.map(this.renderRow)}
    </Set>
  }

  renderRow = (row, index) => {
    return <Row key={index}>
      {row.map(this.renderCell(index))}
    </Row>
  }

  renderCell = row => (content, cell) => {
    let icon = null

    if (content !== null) {
      icon = this.props.players[content].character

      if (icon === CHARACTER_X) {
        icon = baguettes
      } else if (icon === CHARACTER_O) {
        icon = donut
      }
    }
    return <Cell key={`${row}${cell}`} onClick={() => this.props.do('MOVE', {x: row, y: cell})}>
      {icon && <img style={{margin: "10px"}} src={icon} alt="Cell Move" />}
    </Cell>
  }

  onSelectSingle = () => {
    this.props.do('SELECT_SINGLE')
  }

  onSelectVersus = () => {
    this.props.do('SELECT_VERSUS')
  }

  onSelectX = () => {
    this.props.do('SELECT_X')
  }

  onSelectO = () => {
    this.props.do('SELECT_O')
  }

  displayPlayerSelection = () =>
    <ControlRow className={`animated ${this.props.modalUp ? 'bounceInDown' : 'bounceOutUp'}`}>
      <BigTextButton onClick={this.onSelectSingle}>
        Single
      </BigTextButton>
      <BigTextButton onClick={this.onSelectVersus}>
        Versus
      </BigTextButton>
    </ControlRow>

  displayCharacterSelection = () =>
    <ControlRow className={`animated ${this.props.modalUp ? 'bounceInDown' : 'bounceOutUp'}`}>
      <BigTextButton onClick={this.onSelectX}>
        <img src={baguettes} width="200" height="200" alt="Baguettes" />
      </BigTextButton>
      <BigTextButton onClick={this.onSelectO}>
      <img src={donut} width="200" height="200" alt="Donut" />
      </BigTextButton>
    </ControlRow>

  render() {
    return <Display>
      <App modalUp={this.props.modalUp}>
        {this.renderBoard()}
      </App>
      {this.props.modalUp && <Modal className={`animated ${this.props.modalUp ? 'fadeIn' : 'fadeOut'}`}>
        {this.props.is('PLAYER_MODE_SELECTION')
          && this.displayPlayerSelection()}
        {this.props.is('CHARACTER_SELECTION')
          && this.displayCharacterSelection()}
      </Modal>}
    </Display>
  }
}

export default connect()(Board)