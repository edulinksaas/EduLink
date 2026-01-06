import { Menu, HelpCircle, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onSettingsClick?: () => void;
  onHomeClick?: () => void;
  onLogout?: () => void;
}

export function Header({ onMenuClick, onSettingsClick, onHomeClick, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className="p-2 hover:bg-gray-100 rounded"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={onHomeClick}
          >
            <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
              <span className="text-white text-xs">똑</span>
            </div>
            <span className="text-gray-800">똑똑플라이</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex flex-col items-center text-blue-500 text-xs">
            <HelpCircle className="w-5 h-5 mb-1" />
            <span>사용법</span>
          </button>
          <button 
            className="flex flex-col items-center text-gray-500 text-xs"
            onClick={onSettingsClick}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span>설정</span>
          </button>
          <button 
            className="flex flex-col items-center text-orange-400 text-xs hover:text-orange-500 transition-colors"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
