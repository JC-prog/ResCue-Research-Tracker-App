import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
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
import { Search, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

const StudyCard = ({ study, onClick, onDelete }) => {
  const totalEnrolled = study.recruitment.sites.reduce((sum, site) => sum + site.enrolled, 0);
  const enrollmentProgress = study.targetEnrollment > 0 
    ? (totalEnrolled / study.targetEnrollment) * 100 
    : 0;
  
  const totalBudget = study.fund.categories.reduce((sum, cat) => sum + cat.initial, 0);
  const usedBudget = study.fund.categories.reduce((sum, cat) => sum + cat.used, 0);
  const remainingBudget = totalBudget - usedBudget;
  const percentRemaining = totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0;
  const budgetProgress = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(study);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow animate-fade-in relative group"
      onClick={onClick}
      data-testid={`study-card-${study.shortTitle.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
        data-testid={`delete-study-${study.id}`}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between pr-8">
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

// Add Study Modal
const AddStudyModal = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    shortTitle: '',
    longTitle: '',
    pi: '',
    phase: 'Phase I',
    status: 'pending',
    ecosRef: '',
    irbApprovalDate: new Date().toISOString().split('T')[0],
    irbExpiryDate: '',
    grantStartDate: new Date().toISOString().split('T')[0],
    grantEndDate: '',
    targetEnrollment: 100,
    grantBody: '',
    tags: []
  });

  const handleSave = () => {
    if (!formData.shortTitle.trim()) {
      toast.error('Please enter a short title');
      return;
    }
    if (!formData.pi.trim()) {
      toast.error('Please enter a Principal Investigator');
      return;
    }
    
    const newStudy = {
      ...formData,
      fund: {
        grantBody: formData.grantBody || 'TBD',
        categories: [
          { name: 'Manpower', ioCode: 'IO-NEW-MP-0001', initial: 0, used: 0 },
          { name: 'Equipment', ioCode: 'IO-NEW-EQ-0002', initial: 0, used: 0 },
          { name: 'Miscellaneous', ioCode: 'IO-NEW-MS-0003', initial: 0, used: 0 },
          { name: 'Travel', ioCode: 'IO-NEW-TR-0004', initial: 0, used: 0 }
        ]
      },
      recruitment: {
        sites: [{ name: 'Primary Site', screened: 0, enrolled: 0, failed: 0 }]
      },
      demographics: {
        gender: { male: 0, female: 0, other: 0 },
        ethnicity: {}
      },
      team: [],
      tasks: [],
      publications: [],
      history: []
    };
    
    onSave(newStudy);
    setFormData({
      shortTitle: '',
      longTitle: '',
      pi: '',
      phase: 'Phase I',
      status: 'pending',
      ecosRef: '',
      irbApprovalDate: new Date().toISOString().split('T')[0],
      irbExpiryDate: '',
      grantStartDate: new Date().toISOString().split('T')[0],
      grantEndDate: '',
      targetEnrollment: 100,
      grantBody: '',
      tags: []
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="add-study-modal">
        <DialogHeader>
          <DialogTitle>Add New Study</DialogTitle>
          <DialogDescription>Create a new research study entry</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Short Title *</Label>
              <Input
                value={formData.shortTitle}
                onChange={(e) => setFormData({...formData, shortTitle: e.target.value})}
                placeholder="e.g., CardioFit"
                data-testid="study-short-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label>ECOS Reference</Label>
              <Input
                value={formData.ecosRef}
                onChange={(e) => setFormData({...formData, ecosRef: e.target.value})}
                placeholder="e.g., ECOS-2025-001"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Long Title</Label>
            <Textarea
              value={formData.longTitle}
              onChange={(e) => setFormData({...formData, longTitle: e.target.value})}
              placeholder="Full study title..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Principal Investigator *</Label>
              <Input
                value={formData.pi}
                onChange={(e) => setFormData({...formData, pi: e.target.value})}
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select value={formData.phase} onValueChange={(v) => setFormData({...formData, phase: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phase I">Phase I</SelectItem>
                  <SelectItem value="Phase II">Phase II</SelectItem>
                  <SelectItem value="Phase III">Phase III</SelectItem>
                  <SelectItem value="Phase IV">Phase IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Enrollment</Label>
              <Input
                type="number"
                value={formData.targetEnrollment}
                onChange={(e) => setFormData({...formData, targetEnrollment: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IRB Approval Date</Label>
              <Input
                type="date"
                value={formData.irbApprovalDate}
                onChange={(e) => setFormData({...formData, irbApprovalDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>IRB Expiry Date</Label>
              <Input
                type="date"
                value={formData.irbExpiryDate}
                onChange={(e) => setFormData({...formData, irbExpiryDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grant Start Date</Label>
              <Input
                type="date"
                value={formData.grantStartDate}
                onChange={(e) => setFormData({...formData, grantStartDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Grant End Date</Label>
              <Input
                type="date"
                value={formData.grantEndDate}
                onChange={(e) => setFormData({...formData, grantEndDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Grant Body</Label>
            <Input
              value={formData.grantBody}
              onChange={(e) => setFormData({...formData, grantBody: e.target.value})}
              placeholder="e.g., National Institutes of Health"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} data-testid="save-new-study-btn">Create Study</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function AllStudies() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { studies, addStudy, deleteStudy } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState(null);
  
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

  const handleDeleteClick = (study) => {
    setStudyToDelete(study);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (studyToDelete) {
      deleteStudy(studyToDelete.id);
      toast.success(`Study "${studyToDelete.shortTitle}" deleted`);
      setStudyToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleAddStudy = (newStudy) => {
    addStudy(newStudy);
    toast.success(`Study "${newStudy.shortTitle}" created`);
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="all-studies-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">All Studies</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor your research portfolio</p>
        </div>
        <Button onClick={() => setAddStudyOpen(true)} data-testid="add-study-btn">
          <Plus className="w-4 h-4 mr-2" /> Add Study
        </Button>
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
          <p className="text-muted-foreground mb-4">No studies found matching your criteria</p>
          <Button onClick={() => setAddStudyOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Your First Study
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map(study => (
            <StudyCard
              key={study.id}
              study={study}
              onClick={() => navigate(`/studies/${study.id}`)}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Add Study Modal */}
      <AddStudyModal
        open={addStudyOpen}
        onClose={() => setAddStudyOpen(false)}
        onSave={handleAddStudy}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent data-testid="delete-study-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{studyToDelete?.shortTitle}"? This action cannot be undone and will remove all associated data including tasks, publications, and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-study-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
