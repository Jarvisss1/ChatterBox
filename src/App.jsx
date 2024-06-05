import { ToastContainer } from 'react-toastify'
import Chat from './components/Chat/Chat'
import Details from './components/Details/Details'
import List from './components/List/List'
import { Login } from './components/login/Login'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useUserStore } from './lib/userStore'
import { useChatStore } from './lib/chatStore'

function App() {


  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const {chatId} = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      // console.log(user);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if(isLoading) return <div className='loading'>Loading...</div>;

  return ( 
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Details />}
        </>
      ) : (
        <Login />
      )}
      <ToastContainer position='bottom-right'/>
    </div>
  );
}

export default App
