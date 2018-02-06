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
  mode: null,
  players: []
})

const characterSwap = {
  [CHARACTER_X]: CHARACTER_O,
  [CHARACTER_O]: CHARACTER_X,
}

const createHumanMove = index => (board, x, y) => {
  if (!board[x][y]) {
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
        return {
          ...data,
          board: data.players[0].move(data.board, args.x, args.y)
        }
      }
    },
  },
  'PLAYER2_TURN': {
    'MOVE': {
      to: 'CHECKING',
      action: (data, args) => {
        return {
          ...data,
          board: data.players[1].move(data.board, args.x, args.y)
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
  }
  console.log(data.board)
})

export default Game