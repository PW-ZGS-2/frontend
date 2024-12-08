import React, {createContext, useContext} from 'react';
import {TelescopeApi} from "./BackendClient";

const ApiContext = createContext(null);

export class ApiContextType{
    backendApi: TelescopeApi;
}

export const ApiProvider = ({children}) => {
    const telescopeApi = new TelescopeApi(process.env.REACT_APP_BACKEND_API_BASE_URL)
    return (
        <ApiContext.Provider value={{telescopeApi: telescopeApi}}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApiContext = (): ApiContextType => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApiContext must be used within an ApiProvider');
    }
    return context;
};