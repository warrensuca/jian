'use client';

import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const ctx = useContext(AuthContext)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e: any) => {
        e.preventDefault();

        ctx?.login(username, password)
    }

    //html here
}

export default Login;