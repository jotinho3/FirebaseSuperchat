    import React, { useRef, useState, useEffect } from 'react';
    import { initializeApp } from 'firebase/app';
    import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
    import { useAuthState } from 'react-firebase-hooks/auth';
    import { useCollectionData } from 'react-firebase-hooks/firestore';
    import { getFirestore, collection, query, where, orderBy, addDoc, serverTimestamp, limit, doc, deleteDoc, getDocs  } from 'firebase/firestore';
    import { v4 as uuidv4 } from 'uuid';
    import { motion, AnimatePresence } from 'framer-motion';

    import trashIcon from './assets/trash.svg'
    import sendMsg from './assets/paper-plane-right.svg'


    import 'firebase/firestore';
    import 'firebase/auth';
    import 'firebase/analytics';
    import './App.css';


    const app = initializeApp({
      apiKey: "AIzaSyArhXzyH6S6PyqtdaliRgQ1THV6y9B9l8o",
      authDomain: "superchatjota.firebaseapp.com",
      projectId: "superchatjota",
      storageBucket: "superchatjota.appspot.com",
      messagingSenderId: "1003928311499",
      appId: "1:1003928311499:web:3bfcf3e91c7d28d00ced4e"

    })

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    export function App() {
      const [user] = useAuthState(auth);
    
      return (
        <div className="App">
          <header>
            <h1>⚛️🔥💬</h1>
            <SignOut />
          </header>
    
          <section>
            {user ? <ChatRoom /> : <SignIn />}
          </section>
        </div>
      );
    }
    
    export function SignIn() {
      const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
      };
    
      return (
        <button onClick={signInWithGoogle}>Sign In with Google</button>
      );
    }
    
    export function SignOut() {
      return (
        auth.currentUser && (
          <button onClick={() => auth.signOut()}>Sign Out!</button>
        )
      );
    }
    
    function ChatRoom() {
      const dummy = useRef();
      const messagesRef = collection(firestore, 'messages');
      const q = query(messagesRef, orderBy('createdAt'), limit(25));
    
      const [messages] = useCollectionData(q, { idField: 'id' });
      const [formValue, setFormValue] = useState('');

      const messageContainerRef = useRef();
    
      const sendMessage = async (e) => {
        e.preventDefault();
    
        const { uid, photoURL } = auth.currentUser;
    
        await addDoc(messagesRef, {
          text: formValue,
          createdAt: serverTimestamp(),
          uid,
          id: uuidv4(),
          photoURL
        });
    
        setFormValue('');
        
          
      };

      
    
      const deleteDocumentById = async (collectionName, fieldName, fieldValue) => {
        const q = query(collection(firestore, collectionName), where(fieldName, '==', fieldValue));
        const querySnapshot = await getDocs(q);
    
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref)
            .then(() => {
              console.log('Document deleted successfully');
            })
            .catch((error) => {
              console.error('Error deleting document:', error);
            });
        });
      };
    
      const handleDelete = async (id) => {
        try {
          await deleteDocumentById('messages', 'id', id);
        } catch (error) {
          console.error('Error deleting document:', error);
        }
      };
    
      return (
        <>
          <main>
            <AnimatePresence>
              {messages &&
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage message={msg} onDelete={handleDelete} />
                  </motion.div>
                ))}
            </AnimatePresence>
         
          </main>
          <form onSubmit={sendMessage}>
            <input
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="Digite algo legal!"
            />
            <button type="submit" disabled={!formValue}>
              <img src={sendMsg} className="sendMsg" alt="" />
            </button>
          </form>
        </>
      );
    }
    
    function ChatMessage(props) {
      const { message, onDelete } = props;
    
      if (!message) {
        return null;
      }
    
      const { text, uid, photoURL, id } = message;
    
      const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
    
      return (
        <div key={id} id={id} className={`message ${messageClass}`}>
          <img src={photoURL} alt="Profile" />
          <p>{text}</p>
          {uid === auth.currentUser.uid && (
            <button className="deleteMsgButton" onClick={() => onDelete(id)}>
              <img src={trashIcon} alt="" />
            </button>
          )}
        </div>
      );
    }
    
    export default App;