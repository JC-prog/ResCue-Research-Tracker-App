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
import { Search, Users, Plus, Trash2, X } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const statusFilterOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
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
    phase: '',
    status: 'pending',
    ecosRef: '',
    irbApprovalDate: new Date().toISOString().split('T')[0],
    irbExpiryDate: '',
    grantStartDate: '',
    grantEndDate: '',
    targetEnrollment: 100,
    grantBody: '',
    hasGrant: false,
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
      fund: formData.hasGrant ? {
        grantBody: formData.grantBody || 'TBD',
        categories: [
          { name: 'Manpower', ioCode: `IO-NEW-MP-${Date.now()}`, initial: 0, used: 0 },
          { name: 'Equipment', ioCode: `IO-NEW-EQ-${Date.now()}`, initial: 0, used: 0 },
          { name: 'Miscellaneous', ioCode: `IO-NEW-MS-${Date.now()}`, initial: 0, used: 0 },
          { name: 'Travel', ioCode: `IO-NEW-TR-${Date.now()}`, initial: 0, used: 0 }
        ]
      } : {
        grantBody: 'No Grant',
        categories: []
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
      phase: '',
      status: 'pending',
      ecosRef: '',
      irbApprovalDate: new Date().toISOString().split('T')[0],
      irbExpiryDate: '',
      grantStartDate: '',
      grantEndDate: '',
      targetEnrollment: 100,
      grantBody: '',
      hasGrant: false,
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
            <Label>Study Title</Label>
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phase</Label>
              <Input
                value={formData.phase}
                onChange={(e) => setFormData({...formData, phase: e.target.value})}
                placeholder="e.g., Phase I, Phase II, Pilot, etc."
              />
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

          {/* Grant Section - Optional */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasGrant"
                checked={formData.hasGrant}
                onChange={(e) => setFormData({...formData, hasGrant: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="hasGrant" className="cursor-pointer font-medium">This study has a grant</Label>
            </div>
            
            {formData.hasGrant && (
              <>
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
              </>
            )}
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
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState(null);

  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery('');
  };

  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      const matchesSearch = 
        study.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.longTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.pi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.ecosRef.toLowerCase().includes(searchQuery.toLowerCase());
      
      // If no statuses selected, show all
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(study.status);
      
      return matchesSearch && matchesStatus;
    });
  }, [studies, searchQuery, selectedStatuses]);

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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search studies by title, PI, or ECOS ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="search-studies-input"
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        {statusFilterOptions.map(status => (
          <label 
            key={status.value}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all ${
              selectedStatuses.includes(status.value) 
                ? status.color + ' ring-2 ring-offset-2 ring-primary/50' 
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <Checkbox
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={() => toggleStatus(status.value)}
              className="w-4 h-4"
              data-testid={`filter-status-${status.value}`}
            />
            <span className="text-sm font-medium">{status.label} ({statusCounts[status.value] || 0})</span>
          </label>
        ))}
        {(selectedStatuses.length > 0 || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
            data-testid="clear-filters-btn"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
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
