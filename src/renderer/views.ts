/*
 * Copyright (C) 2024 Christoph Koschel - All Rights Reserved
 *
 * You may use, distribute, and modify this code under the
 * terms of the MIT license, which can be found
 * in the accompanying LICENSE.txt.
 *
 * You should have received a copy of the MIT license
 * along with this file. If not, please visit https://github.com/Christoph-Koschel/tetris-arcade-machine.
 */

import {View} from "./view";
import {Selectable} from "./components/selectable";
import {TetrisAnimation} from "./components/tetrisAnimation";
import {Option} from "./components/option";
import scoreBoard, {GameStats, ScoreBoardEntry} from "./scoreBoard";
import {GamePlay, GameType} from "./gamePlay";
import controller from "./playerController";
import {
    GameSettings, getCurrentGameControls,
    getCurrentGameMode,
    PlayerControls,
    PlayerModes, setCurrentGameControls,
    setCurrentGameMode,
    setRandomSprite
} from "./game";
import {RenderLayers} from "./game/rendering";

// region MainMenu
new (class _ extends View {
    private root: HTMLElement;
    private panel: HTMLElement;
    private singlePlayerBTN: Selectable;
    private multiPlayerBTN: Selectable
    private scoreBoard: HTMLDivElement;
    private logo: HTMLImageElement;
    private animation: TetrisAnimation;


    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "main-menu";

        this.singlePlayerBTN = new Selectable("Singleplayer", "main");
        this.singlePlayerBTN.setOnClick(() => {
            View.loadWithGroup("preSinglePlayer", "preSinglePlayer");
        });
        this.multiPlayerBTN = new Selectable("Multiplayer", "main");
        this.multiPlayerBTN.setOnClick(() => {
            View.loadWithGroup("preMultiPlayer", "preMultiPlayer");
        });

        this.panel = document.createElement("div");
        this.panel.classList.add("panel");

        this.logo = document.createElement("img");
        this.logo.src = "assets/sprites/logo.png";

        this.scoreBoard = document.createElement("div");

        this.animation = new TetrisAnimation("50%", "0", "50%", "100%", 12);

        this.panel.appendChild(this.singlePlayerBTN.root);
        this.panel.appendChild(this.multiPlayerBTN.root);
        this.panel.appendChild(this.scoreBoard);
        this.root.appendChild(this.panel);
        this.root.appendChild(this.logo);
        this.root.appendChild(this.animation.root);
    }

    public onAppend(root: HTMLElement): void {
        this.setScoreBoardText();

        root.appendChild(this.root);

        this.animation.start();
    }

    public onDestroy(): void {
        this.animation.stop();
    }

    private setScoreBoardText(): void {
        this.scoreBoard.innerHTML = "";
        let scores: ScoreBoardEntry[] = scoreBoard.getScores().sort((a, b) => a.value < b.value ? 1 : -1);

        for (let i: number = 0; i < 10; i++) {
            let item: ScoreBoardEntry = scores[i];

            let row: HTMLElement = document.createElement("div");
            let c1: HTMLElement = document.createElement("span");
            c1.innerHTML = (i + 1) + ". " + (item?.name || "");
            let c2: HTMLElement = document.createElement("span");
            c2.innerHTML = item?.value.toString() || "";
            row.appendChild(c1);
            row.appendChild(c2);
            this.scoreBoard.appendChild(row);
        }
    }
})("mainMenu");
// endregion

