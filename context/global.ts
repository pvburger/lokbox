import React, { createContext, useContext } from 'react';
import { ContextObj } from '../types';

/* 
From React docs: 
The argument passed to createContext is the default value
The value that you want the context to have when there is no matching context provider in the tree above the component that reads context
If you don’t have any meaningful default value, specify null
*/

/*
must preface argument with type of data which will eventually be stored in context
as the ContextObj is defined inside of App, it is initially undefined when created here
the objective here is to account for situations where a dev might forget to wrap a component in a context provide
based on https://youtu.be/HYKDUF8X3qI?si=fVC3qDU5xTS7oSkN
*/
export const GlobalContext = createContext<ContextObj | undefined>(undefined);

export const useModContext = () => {
  const globject = useContext(GlobalContext);
  if (globject === undefined) {
    throw new Error(`modContext must be used with a GlobalContext`);
  }
  return globject;
};
