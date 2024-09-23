import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import {store, persistor} from './store/redux';
import App from './App';
import './index.css';
import {BrowserRouter} from 'react-router-dom'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { PersistGate } from 'redux-persist/integration/react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import {createClient} from '@supabase/supabase-js'
import {SessionContextProvider} from '@supabase/auth-helpers-react'

const container = document.getElementById('root');
const root = createRoot(container);


const supabase = createClient(
  "https://ruhozgzhukhjcdnpbozz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aG96Z3podWtoamNkbnBib3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NTY0OTQsImV4cCI6MjA0MjQzMjQ5NH0.kjgtbUcPKp7pXTyw80SUTAD-dYxBhcLTrwxCn5b-38Q"
)

root.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <SessionContextProvider supabaseClient={supabase}>
            <App />
          </SessionContextProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
);