// region MultiPlayer
new (class _ extends View {
    private p1Game: GamePlay;
    private p2Game: GamePlay;

    private root: HTMLDivElement;
    private panel1: HTMLElement;
    private panel2: HTMLElement;
    private p1Grid: HTMLCanvasElement;
    private p1Movable: HTMLCanvasElement;
    private p1Sealed: HTMLCanvasElement;
    private p1Preview: HTMLCanvasElement;
    private p1PreviewGrid: HTMLCanvasElement;
    private p2Grid: HTMLCanvasElement;
    private p2Movable: HTMLCanvasElement;
    private p2Sealed: HTMLCanvasElement;
    private p2Preview: HTMLCanvasElement;
    private p2PreviewGrid: HTMLCanvasElement;

    private p1Layers: RenderLayers;
    private p2Layers: RenderLayers;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "multi-player";

        this.panel1 = document.createElement("div");
        this.panel2 = document.createElement("div");

        this.p1Grid = document.createElement("canvas");
        this.p1Grid.height = 900;
        this.p1Grid.width = 500;
        this.p1Movable = document.createElement("canvas");
        this.p1Movable.height = 900;
        this.p1Movable.width = 500;
        this.p1Sealed = document.createElement("canvas");
        this.p1Sealed.height = 900;
        this.p1Sealed.width = 500;
        this.p1Preview = document.createElement("canvas");
        this.p1Preview.height = 900;
        this.p1Preview.width = 500;
        this.p1PreviewGrid = document.createElement("canvas");
        this.p1PreviewGrid.height = 900;
        this.p1PreviewGrid.width = 500;

        this.p2Grid = document.createElement("canvas");
        this.p2Grid.height = 900;
        this.p2Grid.width = 500;
        this.p2Movable = document.createElement("canvas");
        this.p2Movable.height = 900;
        this.p2Movable.width = 500;
        this.p2Sealed = document.createElement("canvas");
        this.p2Sealed.height = 900;
        this.p2Sealed.width = 500;
        this.p2Preview = document.createElement("canvas");
        this.p2Preview.height = 900;
        this.p2Preview.width = 500;
        this.p2PreviewGrid = document.createElement("canvas");
        this.p2PreviewGrid.height = 900;
        this.p2PreviewGrid.width = 500;

        this.p1Layers = {
            grid: this.p1Grid.getContext("2d"),
            movable: this.p1Movable.getContext("2d"),
            sealed: this.p1Sealed.getContext("2d"),
            preview: this.p1Preview.getContext("2d"),
            previewGrid: this.p1PreviewGrid.getContext("2d")
        }
        this.p2Layers = {
            grid: this.p2Grid.getContext("2d"),
            movable: this.p2Movable.getContext("2d"),
            sealed: this.p2Sealed.getContext("2d"),
            preview: this.p2Preview.getContext("2d"),
            previewGrid: this.p2PreviewGrid.getContext("2d")
        }

        this.p1Game = new GamePlay(this.p1Layers);
        this.p2Game = new GamePlay(this.p2Layers);

        this.p1Game.setGameType(GameType.MULTIPLAYER);
        this.p1Game.bind(this.p2Game);
        this.p1Game.isPlayer1 = true;
        this.p2Game.setGameType(GameType.MULTIPLAYER);
        this.p2Game.bind(this.p1Game);
        this.p2Game.isPlayer1 = false;

        this.p1Game.start();
        this.p2Game.start();

        this.panel1.appendChild(this.p1Grid);
        this.panel1.appendChild(this.p1Movable);
        this.panel1.appendChild(this.p1Sealed);

        this.panel2.appendChild(this.p2Grid);
        this.panel2.appendChild(this.p2Movable);
        this.panel2.appendChild(this.p2Sealed);

        this.root.appendChild(this.panel1);
        this.root.appendChild(this.panel2);
    }

    public onAppend(root: HTMLElement): void {
        this.p1Game.reset(this.buildSettings());
        this.p2Game.reset(this.buildSettings());

        controller.disable();
        root.appendChild(this.root);

        let countDown: number = 5;
        let countDownElement: HTMLHeadingElement = document.createElement("h1");
        countDownElement.style.position = "absolute";
        countDownElement.style.top = "40%";
        countDownElement.style.left = "50%";
        countDownElement.style.transform = "translate(-50%, -50%)";
        countDownElement.style.fontSize = "15rem";
        countDownElement.style.color = "white";
        countDownElement.style.fontFamily = "PixelifySans";

        document.body.appendChild(countDownElement);
        countDownElement.innerHTML = countDown.toString();

        const interval: NodeJS.Timeout = setInterval(() => {
            if (countDown == 0) {
                countDownElement.remove();
                this.p1Game.enable();
                this.p2Game.enable();

                this.p1Game.loop();
                this.p2Game.loop();
                clearInterval(interval);

            }
            countDown--;
            countDownElement.innerHTML = countDown.toString();
        }, 1000);
    }

    public onDestroy(): void {
        this.p1Game.send();
        this.p2Game.send();

        this.p1Game.disable();
        this.p2Game.disable();
        controller.enable();
    }

    private buildSettings(): GameSettings {
        switch (getCurrentGameMode()) {
            case PlayerModes.HARD:
                setRandomSprite(true);
                return {
                    levelMultiplier: 2,
                    speedMultiplier: 1.4,
                    movablePrediction: false,
                    randomColors: true,
                }
            case PlayerModes.MEDIUM:
                setRandomSprite(false);
                return {
                    levelMultiplier: 1.5,
                    speedMultiplier: 1.2,
                    movablePrediction: false,
                    randomColors: false,
                }
            case PlayerModes.EASY:
                setRandomSprite(false);
                return {
                    levelMultiplier: 1,
                    speedMultiplier: 1,
                    movablePrediction: true,
                    randomColors: false,
                }
        }
    }

})("multiPlayer");
// endregion

