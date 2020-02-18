import React, { useState, useEffect } from 'react'
import fbase from '../firebase'
import './List.css'

function useGames() {
    const [ games, setGames ] = useState([])

    useEffect(() => {
        fbase
            .getInstance()
            .firestore()
            .collection('game')
            .onSnapshot((snapshot) => {
                const newGames = snapshot.docs.map((doc) => {
                    return {
                        id: doc.id,
                        ...doc.data()
                    }
                })
                setGames(newGames)
            })
    }, [])

    return games;
}

const newGame = (props) => {
    return (
        <div>
            <h3>Up for a new game?</h3>
            <button onClick={props.startGame} className="btn btn-danger">Start new game</button>
        </div>
    )
}

const List = (props) => {

    const games = useGames()
    return (
        <div>
            <div className="container row List">
                <div className="col-md-6 col-sm-6">
                    {
                        games.length > 0 ? games.map(game => {
                            return (<div className="game" key={game.id}>
                                <h2>Game <p className="id">{game.id}</p></h2>
                                <p className="bracket">
                                    <span className="player-name">{game.playerOne.name+""}</span>
                                    <span className="player-name">&nbsp;vs.&nbsp;</span>
                                    <span className="player-name">{game.playerTwo.name+""}</span>
                                </p>
                                <p>
                                    Score: {parseInt(game.playerOne.score)} - {parseInt(game.playerTwo.score)}
                                </p> 
                                <button onClick={() => props.continue(game)} className="btn btn-info" hidden={game.game_over}>Continue</button>
                            </div>)
                        }) : <h3>No games available</h3>
                    }
                </div>
                <div className="col-md-6 col-sm-6">
                    {newGame(props)}
                </div>
            </div>
        </div>
    )
}

export default List