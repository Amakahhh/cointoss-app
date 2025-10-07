import { useState, useEffect } from 'react';

const useBitcoinData = () => {
  const [price, setPrice] = useState(110699.58);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBitcoinPrice = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      
      if (data.bitcoin && data.bitcoin.usd) {
        setPrice(data.bitcoin.usd);
        setError(null);
      }
    } catch (err) {
      console.log('Using fallback price data');
      setError('API unavailable, using fallback data');
      // Generate a realistic price variation
      setPrice(prev => prev + (Math.random() - 0.5) * 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
};

export default useBitcoinData;