// region PreMultiPlayer
new (class _ extends View {
    private root: HTMLDivElement;
    private panel1: HTMLElement;
    private panel2: HTMLElement;
    private heading1: HTMLElement;
    private heading2: HTMLElement;
    private readyP1: Selectable;
    private readyP2: Selectable;
    private backBTN: Selectable;

    private p1IsReady: boolean;
    private p2IsReady: boolean;

    public onBuild(): void {
        this.p1IsReady = false;
        this.p2IsReady = false;

        this.root = document.createElement("div");
        this.root.id = "pre-multi-player";

        this.panel1 = document.createElement("div");
        this.panel1.classList.add("panel")
        this.panel2 = document.createElement("div");
        this.panel2.classList.add("panel")

        this.heading1 = document.createElement("h1");
        this.heading1.innerHTML = "Player 1";

        this.heading2 = document.createElement("h1");
        this.heading2.innerHTML = "Player 2";

        this.readyP1 = new Selectable("Ready", "preMultiPlayer");
        this.readyP1.setOnClick(() => {
            this.p1IsReady = !this.p1IsReady;
            this.readyP1.root.innerHTML = this.p1IsReady ? "Not Ready" : "Ready";
            if (this.p1IsReady && this.p2IsReady) {
                View.load("multiPlayer");
            }
        });
        this.readyP2 = new Selectable("Ready", "preMultiPlayer");
        this.readyP2.setOnClick(() => {
            this.p2IsReady = !this.p2IsReady;
            this.readyP2.root.innerHTML = this.p2IsReady ? "Not Ready" : "Ready";
            if (this.p1IsReady && this.p2IsReady) {
                View.load("multiPlayer");
            }
        });

        this.backBTN = new Selectable("Back", "preMultiPlayer");
        this.backBTN.setOnClick(() => {
            View.loadWithGroup("mainMenu", "main");
        });

        this.panel1.appendChild(this.heading1);
        this.panel1.appendChild(this.readyP1.root);
        this.panel1.appendChild(this.backBTN.root);

        this.panel2.appendChild(this.heading2);
        this.panel2.appendChild(this.readyP2.root);

        this.root.appendChild(this.panel1);
        this.root.appendChild(this.panel2);
    }

    public onAppend(root: HTMLElement): void {
        root.appendChild(this.root);
    }

    public onDestroy(): void {
        this.p2IsReady = false;
        this.readyP2.root.innerHTML = "Ready";
        this.p1IsReady = false;
        this.readyP1.root.innerHTML = "Ready";
    }

})("preMultiPlayer");
// endregion

// region PreSinglePlayer
new (class _ extends View {
    private root: HTMLElement;
    private panel: HTMLElement;
    private playerMode: Option<PlayerModes>;
    private playerControl: Option<PlayerControls>;
    private backBTN: Selectable;
    private playBTN: Selectable;
    private animation: TetrisAnimation;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "pre-single-player";

        this.playerMode = new Option<PlayerModes>([PlayerModes.EASY, PlayerModes.MEDIUM, PlayerModes.HARD], "preSinglePlayer");
        this.playerControl = new Option<PlayerControls>([PlayerControls.PLAYER_1, PlayerControls.PLAYER_2], "preSinglePlayer");

        this.backBTN = new Selectable("Zurück", "preSinglePlayer");
        this.backBTN.setOnClick(() => {
            View.loadWithGroup("mainMenu", "main");
        });
        this.playBTN = new Selectable("Play", "preSinglePlayer");
        this.playBTN.setOnClick(() => {
            setCurrentGameMode(this.playerMode.current);
            setCurrentGameControls(this.playerControl.current);
            View.load("singlePlayer");
        });

        this.panel = document.createElement("div");
        this.panel.classList.add("panel");

        this.animation = new TetrisAnimation("50%", "0", "50%", "100%", 12);

        let row: HTMLDivElement = document.createElement("div");
        row.classList.add("row");


        row.appendChild(this.backBTN.root);
        row.appendChild(this.playBTN.root);
        this.panel.appendChild(this.playerMode.root);
        this.panel.appendChild(this.playerControl.root);
        this.panel.appendChild(row);
        this.root.appendChild(this.panel);

        this.root.appendChild(this.animation.root);
    }

    public onAppend(root: HTMLElement): void {
        root.appendChild(this.root);
        this.animation.start();
    }

    public onDestroy(): void {
        this.animation.stop();
    }

})("preSinglePlayer");
// endregion

