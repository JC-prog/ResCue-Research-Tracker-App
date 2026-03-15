import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { DollarSign, Calendar, Building2 } from 'lucide-react';

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

  const totals = useMemo(() => {
    return grants.reduce((acc, grant) => {
      const initial = grant.categories.reduce((sum, cat) => sum + cat.initial, 0);
      const used = grant.categories.reduce((sum, cat) => sum + cat.used, 0);
      return {
        initial: acc.initial + initial,
        used: acc.used + used,
        remaining: acc.remaining + (initial - used)
      };
    }, { initial: 0, used: 0, remaining: 0 });
  }, [grants]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="grants-page">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">Grants</h1>
        <p className="text-muted-foreground mt-2">Financial overview of all study grants</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="total-initial-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Initial</p>
                <p className="text-2xl font-bold tabular-nums font-[Manrope]">{formatCurrency(totals.initial)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="total-used-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Used</p>
                <p className="text-2xl font-bold tabular-nums font-[Manrope]">{formatCurrency(totals.used)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="total-remaining-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Remaining</p>
                <p className="text-2xl font-bold tabular-nums font-[Manrope]">{formatCurrency(totals.remaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[Manrope]">Grant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Study</TableHead>
                <TableHead>Grant Body</TableHead>
                <TableHead>IO Code</TableHead>
                <TableHead className="text-right">Initial</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grants.map((grant) => {
                const initial = grant.categories.reduce((sum, cat) => sum + cat.initial, 0);
                const used = grant.categories.reduce((sum, cat) => sum + cat.used, 0);
                const remaining = initial - used;
                const progress = initial > 0 ? (used / initial) * 100 : 0;
                
                return (
                  <TableRow 
                    key={grant.studyId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/studies/${grant.studyId}`)}
                    data-testid={`grant-row-${grant.studyTitle.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <TableCell className="font-medium">{grant.studyTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{grant.grantBody}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {grant.ioCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(initial)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(used)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(remaining)}
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground tabular-nums">{progress.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(grant.grantStartDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        {' - '}
                        {new Date(grant.grantEndDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={grant.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
