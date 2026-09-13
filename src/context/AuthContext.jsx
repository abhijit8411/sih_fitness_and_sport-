import {useState,useEffect,useContext,createContext} from 'react';
import axios from 'axios';
import { runAnalysis } from '../services/analyzer';

const Authcontext = createContext();

const AuthProvider=({children})=>{
    //  now by declaring this inside the auth provider we have made this state global
    const [auth, setAuth] = useState({
        user:null,
        token:""
    });

    // default axios
    // this will ensure that whatever request is made by default, that request will 
    // contain header
    axios.defaults.headers.common['Authorization']=auth?.token;

    useEffect(()=>{
        const data=localStorage.getItem('auth')
        if(data){
            const parseData=JSON.parse(data)
            // console.log("local storage",parseData);
            setAuth({
                ...auth,
                user:parseData.user,
                token:parseData.token,
            });
        }
        //eslint-disable-next-line
    },[]);

    // When auth.user becomes available, run passive analysis (no UI blocking)
    useEffect(() => {
        if (auth?.user && auth.user._id) {
            try { runAnalysis(auth.user._id, { askAI: true }); }
            catch(e) { console.warn('Auto analysis failed', e); }
        }
    }, [auth?.user]);
    return (
        <Authcontext.Provider value={[auth,setAuth]}>
            {children}
        </Authcontext.Provider>
    )
}

// making a custom hook
const useAuth = () => useContext(Authcontext)

export {useAuth,AuthProvider};