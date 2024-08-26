function initializeGame() {
    return {
        board: [
            ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
        ],
        turn: 'A',
        players: ['A', 'B']
    };
}

function processMove(gameState, data) {
    const { player, character, move } = data;
    if (gameState.turn !== player) {
        return { valid: false, message: 'Not your turn!' };
    }

    const { board } = gameState;
    const position = findCharacterPosition(board, player, character);
    if (!position) {
        return { valid: false, message: 'Invalid character!' };
    }

    const newPosition = calculateNewPosition(position, move, character);
    if (!isValidMove(board, position, newPosition, character, player, move)) {
        return { valid: false, message: 'Invalid move!' };
    }

    updateBoard(board, position, newPosition, player, character);
    gameState.turn = gameState.turn === 'A' ? 'B' : 'A';

    if (isGameOver(board, player)) {
        return { valid: true, gameState, message: `${player} wins!` };
    }

    return { valid: true, gameState };
}

function findCharacterPosition(board, player, character) {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === `${player}-${character}`) {
                return { row, col };
            }
        }
    }
    return null;
}

function calculateNewPosition(position, move, character) {
    const { row, col } = position;
    const directionMap = {
        'L': { row: 0, col: -1 },
        'R': { row: 0, col: 1 },
        'F': { row: -1, col: 0 },
        'B': { row: 1, col: 0 },
        'FL': { row: -1, col: -1 },
        'FR': { row: -1, col: 1 },
        'BL': { row: 1, col: -1 },
        'BR': { row: 1, col: 1 },
    };

    let moveVector = directionMap[move];
    let multiplier = 1;

    if (character === 'H1') {
        if (['L', 'R', 'F', 'B'].includes(move)) {
            multiplier = 2;
        } else {
            return position;
        }
    } else if (character === 'H2') {
        if (['FL', 'FR', 'BL', 'BR'].includes(move)) {
            multiplier = 2;
        } else {
            return position;
        }
    }

    return {
        row: row + (moveVector.row * multiplier),
        col: col + (moveVector.col * multiplier)
    };
}

function isValidMove(board, position, newPosition, character, player, move) {
    const { row, col } = newPosition;
    if (row < 0 || col < 0 || row >= board.length || col >= board[0].length) {
        return false;
    }

    const targetCell = board[row][col];

    if (character.startsWith('P')) {
        if (['FL', 'FR', 'BL', 'BR'].includes(move)) {
            return false;
        }
        if (targetCell) {
            return false;
        }
    } else if (character === 'H1' || character === 'H2') {
        if (targetCell && targetCell.startsWith(player)) {
            return false;
        }
    }

    return true;
}

function updateBoard(board, position, newPosition, player, character) {
    board[position.row][position.col] = '';
    if (board[newPosition.row][newPosition.col]) {
        board[newPosition.row][newPosition.col] = '';
    }
    board[newPosition.row][newPosition.col] = `${player}-${character}`;
}

function isGameOver(board, player) {
    const opponent = player === 'A' ? 'B' : 'A';
    return !board.some(row => row.some(cell => cell.startsWith(opponent)));
}

module.exports = { initializeGame, processMove };
