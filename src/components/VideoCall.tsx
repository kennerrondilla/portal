import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'admin' | 'representative';
  participantName: string;
}

export function VideoCall({ isOpen, onClose, userRole, participantName }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className={`${isFullScreen ? 'w-full h-full' : 'w-full max-w-6xl h-[80vh]'} relative bg-gray-900 rounded-lg overflow-hidden`}>
        {/* Remote Video (Main) */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">{participantName.charAt(0)}</span>
            </div>
            <p className="text-white text-xl">{participantName}</p>
            <p className="text-gray-400 text-sm mt-2">Connected</p>
          </div>
        </div>

        {/* Local Video (Small) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl">
          <div className="w-full h-full flex items-center justify-center">
            {isVideoOff ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                  <VideoOff className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-xs mt-2">Camera Off</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl text-white">You</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call Duration */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-white text-sm">00:05:23</p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            {isFullScreen ? (
              <Minimize2 className="w-6 h-6 text-white" />
            ) : (
              <Maximize2 className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
