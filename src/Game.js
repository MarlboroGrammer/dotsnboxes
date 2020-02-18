import React from 'react';
import { Square, Side } from './Square'
import firebase from './firebase'

class Game extends React.Component {
    // game config
    GRID_SIZE = 4
    HEIGHT = 500

    WIDTH = this.HEIGHT * 0.9
    CELL = this.WIDTH / (this.GRID_SIZE + 2)
    STROKE = this.CELL * 0.08
    MARGIN = this.HEIGHT - (this.GRID_SIZE + 1) * this.CELL

    constructor(props) {
        super(props)
        console.log(this.props.game || 'New game')
        this.state = {
            isPlayerOneTurn: true,
            squares: [],
            isNewGame: this.props.game ? false : true,
            gameId: this.props.game ? this.props.game.id : null,
            gameOver: false,
            refreshRate: 1000 / 30, // 30 fps
            currentCell: [],
            playerOne: {
                name: this.props.game ? this.props.game.playerOne.name : this.props.playerOne,
                score: this.props.game ? this.props.game.playerOne.score : 0
            },
            playerTwo: {
                name: this.props.game ? this.props.game.playerTwo.name : this.props.playerTwo,
                score: this.props.game ? this.props.game.playerTwo.score : 0
            },
            winner: {}
        }
        this.highlightGrid = this.highlightGrid.bind(this)
        this.selectSide = this.selectSide.bind(this)
    }

    saveGame(squares) {
        if (!this.state.gameId) {
            firebase
                .getInstance()
                .firestore()
                .collection('game')
                .add({
                    id: this.state.gameId || null,
                    playerOne: this.state.playerOne,
                    playerTwo: this.state.playerTwo,
                    game_over: this.state.gameOver,
                    squares: squares
                }).then((docRef) => {
                    this.setState({ gameId: docRef.id })
                })
        }
        else {
            firebase
                .getInstance()
                .firestore()
                .collection('game')
                .doc(this.state.gameId)
                .update({
                    id: this.state.gameId || null,
                    playerOne: this.state.playerOne,
                    playerTwo: this.state.playerTwo,
                    game_over: this.state.gameOver,
                    squares: squares
                })
        }

    }

    loadGame() {
        console.log('Load game called')
        let c = 0
        let squares = []
        for (let i = 0; i < this.GRID_SIZE; i++) {
            squares[i] = []
            for (let j = 0; j < this.GRID_SIZE; j++) {
                if (this.props.game) {
                    squares[i][j] = Object.assign(new Square(), JSON.parse(this.props.game.squares[c].square))
                }
                c++
            }
        }
        this.setState({ squares: squares })
    }


