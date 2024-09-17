import React, {createContext, useContext} from 'react';
import {StripeConnectInstance} from '@stripe/connect-js';

type IConnectJSContext = {
  connectInstance?: StripeConnectInstance;
};

const ConnectJSContext = createContext<IConnectJSContext>({});

export const useConnectJSContext = () => {
  const context = useContext(ConnectJSContext);
  return context;
};

export const EmbeddedComponentProvider = ({
  children,
  connectInstance,
}: {
  children: React.ReactNode;
  connectInstance?: StripeConnectInstance;
}) => {
  return (
    <ConnectJSContext.Provider value={{connectInstance}}>
      {children}
    </ConnectJSContext.Provider>
  );
};

1) grade virebase token id to retrieve the signed up users 