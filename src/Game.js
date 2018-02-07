const UMW = require('unlimited-machine-works')

const MODE_SINGLE = Symbol.for('MODE_SINGLE')
const MODE_VERSUS = Symbol.for('MODE_VERSUS')
const CHARACTER_X = Symbol.for('CHARACTER_X')
const CHARACTER_O = Symbol.for('CHARACTER_O')

const createInitialGameData = () => ({
  board: [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ],
  moveBy: null,
  mode: null,
  players: []
})

const characterSwap = {
  [CHARACTER_X]: CHARACTER_O,
  [CHARACTER_O]: CHARACTER_X,
}

const createHumanMove = index => (board, x, y) => {
  if (board[x][y] === null) {
    board[x][y] = index
    return [...board]
  }

  return board
}

const createAiMove = (board, x, y) => {
  return board
}

const createPlayers = (char, mode) => {
  return [
    {
      character: char,
      move: createHumanMove(0)
    },
    {
      character: characterSwap[char],
      move: mode === MODE_VERSUS ? createHumanMove(1) : createAiMove
    }
  ]
}

const getColumns = board => {
  return [0, 1, 2].map(col => [board[0][col], board[1][col], board[2][col]])
}

const isVictory = (board, player) => {
  const rows = board.map(row => row.every(cell => cell === player)).some(row => row)
  const columns = getColumns(board).map(row => row.every(cell => cell === player)).some(row => row)
  const answerSet = [rows, columns]

  return answerSet.some(thing => thing)
}

const initialData = createInitialGameData()

const gameConfig = {
  'PLAYER_MODE_SELECTION': {
    'SELECT_SINGLE': {
      to: 'CHARACTER_SELECTION',
      action: (data, args) => {
        return {...data, mode: MODE_SINGLE}
      }
    },
    'SELECT_VERSUS': {
      to: 'CHARACTER_SELECTION',
      action: (data, args) => {
        return {...data, mode: MODE_VERSUS}
      }
    },
  },
  'CHARACTER_SELECTION': {
    'SELECT_X': {
      to: 'PLAYER1_TURN',
      action: (data, args) => {
        return {...data, players: createPlayers(CHARACTER_X, data.mode)}
      }
    },
    'SELECT_O': {
      to: 'PLAYER1_TURN',
      action: (data, args) => {
        return {...data, players: createPlayers(CHARACTER_O, data.mode)}
      }
    },
  },
  'PLAYER1_TURN': {
    'MOVE': {
      to: 'CHECKING',
      action: (data, args) => {
        const {x, y} = args

        return {
          ...data,
          moveBy: 0,
          board: data.players[0].move(data.board, x, y)
        }
      }
    },
  },
  'PLAYER2_TURN': {
    'MOVE': {
      to: 'CHECKING',
      action: (data, args) => {
        const {x, y} = args || {}

        return {
          ...data,
          moveBy: 1,
          board: data.players[1].move(data.board, x, y)
        }
      }
    },
  },
  'CHECKING': {
    'WIN': {
      to: 'VICTORY',
      action: (data, args) => {
        return data
      }
    },
    'TO_PLAYER1': {
      to: 'PLAYER1_TURN',
      action: (data, args) => {
        return data
      }
    },
    'TO_PLAYER2': {
      to: 'PLAYER2_TURN',
      action: (data, args) => {
        return data
      }
    }
  },
  'VICTORY': {
    'RESET': {
      to: 'PLAYER_MODE_SELECTION',
      action: (data, args) => {
        return createInitialGameData()
      }
    }
  }
}

const Game = UMW.summon(initialData, gameConfig)

Game.addSubscriber((state, data) => {
  if (Game.is('VICTORY')) {
    // TODO: Show something nice
    alert(`Player ${data.moveBy} WINS!`)
    Game.do('RESET')
  } else if (Game.is('CHECKING')) {
    
    if (isVictory(data.board, data.moveBy)) {
      Game.do('WIN')
    } else {
      if (Game.get('moveBy')) {

        // If player 2 moved last
        Game.do('TO_PLAYER1')
      } else {
  
        // If player 1 moved last
        Game.do('TO_PLAYER2')
      }
    }
    
  } else if (Game.is('PLAYER2_TURN') && data.mode === MODE_SINGLE) {
    Game.do('MOVE')
  }
})

export default Game