// region ScoreboardWriter
interface CharCom {
    btn: Selectable;
    prev: HTMLHeadingElement;
    counter: number;
}

new (class _ extends View {
    private root: HTMLElement;
    private panel: HTMLElement;
    private scoreText: HTMLHeadingElement;
    private row1: HTMLElement;
    private characters: CharCom[];
    private row2: HTMLElement;
    private save: Selectable;
    private noSave: Selectable;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "scoreboard-writer";

        this.panel = document.createElement("div");

        this.scoreText = document.createElement("h1");
        this.row1 = document.createElement("div");

        const VALID_CHARACTERS: string[] = [
            " ", "A", "B", "C", "D", "E", "F",
            "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T",
            "U", "V", "W", "X", "Y", "Z", "0",
            "1", "2", "3", "4", "5", "6", "7",
            "8", "9"
        ];

        this.characters = Array.from({length: 5}, v => {
            const res = {
                counter: 0,
                btn: null,
                prev: null
            } as CharCom;
            res.prev = document.createElement("h1");
            res.prev.innerHTML = VALID_CHARACTERS[0];

            res.btn = new Selectable("", "scoreBoardWriter");
            res.btn.setOnClick(() => {
                res.counter++;
                if (res.counter >= VALID_CHARACTERS.length) {
                    res.counter = 0;
                }
                res.prev.innerHTML = VALID_CHARACTERS[res.counter];
            });

            return res;
        });

        this.row2 = document.createElement("div");
        this.noSave = new Selectable("Back", "scoreBoardWriter");
        this.noSave.setOnClick(() => {
            View.loadWithGroup("mainMenu", "main");
        });
        this.save = new Selectable("Save", "scoreBoardWriter");
        this.save.setOnClick(() => {
            const str: string = this.characters.map(n => n.prev.innerHTML).join("");
            scoreBoard.save(str);
            View.loadWithGroup("mainMenu", "main");
        });

        this.characters.forEach(n => this.row1.appendChild(n.btn.root).appendChild(n.prev));
        this.row2.appendChild(this.noSave.root);
        this.row2.appendChild(this.save.root);
        this.panel.appendChild(this.scoreText);
        this.panel.appendChild(this.row1);
        this.panel.appendChild(this.row2);
        this.root.appendChild(this.panel);
    }

    public onAppend(root: HTMLElement): void {
        this.scoreText.innerHTML = scoreBoard.getUnknown().toString();

        root.appendChild(this.root);
    }

    public onDestroy(): void {
        this.characters.forEach(n => {
            n.prev.innerHTML = " ";
            n.counter = 0
        });
    }
})("scoreBoardWriter");
// endregion

