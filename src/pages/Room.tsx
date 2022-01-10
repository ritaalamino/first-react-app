import logoImg from '../assets/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';

import { useParams } from 'react-router-dom';

import '../styles/room.scss';
import { FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { useEffect } from 'react';

type RoomParams = {
    id: string;
}

type FirebaseQuestions = Record<string, {
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
}

export function Room() {
    const { user } = useAuth();
    const params = useParams<RoomParams>();
    const [ newQuestion, setNewQuestion ] = useState('');

    const roomId = params.id;

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`);

        roomRef.once('value', room => {
            const databaseRoom = room.val();
            const firebaseQuestions:FirebaseQuestions = databaseRoom.questions;

            const parsedQuestions = Object.entries(firebaseQuestions ?? {})
        })
    }, [roomId]);

    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault();

        if (newQuestion.trim() === '')    {
            return;
        }

        if(!user) {
            throw new Error('User not authenticated');
        }

        const question = {
            content: newQuestion,
            author: {
                name: user?.displayName,
                avatar: user?.avatarUrl
            },
            isHighlighted: false,
            isAnswered: false
        };

        await database.ref(`rooms/${roomId}/question`).push(question);

        setNewQuestion('');
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <RoomCode code="-MsrLOecdj__oCFLiSge"/>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala React</h1>
                    <span>perguntas</span>
                </div>
                <form onSubmit={handleSendQuestion}>
                    <textarea 
                        placeholder='O que você quer perguntar?'
                        onChange={event => setNewQuestion(event.target.value)}
                        value={newQuestion}
                    />
                    <div className='form-footer'>
                        { user ? (
                            <div className='user-info'>
                                <img src={user.avatarUrl} alt="User Image" />
                                <span>{user.displayName}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button> faça seu login.</button></span>
                        ) }
                        
                        <Button type='submit' disabled={!user}>Enviar Perguntas</Button>
                    </div>
                </form>
            </main>
        </div>
    );    
}