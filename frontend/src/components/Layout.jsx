import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  BookOpen,
  Moon,
  Sun,
  BookMarked,
  Download,
  Upload
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { useRef } from 'react';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/studies', icon: FileText, label: 'All Studies' },
  { path: '/grants', icon: DollarSign, label: 'Grants' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/publications', icon: BookOpen, label: 'Publications' },
];

export const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { exportData, importData } = useData();
  const fileInputRef = useRef(null);
  const location = useLocation();

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importData(event.target?.result);
      if (result.success) {
        toast.success('Data imported successfully');
      } else {
        toast.error(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-primary-foreground" />
              <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-bold text-primary-foreground bg-primary rounded-full w-4 h-4 flex items-center justify-center border-2 border-card">
                R
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-[Manrope]">ResCue</h1>
              <p className="text-xs text-muted-foreground">Research Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Export/Import */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={exportData}
              data-testid="export-data-btn"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              data-testid="import-data-btn"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5 mr-3" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-3" />
                Light Mode
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
};
