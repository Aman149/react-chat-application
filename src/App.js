import React, { useRef, useState } from 'react';
import './App.css';

// Firebase deps
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

//React firebase Hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//To identity our porject
firebase.initializeApp({
  apiKey: "AIzaSyBZWwpgjkYwD1n_mpRBOrWa5mCxKtJ9eAs",
  authDomain: "react-firechat-c1ccd.firebaseapp.com",
  projectId: "react-firechat-c1ccd",
  storageBucket: "react-firechat-c1ccd.appspot.com",
  messagingSenderId: "233081206675",
  appId: "1:233081206675:web:9afde3fa9300304cfa5a66"
});

//my global variables
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  
//Using useAuthStateHook to check if a user is signed in or Not
//It returns an object that has user id email address and other info
//When logged out the user object is NULL
  const [user] = useAuthState(auth);

  return (
    <div className='App'>

      <header>
        <img class="rotate" alt="logo" src='./logo192.png'/>
        <h2>Chat App</h2>
        <SignOut/>
      </header>

      <section>
        {user ? <ChatRoom/> : <SighIn/>}
      </section>

    </div>
  );
}


//Sign In Component
function SighIn() {

  //Arrow function to get sign in using googleauthprovider
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <>
    <button className="sign-in" onClick={signInWithGoogle}><img class="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"/>Sign in with google</button>
    </>
  )
}

//Sign out button
function SignOut() {
  //if user is logged in then we pass a log out button
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}
 
function ChatRoom() {

  //useref hook
  const dummy = useRef();

  //Reference to firestore collection in database
  const messagesRef = firestore.collection('messages');
  //Query for subset of documents, with timestamp with limit of 25
  const query = messagesRef.orderBy('createdAt').limit(50);

  //Listen to data in real time with usecollection data hook
  //It will return an array of object where each object is a chat message in Database
  const [messages] = useCollectionData(query, { idField: 'id' });
  //It reacts to change in realtime


  //We are doing it with use state hook
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    //To stop referesh of our page
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    //Create new Document in firebase
    //It takes a js object as argument
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({behavior: 'smooth'});

  }

  //Loop over each document
  return (<>
    <main>
      {messages && messages.map( msg => <ChatMessage key={msg.if} message={msg} />)}
      <div ref={dummy}></div>
    </main>
    
    <form onSubmit={sendMessage} >
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}> <img id='send-btn' alt="send-btn" src="https://img.icons8.com/material-sharp/96/000000/send-comment.png"/></button>
    </form>
    
  </>)
  //Bind state to input form
}

//Chat message child Component
function ChatMessage(props) {
  //Showing actual text by accessing props message
  const { text, uid, photoURL } = props.message;

  //To check who sent the message
  const messageClass = uid === auth.currentUser.uid ? 'sent':'received' ;
  return( <>
    <div className={`message ${messageClass}`}>
      <img alt='profile pic' src={photoURL} />
      <p>{text}</p>
    </div>
    </>)
}

export default App;
