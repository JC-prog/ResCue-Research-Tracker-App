import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, Users, Plus } from 'lucide-react';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'on-hold', label: 'On Hold' }
];

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'on-hold': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <Badge className={`${styles[status]} border-0 capitalize`}>
      {status.replace('-', ' ')}
    </Badge>
  );
};

const StudyCard = ({ study, onClick }) => {
  const totalEnrolled = study.recruitment.sites.reduce((sum, site) => sum + site.enrolled, 0);
  const enrollmentProgress = study.targetEnrollment > 0 
    ? (totalEnrolled / study.targetEnrollment) * 100 
    : 0;
  
  const totalBudget = study.fund.categories.reduce((sum, cat) => sum + cat.initial, 0);
  const usedBudget = study.fund.categories.reduce((sum, cat) => sum + cat.used, 0);
  const budgetProgress = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow animate-fade-in"
      onClick={onClick}
      data-testid={`study-card-${study.shortTitle.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-[Manrope]">{study.shortTitle}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{study.pi}</p>
          </div>
          <StatusBadge status={study.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{study.longTitle}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{study.phase}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{study.ecosRef}</span>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> Enrollment
            </span>
            <span className="tabular-nums">{totalEnrolled}/{study.targetEnrollment}</span>
          </div>
          <Progress value={enrollmentProgress} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Budget Used</span>
            <span className="tabular-nums">{budgetProgress.toFixed(0)}%</span>
          </div>
          <Progress value={budgetProgress} className="h-2" />
        </div>
        
        <div className="flex flex-wrap gap-1 pt-2">
          {study.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {study.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{study.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AllStudies() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { studies } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const statusFilter = searchParams.get('status') || 'all';

  const setStatusFilter = (value) => {
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      const matchesSearch = 
        study.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.longTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.pi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.ecosRef.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [studies, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    return studies.reduce((acc, study) => {
      acc[study.status] = (acc[study.status] || 0) + 1;
      return acc;
    }, {});
  }, [studies]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="all-studies-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">All Studies</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor your research portfolio</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search studies by title, PI, or ECOS ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-studies-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="status-filter-select">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Badges with Counts */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={statusFilter === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('all')}
          data-testid="filter-all"
        >
          All ({studies.length})
        </Badge>
        <Badge
          variant={statusFilter === 'active' ? 'default' : 'secondary'}
          className="cursor-pointer bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
          onClick={() => setStatusFilter('active')}
          data-testid="filter-active"
        >
          Active ({statusCounts.active || 0})
        </Badge>
        <Badge
          variant={statusFilter === 'completed' ? 'default' : 'secondary'}
          className="cursor-pointer bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
          onClick={() => setStatusFilter('completed')}
          data-testid="filter-completed"
        >
          Completed ({statusCounts.completed || 0})
        </Badge>
        <Badge
          variant={statusFilter === 'pending' ? 'default' : 'secondary'}
          className="cursor-pointer bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
          onClick={() => setStatusFilter('pending')}
          data-testid="filter-pending"
        >
          Pending ({statusCounts.pending || 0})
        </Badge>
        <Badge
          variant={statusFilter === 'on-hold' ? 'default' : 'secondary'}
          className="cursor-pointer bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
          onClick={() => setStatusFilter('on-hold')}
          data-testid="filter-on-hold"
        >
          On Hold ({statusCounts['on-hold'] || 0})
        </Badge>
      </div>

      {/* Studies Grid */}
      {filteredStudies.length === 0 ? (
        <Card className="p-12 text-center">
          <img 
            src="https://images.unsplash.com/photo-1576669801838-1b1c52121e6a?w=400" 
            alt="No studies" 
            className="w-48 h-32 object-cover mx-auto rounded-lg mb-4 opacity-50"
          />
          <p className="text-muted-foreground">No studies found matching your criteria</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map(study => (
            <StudyCard
              key={study.id}
              study={study}
              onClick={() => navigate(`/studies/${study.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
