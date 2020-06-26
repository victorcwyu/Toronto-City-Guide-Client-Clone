import React, { useEffect, useContext, useState } from 'react';
import io from 'socket.io-client';
import UserContext from '../context/UserContext';
import { TextField, Container, Button } from '@material-ui/core';
import MessageDisplay from './MessageDisplay';
import axios from 'axios';

const Messages = () => {
    const { userData, setUserData } = useContext(UserContext);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(null);

    const token = localStorage.getItem('auth-token');
    let socket
    // socket.on('serverMessage', data => {
    //     setMessages(data.messages);
    // });

    useEffect(() => {
        // console.log('messages', messages)
        socket = io('http://localhost:5000')

        axios.post("http://localhost:5000/getUserMessages", {
            userId: userData.user.id,
            contactId: userData.contactId
        }, {
            headers: {
                "x-auth-token": token
            }
        })
            .then(res => {
                // console.log(res)
                setMessages(res.data.messageHistory)
                return res.data.messageHistory
            })
            .then(res => {
                socket.emit('joinroom', res._id);
            })
            .catch(err => console.log(err));

        // socket.emit('userData', {
        //     userId: userData.user.id,
        //     contactId: userData.contactId
        // })

        // socket.on('roomData', data => {
        //     console.log('ROOMDATA: ', data);
        //     roomId = data._id;
        //     setMessages(data)
        //     // socket.emit('join', roomId);
        // })
        socket.on('update', data => {
            console.log("update", data)
        });

        return () => socket.disconnect();
    }, []);

    const sendMessage = (e) => {

        e.preventDefault();
        // console.log("messages", messages)
        if (message) {
            const newMessage = {
                text: message,
                senderId: userData.user.id,
                timeStamp: Date.now()
            }

            const currentHistory = messages.messageHistory;
            const newHistory = [...currentHistory, newMessage]
            setMessages({ ...messages, messageHistory: newHistory })

            axios.post("http://localhost:5000/updateUserMessages", {
                newMessage,
                messagesId: messages._id
            }, {
                headers: {
                    "x-auth-token": token
                }
            })
                .then(res => {
                    console.log(res);
                })
                .catch(err => console.log(err));

            let socket = io(`/${messages._id}`);
            socket.on('hi', data => {
                console.log("from nsp",data)
            })
            // socket.emit('update', {
            //     newMessage,
            //     messagesId: messages._id
            // })

            // messages: {
            //     id: ObjectId,
            //     users: [],
            //     messageHistory: [{
            //         Text:
            //         sender:
            //         timestamp: 
            //     }]}
            // const newHistory = {
            //     ...messages,
            //     messageHistory: newHistory
            // }

            // const newHistory = [...messages, {...messageHistory, newMessage}]
            // setMessages({...messages, messageHistory: newHistory})
            // socket.emit('clientMessage', {
            //     message,
            //     messages,
            //     userId: userData.user.id
            // });
            setMessage('');
        }
    }


    return (
        <div>
            <Container>
                <h1>Messages</h1>
                <div className="display">
                    {messages && messages.messageHistory && messages.messageHistory.map(message => {
                        return <MessageDisplay
                            message={message.text}
                            senderId={message.senderId}
                            time={message.timeStamp}
                        />
                    })}
                </div>
                <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}
                />
                <Button onClick={sendMessage}>Submit</Button>
            </Container>

        </div>
    )
}

export default Messages;

// We can user a message context and dthen we can check the context 
// We can recieve and emit from App.js and then use the message page to update the message page.

// update message state so it shows right away if both are logged in.
// Add to user messages key in doc. update both users with time stamp.
// Use array of objects:
// {
//     timeStamp: timestamp,
//     content: 'text'
// }

// messages doc: 
// id:
// userId: refs user,
// [{
//     contactID,
//     messages: [seeAbove]
// }]