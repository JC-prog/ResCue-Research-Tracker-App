import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);

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
      <aside 
        className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r border-border bg-card flex flex-col transition-all duration-300`}
      >
        {/* Logo - Clickable to toggle collapse */}
        <div 
          className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${collapsed ? 'px-3' : 'px-4'}`}
          onClick={() => setCollapsed(!collapsed)}
          data-testid="collapse-sidebar-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-6 h-6 text-primary-foreground" />
              <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-bold text-primary-foreground bg-primary rounded-full w-4 h-4 flex items-center justify-center border-2 border-card">
                R
              </span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold tracking-tight font-[Manrope]">ResCue</h1>
                <p className="text-xs text-muted-foreground">Research Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-2 space-y-1 ${collapsed ? 'px-2' : 'p-4'}`}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:shadow-sm'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-2 border-t border-border space-y-2 ${collapsed ? 'px-2' : 'p-4'}`}>
          {/* Export/Import */}
          {!collapsed ? (
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
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="icon"
                className="w-full"
                onClick={exportData}
                data-testid="export-data-btn"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                data-testid="import-data-btn"
                title="Import Data"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={collapsed ? "w-full" : "w-full justify-start"}
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            title={collapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
          >
            {theme === 'light' ? (
              <>
                <Moon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && 'Dark Mode'}
              </>
            ) : (
              <>
                <Sun className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && 'Light Mode'}
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
