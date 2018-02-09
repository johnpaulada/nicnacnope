import swal from 'sweetalert';

const UMW = require('unlimited-machine-works')

const MODE_SINGLE = Symbol.for('MODE_SINGLE')
const MODE_VERSUS = Symbol.for('MODE_VERSUS')
const CHARACTER_X = Symbol.for('CHARACTER_X')
const CHARACTER_O = Symbol.for('CHARACTER_O')
const PLAYER_1    = 0
const PLAYER_2    = 1

const createInitialGameData = () => ({
  board: [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ],
  moveBy: null,
  mode: null,
  modalUp: true,
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

const getColumns = board => {
  return [0, 1, 2].map(col => [board[0][col], board[1][col], board[2][col]])
}

const flip = turn => 1 - turn

const isVictory = (board, player) => {
  const checkCell = cell => cell === player
  const rows      = board.map(row => row.every(checkCell)).some(row => row)
  const flipped   = getColumns(board)
  const columns   = flipped.map(row => row.every(checkCell)).some(row => row)
  const diagonal1 = [board[0][0], board[1][1], board[2][2]]
  const diagonal2 = [board[0][2], board[1][1], board[2][0]]
  const diagonals = [diagonal1.every(checkCell), diagonal2.every(checkCell)].some(row => row)
  const answerSet = [rows, columns, diagonals]

  return answerSet.some(thing => thing)
}

const isLoss = (board, player) => {
  return isVictory(board, flip(player))
}

const isFull = board => {
  return board.every(row => row.every(cell => cell !== null))
}

const has2 = (row, player) => {
  return row.reduce((sum, cell) => {
    return cell === player ? sum + 1 : player
  }, 0) === 2
}

const advantagePoints = (board, player) => {
  const rows      = board.map(row => has2(row, player))
  const flipped   = getColumns(board)
  const columns   = flipped.map(row => has2(row, player))
  const diagonal1 = [board[0][0], board[1][1], board[2][2]]
  const diagonal2 = [board[0][2], board[1][1], board[2][0]]
  const diagonals = [diagonal1, diagonal2].map(row => has2(row, player))
  const advantages = [...rows, ...columns, ...diagonals]

  return advantages.reduce((sum, advantage) => {
    return sum + advantage ? 10 : 0
  }, 0)
}

const disadvantagePoints = (board, player) => {
  return advantagePoints(board, player) / 10 * 15 * -1
}

const generateMoves = (board, turn) => {
  return board.reduce((allVals, row, x) => {
    const rowVal = row.reduce((vals, cell, y) => {
      return cell !== null ? vals : [...vals, [...board.slice(0, x), [...board[x].slice(0, y), turn, ...board[x].slice(y+1)], ...board.slice(x+1)]]
    }, [])
    return [...allVals, ...rowVal]
  }, [])
}

const minmax = (board, turn, level, limit, player=PLAYER_2) => {
  if (isVictory(board, player)) return 20
  if (isLoss(board, player)) return -30
  if (level >= limit || isFull(board)) return 0

  const advantage = advantagePoints(board, PLAYER_2)
  const disadvantage = disadvantagePoints(board, PLAYER_1)

  const moves = generateMoves(board, turn)
  return moves.reduce((sum, move) => sum + minmax(move, flip(turn), level, limit+1, player), advantage + disadvantage)
}

const createAiMove = (board) => {
  const LIMIT = 8

  const moves = generateMoves(board, PLAYER_2)
  const scores = moves.map(move => minmax(move, PLAYER_2, 1, LIMIT))
  const bestIndex = scores.reduce((result, score, index) => {
    return score > result[1] ? [index, score] : result
  }, [0, 0])[0]

  return moves[bestIndex]
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
        return {...data, players: createPlayers(CHARACTER_X, data.mode), modalUp: false}
      }
    },
    'SELECT_O': {
      to: 'PLAYER1_TURN',
      action: (data, args) => {
        return {...data, players: createPlayers(CHARACTER_O, data.mode), modalUp: false}
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
    'RESET': {
      to: 'PLAYER_MODE_SELECTION',
      action: (data, args) => {
        return createInitialGameData()
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
    if (data.mode === MODE_SINGLE && data.moveBy === 1) {
      swal({
        title: "HAHAHAHAHAHAHAHAHAHA!",
        text: `THE BOT BEAT YOU! SERIOUSLY!?`,
        icon: "error",
        timer: 3000,
      }).then(value => Game.do('RESET'))
    } else {
      swal({
        title: "Awesome!",
        text: `Player ${data.moveBy+1} wins!`,
        icon: "success",
        timer: 3000,
      }).then(value => Game.do('RESET'))
    }
    
  } else if (Game.is('CHECKING')) {
    
    if (isVictory(data.board, data.moveBy)) {
      Game.do('WIN')
    } else if (isFull(data.board)) {
      swal({
        title: "It's a draw!",
        text: `Let's play another game!`,
        icon: "success",
        timer: 3000,
      }).then(value => Game.do('RESET'))
    } else {
      if (Game.get('moveBy')) {
        // If player 2 moved last
        Game.do('TO_PLAYER1')
      } else {
        // If player 1 moved last
        Game.do('TO_PLAYER2')
      }
    }
    
  } else if (Game.is('PLAYER2_TURN') && data.mode === MODE_SINGLE && !isFull(data.board)) {
    Game.do('MOVE')
  }
})

export default Game