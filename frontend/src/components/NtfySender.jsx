import { useState, useCallback, useRef } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

// Simple confetti function using canvas
const createConfetti = (canvas) => {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  // Create particles
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 7,
      gravity: 0.5
    });
  }

  let animationFrame;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let stillAlive = false;
    particles.forEach(p => {
      if (p.y < canvas.height) {
        stillAlive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    });
    
    if (stillAlive) {
      animationFrame = requestAnimationFrame(animate);
    }
  };
  
  animate();
  
  // Cleanup function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
};

const NtfyForm = () => {
  const [server] = useState('https://ntfy.sh');
  const [channel, setChannel] = useState('zxrd');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromEmoji, setFromEmoji] = useState(null);
  const [toEmoji, setToEmoji] = useState(null);
  const messageInputRef = useRef(null);
  const canvasRef = useRef(null);

  const emojis = [
    { id: 'duck', symbol: '🦆' },
    { id: 'thumbsup', symbol: '👍' },
    { id: 'cyclist', symbol: '🚴‍♀️' },
  ];

  const handleEmojiClick = (emoji) => {
    if (!fromEmoji) {
      setFromEmoji(emoji);
    } else if (!toEmoji) {
      setToEmoji(emoji);
      if (emoji.id === 'duck') {
        setChannel('zxrd');
        setMessage('Hello Ducky');
      }
      messageInputRef.current?.focus();
    }
  };

  const triggerConfetti = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Set canvas size to match window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createConfetti(canvas);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const url = `${server}/${channel}`;
      // Add emoji flow to message
      const messageWithEmojis = `${fromEmoji.symbol} → ${toEmoji.symbol}: ${message}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: messageWithEmojis
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStatus({ type: 'success', message: 'Notification sent successfully!' });
      setMessage('');
      triggerConfetti();
    } catch (error) {
      setStatus({ type: 'error', message: `Failed to send: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const renderEmojiSelection = () => {
    if (!fromEmoji) {
      return (
        <div className="text-center">
          <h3 className="text-3xl font-medium text-gray-700 mb-8">Who are you?</h3>
          <div className="flex justify-center gap-8">
            {emojis.map((emoji) => (
              <button
                key={emoji.id}
                onClick={() => handleEmojiClick(emoji)}
                className="text-7xl p-4 rounded-lg transition-all hover:bg-gray-100 cursor-pointer hover:scale-110"
              >
                {emoji.symbol}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (!toEmoji) {
      return (
        <div className="text-center">
          <h3 className="text-3xl font-medium text-gray-700 mb-8">
            Who gets the message?
          </h3>
          <div className="flex justify-center gap-8">
            {emojis.map((emoji) => (
              <button
                key={emoji.id}
                onClick={() => handleEmojiClick(emoji)}
                className="text-7xl p-4 rounded-lg transition-all hover:bg-gray-100 cursor-pointer hover:scale-110"
              >
                {emoji.symbol}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <h3 className="text-3xl font-medium text-gray-700 mb-8">
          Your message
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <input
              ref={messageInputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Type your message..."
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message}
            className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </form>

        {status && (
          <div className={`mt-4 flex items-center gap-2 p-4 rounded-lg ${
            status.type === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-100' 
              : 'bg-green-50 text-green-700 border border-green-100'
          }`}>
            {status.type === 'error' ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm">{status.message}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              Duck Chat
            </h2>
          </div>

          <div className="p-6">
            {renderEmojiSelection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NtfyForm;