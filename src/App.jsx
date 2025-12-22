import React from "react";
import { StripeProvider } from './contexts/StripeContext';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';

function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <Routes />
      </StripeProvider>
    </AuthProvider>
  );
}

export default App;