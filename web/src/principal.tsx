import React from 'react';
import ReactDOM from 'react-dom/client';
import { Aplicacao } from './Aplicacao';
import './estilos.css';

const elementoRaiz = document.getElementById('raiz');

if (elementoRaiz) {
  ReactDOM.createRoot(elementoRaiz).render(
    <React.StrictMode>
      <Aplicacao />
    </React.StrictMode>
  );
}
