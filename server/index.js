const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { processMove, initializeGame } = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('../client'));

let gameState = initializeGame();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'move') {
            const result = processMove(gameState, data);
            if (result.valid) {
                gameState = result.gameState;
                if (checkGameOver(gameState.board, data.player)) {
                    broadcastMessage({ type: 'game_over', winner: data.player });
                } else {
                    broadcastGameState();
                }
            } else {
                ws.send(JSON.stringify({ type: 'invalid_move', message: result.message }));
            }
        } else if (data.type === 'start_game') {
            gameState = initializeGame();
            ws.send(JSON.stringify({ type: 'new_game', gameState }));
        }
    });

    ws.send(JSON.stringify({ type: 'game_state', gameState }));
});

function broadcastGameState() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'game_state', gameState }));
        }
    });
}

function checkGameOver(board, player) {
    const opponent = player === 'A' ? 'B' : 'A';
    return !board.some(row => row.some(cell => cell.startsWith(opponent)));
}

function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
