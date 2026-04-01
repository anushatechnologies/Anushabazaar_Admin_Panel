import './index.css';
import '@styles/globals.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { PageMetaProvider } from '@app/context/PageMetaContext';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@app/store';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PageMetaProvider>
          <App />
        </PageMetaProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
