const ws = new WebSocket('ws://localhost:3000');
let gameState = null;
let selectedCharacter = null;
let selectedPosition = null;

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'game_state') {
        gameState = message.gameState;
        renderGameState();
    } else if (message.type === 'invalid_move') {
        alert(message.message);
    } else if (message.type === 'game_over') {
        alert(`Game Over! Player ${message.winner} wins!`);
        showGameOverScreen(message.winner);
    } else if (message.type === 'new_game') {
        gameState = message.gameState;
        renderGameState();
    }
};

function renderGameState() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    gameState.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = rowIndex;
            cellElement.dataset.col = colIndex;
            if (cell) {
                cellElement.innerText = cell;
                const [player] = cell.split('-');
                cellElement.classList.add(player);
            }
            boardElement.appendChild(cellElement);
        });
    });

    const statusElement = document.getElementById('status');
    statusElement.innerText = `Turn: Player ${gameState.turn}`;
}

document.getElementById('board').addEventListener('click', (e) => {
    if (!e.target.classList.contains('cell')) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cellContent = gameState.board[row][col];
    
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected'));

    if (cellContent && cellContent.startsWith(gameState.turn)) {
        // Select the character
        selectedCharacter = cellContent.split('-')[1];
        selectedPosition = { row, col };
        showMoveOptions(selectedCharacter);
        e.target.classList.add('selected');
    } else if (selectedCharacter) {
        const moveDirection = getMoveDirection(selectedPosition, { row, col });
        if (moveDirection) {
            ws.send(JSON.stringify({
                type: 'move',
                player: gameState.turn,
                character: selectedCharacter,
                move: moveDirection
            }));
            selectedCharacter = null;
            selectedPosition = null;
        } else {
            alert('Invalid move!');
        }
    }
});

function getMoveDirection(start, end) {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    if (rowDiff === 0 && colDiff === -1) return 'L';
    if (rowDiff === 0 && colDiff === 1) return 'R';
    if (rowDiff === -1 && colDiff === 0) return 'F';
    if (rowDiff === 1 && colDiff === 0) return 'B';
    if (rowDiff === -1 && colDiff === -1) return 'FL';
    if (rowDiff === -1 && colDiff === 1) return 'FR';
    if (rowDiff === 1 && colDiff === -1) return 'BL';
    if (rowDiff === 1 && colDiff === 1) return 'BR';
    
    return null;
}

function showGameOverScreen(winner) {
    const gameElement = document.getElementById('game');
    gameElement.innerHTML = `<h1>Player ${winner} Wins!</h1>`;
}

document.getElementById('startGame').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'start_game' }));
    selectedCharacter = null;
    selectedPosition = null;
});
