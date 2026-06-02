import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../api/config';

interface ReviewModeContextType {
  // true => mode review Apple : l'app masque tout le vocabulaire/flux de paiement.
  reviewMode: boolean;
  ready: boolean;
}

const ReviewModeContext = createContext<ReviewModeContextType>({
  reviewMode: false,
  ready: false,
});

export const ReviewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviewMode, setReviewMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${Config.apiUrl}/api/netflix/plans`, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        if (!cancelled) setReviewMode(res.data?.appleReviewMode === true);
      } catch (err) {
        // En cas d'échec réseau, on reste en mode normal (false).
        if (!cancelled) setReviewMode(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <ReviewModeContext.Provider value={{ reviewMode, ready }}>
      {children}
    </ReviewModeContext.Provider>
  );
};

export const useReviewMode = () => useContext(ReviewModeContext);
