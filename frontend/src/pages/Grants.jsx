import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Search, Calendar, Building2, DollarSign } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

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

export default function Grants() {
  const navigate = useNavigate();
  const { getAllGrants } = useData();
  const grants = getAllGrants();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGrants = useMemo(() => {
    if (!searchQuery.trim()) return grants;
    const query = searchQuery.toLowerCase();
    return grants.filter(grant => 
      grant.studyTitle.toLowerCase().includes(query) ||
      grant.grantBody.toLowerCase().includes(query) ||
      grant.categories.some(cat => 
        cat.ioCode?.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
      )
    );
  }, [grants, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="grants-page">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">Grants</h1>
        <p className="text-muted-foreground mt-2">Browse all grants and their remaining funds</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by study, grant body, or IO code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="search-grants-input"
        />
      </div>

      {/* Grants List */}
      {filteredGrants.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No grants found matching your search</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredGrants.map((grant) => {
            const totalAwarded = grant.categories.reduce((sum, cat) => sum + cat.initial, 0);
            const totalUsed = grant.categories.reduce((sum, cat) => sum + cat.used, 0);
            const totalLeft = totalAwarded - totalUsed;
            
            return (
              <Card 
                key={grant.studyId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/studies/${grant.studyId}`)}
                data-testid={`grant-card-${grant.studyTitle.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-[Manrope]">{grant.studyTitle}</CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-sm py-1 px-3">
                          <Building2 className="w-4 h-4 mr-2" />
                          {grant.grantBody}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(grant.grantStartDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                          {' - '}
                          {new Date(grant.grantEndDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </span>
                        <StatusBadge status={grant.status} />
                      </div>
                    </div>
                    
                    {/* Summary Numbers on the Right */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Awarded:</span>
                        <span className="text-lg font-bold tabular-nums text-foreground">{formatCurrency(totalAwarded)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Used:</span>
                        <span className="text-lg font-bold tabular-nums text-yellow-600 dark:text-yellow-400">{formatCurrency(totalUsed)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Remaining:</span>
                        <span className="text-xl font-bold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(totalLeft)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {grant.categories.map((cat, i) => {
                      const remaining = cat.initial - cat.used;
                      const percentUsed = cat.initial > 0 ? (cat.used / cat.initial) * 100 : 0;
                      return (
                        <div key={i} className="p-4 rounded-lg bg-muted/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{cat.name}</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {cat.ioCode || 'N/A'}
                            </Badge>
                          </div>
                          <Progress value={percentUsed} className="h-2" />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatCurrency(cat.used)} used
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {formatCurrency(remaining)} left
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
