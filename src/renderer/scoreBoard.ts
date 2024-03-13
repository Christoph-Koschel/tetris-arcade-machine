import * as fs from "fs";
import * as path from "path";

export interface ScoreBoardEntry {
    name: string;
    value: number;
}

export type GameStats = {
    cleared: number;
    points: number;
    level: number;
    isLoser: boolean;
}

/**
 * Wrapper class for storing scores in memory and harddisk.
 * Additionally, stores some temporary data that is needed between Views.
 * @class
 */
class ScoreBoard implements Iterable<ScoreBoardEntry> {
    private unknown: number;
    private scores: ScoreBoardEntry[];
    private player1Stats: GameStats;
    private player2Stats: GameStats;

    public constructor() {
        this.unknown = 0;
        this.scores = [];
        if (fs.existsSync(path.join(__dirname, "scores"))) {
            this.scores = JSON.parse(fs.readFileSync(path.join(__dirname, "scores"), "utf-8"));
        }
    }

    [Symbol.iterator](): Iterator<ScoreBoardEntry> {
        return this.scores[Symbol.iterator]();
    }

    public getScores(): ScoreBoardEntry[] {
        return this.scores;
    }

    public setUnknown(n: number): void {
        this.unknown = n;
    }

    public getUnknown(): number {
        return this.unknown;
    }

    public save(name: string): void {
        this.scores.push({
            name: name,
            value: this.unknown
        });
        this.scores = this.scores.sort((a, b) => a.value < b.value ? 1 : -1);
        if (this.scores.length > 10) {
            this.scores.pop();
        }
        fs.writeFileSync(path.join(__dirname, "scores"), JSON.stringify(this.scores));
    }

    public setStats(player1: boolean, stats: GameStats): void {
        player1 ? this.player1Stats = stats : this.player2Stats = stats;
    }

    public getStats(player1: boolean): GameStats {
        return player1 ? this.player1Stats : this.player2Stats;
    }
}

const scoreBoard: ScoreBoard = new ScoreBoard();

export default scoreBoard