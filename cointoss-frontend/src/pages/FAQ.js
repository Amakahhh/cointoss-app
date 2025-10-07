import React, { useState } from 'react';

const FAQ = () => {
  // FAQ state
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What currencies can i use?",
      answer: "We Currently support BTC, ETH, and USDT"
    },
    {
      question: "How are Payouts Calculated?",
      answer: "Payouts are based on stake multiplied by odds at the time of your prediction"
    },
    {
      question: "Is this platform secure?",
      answer: "Yes we use advanced encryption and follow best practices for wallet and transactions safely"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* FAQ Section */}
      <section style={{ 
        padding: 'clamp(2rem, 6vw, 4rem) 0', 
        background: 'var(--bg-primary)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem' 
        }}>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: 'clamp(1.25rem, 3.5vw, 2rem)', 
            fontWeight: '700', 
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>
          
          {/* FAQ Items */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* FAQ Items */}
            {faqs.map((faq, index) => (
              <div 
                key={index}
                style={{
                  background: 'var(--faq-bg)',
                  borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
                  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 4px var(--shadow)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => toggleFAQ(index)}
              >
                <h3 style={{ 
                  color: '#21C3FD', 
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                  fontWeight: '700',
                  marginBottom: openFAQ === index ? 'clamp(0.5rem, 1.5vw, 0.75rem)' : 0,
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  transition: 'margin-bottom 0.3s ease'
                }}>
                  {faq.question}
                </h3>
                {openFAQ === index && (
                  <p style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    lineHeight: '1.5',
                    margin: 0,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    animation: 'fadeIn 0.3s ease-in'
                  }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;