// region SinglePlayer
new (class _ extends View {
    private root: HTMLElement;
    private grid: HTMLCanvasElement;
    private movable: HTMLCanvasElement;
    private sealed: HTMLCanvasElement;
    private previewGrid: HTMLCanvasElement;
    private preview: HTMLCanvasElement;
    private relativRect: HTMLDivElement;
    private pointBoard: HTMLDivElement;
    private scoreText: HTMLHeadingElement;
    private layers: RenderLayers;
    private game: GamePlay;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "single-player";
        this.grid = document.createElement("canvas");
        this.grid.height = 900;
        this.grid.width = 500;

        this.movable = document.createElement("canvas");
        this.movable.height = 900;
        this.movable.width = 500;

        this.sealed = document.createElement("canvas");
        this.sealed.height = 900;
        this.sealed.width = 500;

        this.previewGrid = document.createElement("canvas");
        this.previewGrid.width = 200;
        this.previewGrid.height = 100;

        this.preview = document.createElement("canvas");
        this.preview.width = 200;
        this.preview.height = 100;

        this.relativRect = document.createElement("div");
        this.pointBoard = document.createElement("div");

        this.scoreText = document.createElement("h3");
        this.scoreText.innerHTML = "0".padStart(8, "0");

        this.layers = {
            grid: this.grid.getContext("2d"),
            movable: this.movable.getContext("2d"),
            sealed: this.sealed.getContext("2d"),
            preview: this.preview.getContext("2d"),
            previewGrid: this.previewGrid.getContext("2d")
        };

        this.game = new GamePlay(this.layers);
        this.game.setGameType(GameType.SINGLEPLAYER);
        this.game.onScoreUpdate = score => {
            this.scoreText.innerHTML = score.toString().padStart(8, "0");
        }
        this.game.start();

        this.pointBoard.appendChild(this.scoreText);
        this.pointBoard.appendChild(this.previewGrid);
        this.pointBoard.appendChild(this.preview);
        this.relativRect.appendChild(this.pointBoard);

        this.root.appendChild(this.relativRect);
        this.root.appendChild(this.grid);
        this.root.appendChild(this.movable);
        this.root.appendChild(this.sealed);
    }

    public onAppend(root: HTMLElement): void {
        this.game.reset(this.buildSettings());
        controller.disable();
        root.appendChild(this.root);

        this.game.isPlayer1 = getCurrentGameControls() == PlayerControls.PLAYER_1;

        let countDown: number = 5;
        let countDownElement: HTMLHeadingElement = document.createElement("h1");
        countDownElement.style.position = "absolute";
        countDownElement.style.top = "40%";
        countDownElement.style.left = "50%";
        countDownElement.style.transform = "translate(-50%, -50%)";
        countDownElement.style.fontSize = "15rem";
        countDownElement.style.color = "white";
        countDownElement.style.fontFamily = "PixelifySans";

        document.body.appendChild(countDownElement);
        countDownElement.innerHTML = countDown.toString();

        const interval: NodeJS.Timeout = setInterval(() => {
            if (countDown == 0) {
                countDownElement.remove();
                this.game.enable();
                this.game.loop();
                clearInterval(interval);

            }
            countDown--;
            countDownElement.innerHTML = countDown.toString();
        }, 1000);
    }

    public onDestroy(): void {
        this.game.disable();
        controller.enable();
    }

    private buildSettings(): GameSettings {
        switch (getCurrentGameMode()) {
            case PlayerModes.HARD:
                setRandomSprite(true);
                return {
                    levelMultiplier: 2,
                    speedMultiplier: 1.4,
                    movablePrediction: false,
                    randomColors: true,
                }
            case PlayerModes.MEDIUM:
                setRandomSprite(false);
                return {
                    levelMultiplier: 1.5,
                    speedMultiplier: 1.2,
                    movablePrediction: false,
                    randomColors: false,
                }
            case PlayerModes.EASY:
                setRandomSprite(false);
                return {
                    levelMultiplier: 1,
                    speedMultiplier: 1,
                    movablePrediction: true,
                    randomColors: false,
                }
        }
    }
})("singlePlayer");
// endregion

// region WinBoard
new (class _ extends View {
    private root: HTMLElement;
    private panel: HTMLElement;
    private winnerText: HTMLHeadingElement;
    private row1: HTMLElement;
    private row2: HTMLElement;
    private row3: HTMLElement;
    private continue: Selectable;
    private table: HTMLTableElement;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "win-board";

        this.panel = document.createElement("div");

        this.row1 = document.createElement("div");
        this.row2 = document.createElement("div");
        this.row3 = document.createElement("div");

        this.winnerText = document.createElement("h1");
        this.continue = new Selectable("Weiter", "winBoard");
        this.continue.setOnClick(() => {
            View.loadWithGroup("mainMenu", "main");
        });

        this.table = document.createElement("table");

        this.row1.appendChild(this.winnerText);
        this.row2.appendChild(this.table);
        this.row3.appendChild(this.continue.root);

        this.panel.appendChild(this.row1);
        this.panel.appendChild(this.row2);
        this.panel.appendChild(this.row3);
        this.root.appendChild(this.panel);
    }

    public onAppend(root: HTMLElement): void {
        let p1Stats: GameStats = scoreBoard.getStats(true);
        let p2Stats: GameStats = scoreBoard.getStats(false);

        this.winnerText.innerHTML = p1Stats.isLoser ? "Player 2 Wins" : "Player 1 Wins";

        this.table.innerHTML = `
        <tr>
            <td></td><td>Player 1</td><td>Player 2</td>
        </tr>
        <tr>
            <td>Lines cleared</td><td>${p1Stats.cleared}</td><td>${p2Stats.cleared}</td>
        </tr>
        <tr>
            <td>Level</td><td>${p1Stats.level}</td><td>${p2Stats.level}</td>
        </tr>
        <tr>
            <td>Points</td><td>${p1Stats.points}</td><td>${p2Stats.points}</td>
        </tr>
        `

        root.appendChild(this.root);
    }

    public onDestroy(): void {

    }
})("winBoard");
// endregion