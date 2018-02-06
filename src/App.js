import React, { Component } from 'react'
import { Provider } from 'react-umw'
import Game from './Game'
import Board from './Board'

class App extends Component {
  render() {
    return <Provider machine={Game}>
      <Board />
    </Provider>
  }
}

export default App