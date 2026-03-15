import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Users
} from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, color, onClick, testId }) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] group"
    onClick={onClick}
    data-testid={testId}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-3xl font-bold mt-2 tabular-nums font-[Manrope]">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

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

const getBudgetColor = (percentRemaining) => {
  if (percentRemaining > 50) return 'text-green-600 dark:text-green-400';
  if (percentRemaining > 20) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const StudyCard = ({ study, onClick }) => {
  const totalEnrolled = study.recruitment.sites.reduce((sum, site) => sum + site.enrolled, 0);
  const enrollmentProgress = study.targetEnrollment > 0 
    ? (totalEnrolled / study.targetEnrollment) * 100 
    : 0;
  
  const totalBudget = study.fund.categories.reduce((sum, cat) => sum + cat.initial, 0);
  const usedBudget = study.fund.categories.reduce((sum, cat) => sum + cat.used, 0);
  const remainingBudget = totalBudget - usedBudget;
  const percentRemaining = totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0;
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
            <span className="text-muted-foreground">Budget</span>
            <span className={`tabular-nums font-medium ${getBudgetColor(percentRemaining)}`}>
              {formatCurrency(remainingBudget)} left
            </span>
          </div>
          <Progress value={budgetProgress} className="h-2" />
        </div>
        
        <div className="flex flex-wrap gap-1 pt-2">
          {study.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { studies, getMetrics, getAllTasks } = useData();
  const metrics = getMetrics();
  
  const recentStudies = [...studies]
    .sort((a, b) => {
      const statusOrder = { active: 0, pending: 1, 'on-hold': 2, completed: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    })
    .slice(0, 6);

  const pendingTasksList = getAllTasks()
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (a.priority === 'crucial' && b.priority !== 'crucial') return -1;
      if (a.priority !== 'crucial' && b.priority === 'crucial') return 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard-page">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your research portfolio</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Studies"
          value={metrics.activeStudies}
          icon={Activity}
          color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          onClick={() => navigate('/studies?status=active')}
          testId="metric-active-studies"
        />
        <MetricCard
          title="Completed Studies"
          value={metrics.completedStudies}
          icon={CheckCircle}
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          onClick={() => navigate('/studies?status=completed')}
          testId="metric-completed-studies"
        />
        <MetricCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          icon={Clock}
          color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          onClick={() => navigate('/tasks')}
          testId="metric-pending-tasks"
        />
        <MetricCard
          title="Publications"
          value={metrics.totalPublications}
          icon={BookOpen}
          color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          onClick={() => navigate('/publications')}
          testId="metric-publications"
        />
      </div>

      {/* Recent Studies & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Studies */}
        <div className="lg:col-span-2">
          <h2 
            className="text-2xl font-semibold font-[Manrope] mb-4 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate('/studies')}
            data-testid="recent-studies-title"
          >
            Recent Studies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentStudies.map(study => (
              <StudyCard
                key={study.id}
                study={study}
                onClick={() => navigate(`/studies/${study.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div>
          <h2 
            className="text-2xl font-semibold font-[Manrope] mb-4 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate('/tasks')}
            data-testid="priority-tasks-title"
          >
            Priority Tasks
          </h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {pendingTasksList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending tasks</p>
              ) : (
                pendingTasksList.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/studies/${task.studyId}`)}
                    data-testid={`task-item-${task.id}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'crucial' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.studyTitle} • Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    {task.priority === 'crucial' && (
                      <Badge variant="destructive" className="text-xs">Crucial</Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
