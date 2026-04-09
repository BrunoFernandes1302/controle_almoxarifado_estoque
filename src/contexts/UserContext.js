import React, { createContext, useState, useContext, useEffect } from 'react';

// Criar o contexto
const UserContext = createContext();

// Provider para gerenciar o estado do usuário
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Recupera os dados do usuário do localStorage ao carregar a página
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Atualiza o localStorage sempre que o estado do usuário mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto mais facilmente
export const useUser = () => useContext(UserContext);
