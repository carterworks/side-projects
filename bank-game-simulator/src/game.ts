export interface GameConfig {
    playerCount: number;
    rounds: number;
}

export interface GameResults {
    winningPlayerNumber: number;
}

interface GameState {
    scores: number[];
}

function playRound(currentState: GameState): GameState {
    return { ...currentState };
}

export function play(config: GameConfig): GameResults {
    const results = { winningPlayerNumber: 1 };
    // for each round, play round
    //
    return results;
}
