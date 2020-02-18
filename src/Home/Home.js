import React from 'react';
import './Home.css';

import Game from '../Game'
import List from '../List/List'

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            state: 'IDLE',
            playerOne: 'a',
            playerTwo: 'b',
            currentGame: null
        }
        this.setPlayerOne = this.setPlayerOne.bind(this)
        this.setPlayerTwo = this.setPlayerTwo.bind(this)
        this.submitNames = this.submitNames.bind(this)
        this.startGame = this.startGame.bind(this)
        this.continue = this.continue.bind(this)
    }

    setPlayerOne = (e) => {
        this.setState({ playerOne: e.target.value })
    }
    setPlayerTwo = (e) => {
        this.setState({ playerTwo: e.target.value })
    }
    submitNames = () => {
        this.setState({ state: 'SELECT' })
    }
    startGame = () => {
        this.setState({ state: 'START' })
    }
    continue = (game) => {
        this.setState({game: game})
        this.setState({ state: 'START' })
    }

    render() {
        let home = () => {
            return (
                <div className="Home container">
                    <h1>Dot and Boxes</h1>
                    <label>Player one&nbsp;</label>
                    <input type="text" name="playerone" value={this.state.playerOne} onChange={this.setPlayerOne} className="form-control"/><br />
                    <label>Player Two&nbsp;</label>
                    <input type="text" name="playertwo" value={this.state.playerTwo} onChange={this.setPlayerTwo} className="form-control" />
                    <button
                        className="btn btn-primary start"
                        disabled={this.state.playerOne === '' || this.state.playerTwo === ''}
                        onClick={this.submitNames}

                    >Start</button>
                </div>
            )
        }
        return (
            <div className="game">
                {this.state.state === 'IDLE' ? home() : this.state.state === 'SELECT' ?
                    <List startGame={() => this.startGame() } continue={this.continue}/> 
                    : 
                    <Game playerOne={this.state.playerOne} playerTwo={this.state.playerTwo} game={this.state.game} />
                }
            </div>

        );
    }
}

export default Home