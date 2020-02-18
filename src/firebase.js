import firebase from 'firebase/app'
import 'firebase/firestore'

var firebaseConfig = {
    apiKey: "AIzaSyBtEqI-ElvqNgTruL547UynIsiZgYcqZUw",
    authDomain: "dotsnboxes-e788a.firebaseapp.com",
    databaseURL: "https://dotsnboxes-e788a.firebaseio.com",
    projectId: "dotsnboxes-e788a",
    storageBucket: "dotsnboxes-e788a.appspot.com",
    messagingSenderId: "258688924479",
    appId: "1:258688924479:web:06e86ead685f08ce16318a"
};

class FireBase {

    constructor () {
        if (!this.firebase)
            this.firebase = firebase.initializeApp(firebaseConfig);
    }

    getInstance () {
        return this.firebase
    }
}

const fbase = Object.freeze(new FireBase())
export default fbase