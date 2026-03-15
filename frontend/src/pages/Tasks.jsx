import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Tasks() {
  const navigate = useNavigate();
  const { getAllTasks, updateTask, deleteTask } = useData();
  const allTasks = getAllTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.studyId, taskToDelete.id);
      toast.success('Task deleted');
      setTaskToDelete(null);
    }
    setDeleteTaskOpen(false);
  };

  const filteredTasks = useMemo(() => {
    return allTasks
      .filter(task => {
        const matchesSearch = 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.studyTitle.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = 
          statusFilter === 'all' || 
          (statusFilter === 'pending' && !task.completed) ||
          (statusFilter === 'completed' && task.completed);
        
        const matchesPriority = 
          priorityFilter === 'all' || 
          task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // Sort by completion status first
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // Then by priority
        if (a.priority !== b.priority) {
          return a.priority === 'crucial' ? -1 : 1;
        }
        // Then by due date
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  }, [allTasks, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const pending = allTasks.filter(t => !t.completed);
    const crucial = pending.filter(t => t.priority === 'crucial');
    const overdue = pending.filter(t => new Date(t.dueDate) < new Date());
    
    return {
      total: allTasks.length,
      pending: pending.length,
      completed: allTasks.filter(t => t.completed).length,
      crucial: crucial.length,
      overdue: overdue.length
    };
  }, [allTasks]);

  const handleToggleComplete = (studyId, taskId, currentCompleted) => {
    updateTask(studyId, taskId, { completed: !currentCompleted });
  };

  const getDueDateStatus = (dueDate, completed) => {
    if (completed) return 'completed';
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'soon';
    return 'normal';
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="tasks-page">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">Tasks</h1>
        <p className="text-muted-foreground mt-2">Manage tasks across all studies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold tabular-nums">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold tabular-nums">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold tabular-nums">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Crucial</p>
                <p className="text-xl font-bold tabular-nums">{stats.crucial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold tabular-nums">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-tasks-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="status-filter-select">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="priority-filter-select">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="crucial">Crucial</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTasks.map(task => {
                const dueDateStatus = getDueDateStatus(task.dueDate, task.completed);
                
                return (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                    data-testid={`task-row-${task.id}`}
                    onClick={() => navigate(`/studies/${task.studyId}`)}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.studyId, task.id, task.completed)}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`task-checkbox-${task.id}`}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        {task.priority === 'crucial' && !task.completed && (
                          <Badge variant="destructive" className="text-xs">Crucial</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{task.studyTitle}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={`
                            ${dueDateStatus === 'overdue' ? 'text-red-500 font-medium' : ''}
                            ${dueDateStatus === 'urgent' ? 'text-orange-500' : ''}
                            ${dueDateStatus === 'soon' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                          `}>
                            {new Date(task.dueDate).toLocaleDateString()}
                            {dueDateStatus === 'overdue' && ' (Overdue)'}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                        setDeleteTaskOpen(true);
                      }}
                      data-testid={`delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Task Confirmation */}
      <AlertDialog open={deleteTaskOpen} onOpenChange={setDeleteTaskOpen}>
        <AlertDialogContent data-testid="delete-task-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}" from {taskToDelete?.studyTitle}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
