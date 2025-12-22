import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page non trouvée</p>
            <Link to="/" className="text-purple-400 hover:text-purple-300 underline">
                Retour à l'accueil
            </Link>
        </div>
    );
};
