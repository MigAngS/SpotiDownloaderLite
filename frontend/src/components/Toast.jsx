import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <FaCheckCircle className="text-2xl" />,
        error: <FaTimesCircle className="text-2xl" />,
        info: <FaInfoCircle className="text-2xl" />,
        warning: <FaExclamationTriangle className="text-2xl" />
    };

    const colors = {
        success: 'bg-green-500/90 border-green-400',
        error: 'bg-red-500/90 border-red-400',
        info: 'bg-blue-500/90 border-blue-400',
        warning: 'bg-yellow-500/90 border-yellow-400'
    };

    return (
        <div className={`
      fixed top-4 right-4 z-50 min-w-[300px] max-w-md
      ${colors[type]} backdrop-blur-lg
      border-2 rounded-xl shadow-2xl
      p-4 flex items-center gap-3
      animate-slide-in-right
    `}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div className="flex-1 text-white font-medium">
                {message}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
                <FaTimes />
            </button>
        </div>
    );
}
