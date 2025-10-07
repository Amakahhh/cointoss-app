import { useState, useEffect } from 'react';

const useCryptoData = (symbol = 'bitcoin') => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    try {
      setError(null);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      
      const data = await response.json();
      const coinData = data[symbol];
      
      if (coinData) {
        setPrice({
          current: coinData.usd,
          change24h: coinData.usd_24h_change,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError(err.message);
      
      // Fallback to mock data if API fails
      setPrice({
        current: 50000 + Math.random() * 10000,
        change24h: (Math.random() - 0.5) * 10,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    
    // Update price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  return { price, loading, error, refetch: fetchPrice };
};

export default useCryptoData;










