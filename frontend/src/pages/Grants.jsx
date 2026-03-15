import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Search, Calendar, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getBudgetColor = (percentRemaining) => {
  if (percentRemaining > 50) return 'text-green-600 dark:text-green-400';
  if (percentRemaining > 20) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getBudgetBgColor = (percentRemaining) => {
  if (percentRemaining > 50) return 'bg-green-100 dark:bg-green-900/30';
  if (percentRemaining > 20) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
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
            const percentRemaining = totalAwarded > 0 ? (totalLeft / totalAwarded) * 100 : 0;
            
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
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Horizontal Bar Chart for Fund Categories - 3 columns */}
                    <div className="lg:col-span-3">
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={grant.categories.map(cat => ({
                              name: cat.name,
                              ioCode: cat.ioCode || 'N/A',
                              used: cat.used,
                              remaining: cat.initial - cat.used,
                              initial: cat.initial
                            }))}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                          >
                            <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={90}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              formatter={(value, name) => [formatCurrency(value), name === 'used' ? 'Used' : 'Remaining']}
                              labelFormatter={(label) => {
                                const cat = grant.categories.find(c => c.name === label);
                                return `${label} (${cat?.ioCode || 'N/A'})`;
                              }}
                            />
                            <Bar dataKey="used" stackId="a" fill="#ef4444" name="Used" />
                            <Bar dataKey="remaining" stackId="a" fill="#22c55e" name="Remaining" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Summary Numbers - 1 column on right, no background highlight */}
                    <div className="lg:col-span-1 p-4 rounded-lg border border-border flex flex-col justify-center items-center space-y-3 min-h-[180px]">
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">Awarded</span>
                        <span className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(totalAwarded)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">Used</span>
                        <span className="text-xl font-bold tabular-nums text-red-600 dark:text-red-400">{formatCurrency(totalUsed)}</span>
                      </div>
                      <div className="text-center border-t border-border/50 pt-3 w-full">
                        <span className="text-xs text-muted-foreground block mb-1">Remaining</span>
                        <span className={`text-2xl font-bold tabular-nums ${getBudgetColor(percentRemaining)}`}>{formatCurrency(totalLeft)}</span>
                      </div>
                    </div>
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