    componentDidMount() {
        console.log('Mounted')
        this.canvas = this.refs.canvas
        this.canvasContext = this.canvas.getContext("2d")
        this.canvasContext.lineWidth = this.STROKE
        //initiate game
        if (this.state.isNewGame) this.newGame()
        else if (this.props.game) this.loadGame()

        this.canvas.addEventListener("mousemove", this.highlightGrid)
        this.canvas.addEventListener("click", this.selectSide)

        setInterval(() => {
            this.draw()
        }, this.state.refreshRate)

    }
    componentWillUnmount() {
        this.canvas.removeEventListener("mousemove")
        this.canvas.removeEventListener("click")
    }
    highlightGrid(/** @type {MouseEvent}*/ e) {

        let x = e.clientX - this.canvas.getBoundingClientRect().left
        let y = e.clientY - this.canvas.getBoundingClientRect().top

        let _squares = this.state.squares
        let rows = _squares.length
        let cols = _squares[0].length

        //highlight event
        //label the loop to break
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                _squares[i][j].highlighted = null
            }
        }

        this.setState({ currentCell: [] })
        //label the loop to break
        OUTER: for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (_squares[i][j].hasMouseOver(x, y)) {
                    _squares[i][j].highlight(x, y)

                    if (_squares[i][j].highlighted != null) {
                        this.setState({ currentCell: [...this.state.currentCell, { row: i, col: j }] })
                    }

                    // find neighbor to avoid highlighting neighbors
                    let _row = i, _col = j, currentHightLight, isNeighbor = true;
                    if (_squares[i][j].highlighted === Side.left && j > 0) {
                        _col = j - 1
                        currentHightLight = Side.right
                    }
                    else if (_squares[i][j].highlighted === Side.right && j < cols - 1) {
                        _col = j + 1
                        currentHightLight = Side.left
                    }
                    else if (_squares[i][j].highlighted === Side.top && i > 0) {
                        _row = i - 1
                        currentHightLight = Side.bottom
                    }
                    else if (_squares[i][j].highlighted === Side.bottom && i < rows - 1) {
                        _row = i + 1
                        currentHightLight = Side.top
                    } else {
                        isNeighbor = false
                    }

                    if (isNeighbor) {
                        _squares[_row][_col].highlighted = currentHightLight
                        this.setState({ currentCell: [...this.state.currentCell, { row: _row, col: _col }] })
                    }
                    break OUTER
                }
            }
        }

        this.setState({ squares: _squares })
    }
    selectSide(/** @type {MouseEvent}*/ e) {
        if (!this.state.currentCell || !this.state.currentCell.length) {
            return
        }

        let squareIsFull = false
        let squareOwner = null
        for (let cell of this.state.currentCell) {
            if (this.state.squares[cell.row][cell.col].selectSide(this.state.isPlayerOneTurn)) {
                squareIsFull = true
                squareOwner = this.state.squares[cell.row][cell.col].owner
            }
        }

        //check for winner
        if (squareIsFull) {
            if (squareOwner) {
                let { playerOne } = this.state
                playerOne.score++
                this.setState({ playerOne: playerOne })
            } else {
                let { playerTwo } = this.state
                playerTwo.score++
                this.setState({ playerTwo: playerTwo })
            }
            //handle game over
            console.log(this.state.playerOne.score + this.state.playerTwo.score)
            if (this.state.playerOne.score + this.state.playerTwo.score === this.GRID_SIZE * this.GRID_SIZE) {
                let winner = {}
                if (this.state.playerOne.score > this.state.playerTwo.score) {
                    winner = this.state.playerOne
                } else if (this.state.playerOne.score < this.state.playerTwo.score) {
                    winner = this.state.playerTwo
                }
                this.setState({ winner: winner })
                this.setState({ gameOver: true, winner: winner })
            }
        } else {
            //Next turm
            this.setState({ isPlayerOneTurn: !this.state.isPlayerOneTurn })
        }
        this.setState({ currentCell: [] })
        let fbSquares = []
        for (let i = 0; i < this.GRID_SIZE; i++) {
            for (let j = 0; j < this.GRID_SIZE; j++) {
                fbSquares.push({
                    square: JSON.stringify(this.state.squares[i][j])
                })
            }
        }
        this.saveGame(fbSquares)
    }
    drawGameOver() {
        let text = this.state.winner ? `${this.state.winner.name} Wins!` : 'Tie'
        this.drawText(this.WIDTH / 3.5, this.HEIGHT / 2, this.CELL / 4, text, 'black')
    }
    newGame() {
        console.log('New game Called!')
        let _squares = []
        this.setState({ squares: [] })
        this.setState({ isPlayerOneTurn: true })
        //initiate players
        let { playerOne, playerTwo } = this.state
        playerOne.score = 0
        playerTwo.score = 0
        this.setState({ playerOne: playerOne, playerTwo: playerTwo, winner: {}, gameOver: false })

        let fireBaseSquares = []
        for (let i = 0; i < this.GRID_SIZE; i++) {
            _squares[i] = []
            for (let j = 0; j < this.GRID_SIZE; j++) {
                _squares[i][j] = new Square(
                    this.getGridX(j),
                    this.getGridY(i),
                    this.CELL,
                    this.CELL
                )
                fireBaseSquares.push(
                    JSON.stringify(_squares[i][j])
                )
            }
        }
        this.setState({ squares: _squares }, this.saveGame(fireBaseSquares))

    }
    drawText(x, y, size, text, color) {
        this.canvasContext.fillStyle = color
        this.canvasContext.font = `${size}px Arial`;
        this.canvasContext.fillText(text, x, y)
    }
    drawSquareFill(square) {
        this.canvasContext.fillStyle = this.getColor(square.owner, true)
        this.canvasContext.fillRect(
            square.left + this.STROKE * 0.5, square.top + this.STROKE * 0.5,
            square.w - this.STROKE * 0.8, square.h - this.STROKE
        )
        //text part
        this.drawText(square.left + square.w / 4.5,
            square.top + square.h / 2,
            this.CELL / 6,
            square.owner ? this.state.playerOne.name : this.state.playerTwo.name,
            this.getColor(square.owner, false)
        )

    }
    getColor(playerOne, light) {
        if (playerOne) {
            if (light) return 'lightblue'
            return 'blue'
        }
        if (light) return 'lightcoral'
        return 'red'
    }

    drawLine(x0, y0, x1, y1, color) {
        this.canvasContext.strokeStyle = color
        this.canvasContext.beginPath()
        this.canvasContext.moveTo(x0, y0)
        this.canvasContext.lineTo(x1, y1)
        this.canvasContext.stroke()
    }
    drawSide(square, side, color) {
        switch (side) {
            case Side.top:
                this.drawLine(square.left, square.top, square.right, square.top, color)
                break
            case Side.right:
                this.drawLine(square.right, square.top, square.right, square.bottom, color)
                break
            case Side.left:
                this.drawLine(square.left, square.top, square.left, square.bottom, color)
                break
            case Side.bottom:
                this.drawLine(square.left, square.bottom, square.right, square.bottom, color)
                break
            default:
                return
        }
    }
    drawSides(square) {
        //highlight
        if (square.highlighted) {
            this.drawSide(square, square.highlighted, this.getColor(this.state.isPlayerOneTurn, true))
        }
        //selected side
        if (square.sideBottom.selected) {
            this.drawSide(square, Side.bottom, this.getColor(square.sideBottom.owner, false));
        }
        if (square.sideLeft.selected) {
            this.drawSide(square, Side.left, this.getColor(square.sideLeft.owner, false));
        }
        if (square.sideRight.selected) {
            this.drawSide(square, Side.right, this.getColor(square.sideRight.owner, false));
        }
        if (square.sideTop.selected) {
            this.drawSide(square, Side.top, this.getColor(square.sideTop.owner, false));
        }
    }

    drawScore(square) {
        let plyrOneScrClr = this.state.isPlayerOneTurn ? this.getColor(true, false) :
            this.getColor(true, true)
        let plyrTwoScrClr = !this.state.isPlayerOneTurn ? this.getColor(false, false) :
            this.getColor(false, true)
        this.drawText(this.WIDTH * 0.12, this.MARGIN * 0.3, this.CELL / 2.75, this.state.playerOne.name, plyrOneScrClr)
        this.drawText(this.WIDTH * 0.12, this.MARGIN * 0.6, this.CELL / 2.75, this.state.playerOne.score, plyrOneScrClr)
        this.drawText(this.WIDTH * 0.65, this.MARGIN * 0.3, this.CELL / 2.75, this.state.playerTwo.name, plyrTwoScrClr)
        this.drawText(this.WIDTH * 0.65, this.MARGIN * 0.6, this.CELL / 2.75, this.state.playerTwo.score, plyrTwoScrClr)
    }
    draw() {
        //Draw the board
        this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        this.canvasContext.strokeStyle = 'black'
        this.canvasContext.strokeRect(this.STROKE / 2, this.STROKE / 2, this.WIDTH - this.STROKE, this.HEIGHT - this.STROKE)

        if (this.state.gameOver) {
            this.drawGameOver()
            return
        }

        //Draw the squares for the lines to show
        for (let rows of this.state.squares) {
            for (let square of rows) {
                this.drawSides(square)
                //Draw the fill
                if (square.owner !== null) {
                    this.drawSquareFill(square)
                }
            }
        }
        //Draw the grid
        for (let i = 0; i < this.GRID_SIZE + 1; i++) {
            for (let j = 0; j < this.GRID_SIZE + 1; j++) {
                //Draw the dots
                this.canvasContext.fillStyle = 'black'
                this.canvasContext.beginPath()
                this.canvasContext.arc(this.getGridX(j), this.getGridY(i), this.STROKE * 1.25, 0, Math.PI * 2)
                this.canvasContext.fill()
            }
        }

        //Draw the score
        this.drawScore()


    }
    getGridX(col) {
        return this.CELL * (col + 1)
    }

    getGridY(row) {
        return this.MARGIN + this.CELL * row
    }

    render() {
        return (
            <div className="Game">
                <h1>Dot and Boxes</h1>
                <canvas ref="canvas" width={this.WIDTH} height={this.HEIGHT} />
            </div>
        );
    }
}

export default Game;
