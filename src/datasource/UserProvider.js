// UserContext.js
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

const USERS = [
    { id: 1, username: "Maciek Zieja" },
    { id: 2, username: "Wojtek Gajda" }
];

export const UserProvider = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState(USERS[0]);
    const [currentCost, setCurrentCost] = useState(0);

    return (
        <UserContext.Provider value={{
            users: USERS,
            selectedUser,
            setSelectedUser,
            currentCost,
            setCurrentCost
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);