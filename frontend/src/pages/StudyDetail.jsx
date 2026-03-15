import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  ArrowLeft, 
  History, 
  Pencil, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  AlertTriangle,
  Users,
  DollarSign,
  Building2,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
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

const getExpiryBadge = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const daysRemaining = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) {
    return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', text: 'Expired' };
  }
  if (daysRemaining <= 30) {
    return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', text: `${daysRemaining} days` };
  }
  if (daysRemaining <= 60) {
    return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', text: `${daysRemaining} days` };
  }
  return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', text: '> 60 days' };
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Change Reason Modal Component
const ChangeReasonModal = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this change');
      return;
    }
    onConfirm(reason, note);
    setReason('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="change-reason-modal">
        <DialogHeader>
          <DialogTitle>Reason for Change</DialogTitle>
          <DialogDescription>
            Please provide a reason for this modification (required for audit trail).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Updated enrollment data, Corrected budget figures..."
              data-testid="change-reason-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Additional Notes (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional context..."
              data-testid="change-note-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} data-testid="confirm-change-btn">Confirm Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// History Modal Component
const HistoryModal = ({ open, onClose, history }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="history-modal">
        <DialogHeader>
          <DialogTitle>Change History</DialogTitle>
          <DialogDescription>
            Audit trail of all modifications to this study
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No changes recorded yet</p>
          ) : (
            <div className="space-y-3">
              {[...history].reverse().map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{entry.section}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium">{entry.reason}</p>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground">{entry.note}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Study Info Modal
const EditStudyInfoModal = ({ open, onClose, study, onSave }) => {
  const [formData, setFormData] = useState({
    longTitle: study?.longTitle || '',
    pi: study?.pi || '',
    phase: study?.phase || '',
    status: study?.status || 'active',
    irbApprovalDate: study?.irbApprovalDate || '',
    irbExpiryDate: study?.irbExpiryDate || '',
    grantStartDate: study?.grantStartDate || '',
    grantEndDate: study?.grantEndDate || ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="edit-study-info-modal">
        <DialogHeader>
          <DialogTitle>Edit Study Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Long Title</Label>
            <Textarea
              value={formData.longTitle}
              onChange={(e) => setFormData({...formData, longTitle: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Principal Investigator</Label>
              <Input
                value={formData.pi}
                onChange={(e) => setFormData({...formData, pi: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Input
                value={formData.phase}
                onChange={(e) => setFormData({...formData, phase: e.target.value})}
              />
            </div>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} data-testid="save-study-info-btn">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Fund Modal
const EditFundModal = ({ open, onClose, fund, onSave }) => {
  const [formData, setFormData] = useState({
    grantBody: fund?.grantBody || '',
    ioCode: fund?.ioCode || '',
    categories: fund?.categories || []
  });

  const updateCategory = (index, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = { ...newCategories[index], [field]: parseFloat(value) || 0 };
    setFormData({ ...formData, categories: newCategories });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="edit-fund-modal">
        <DialogHeader>
          <DialogTitle>Edit Fund Overview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grant Body</Label>
              <Input
                value={formData.grantBody}
                onChange={(e) => setFormData({...formData, grantBody: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>IO Code</Label>
              <Input
                value={formData.ioCode}
                onChange={(e) => setFormData({...formData, ioCode: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Budget Categories</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Initial ($)</TableHead>
                  <TableHead>Used ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.categories.map((cat, i) => (
                  <TableRow key={i}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={cat.initial}
                        onChange={(e) => updateCategory(i, 'initial', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={cat.used}
                        onChange={(e) => updateCategory(i, 'used', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)} data-testid="save-fund-btn">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Recruitment Modal
const EditRecruitmentModal = ({ open, onClose, recruitment, onSave }) => {
  const [sites, setSites] = useState(recruitment?.sites || []);

  const updateSite = (index, field, value) => {
    const newSites = [...sites];
    newSites[index] = { ...newSites[index], [field]: field === 'name' ? value : parseInt(value) || 0 };
    setSites(newSites);
  };

  const addSite = () => {
    setSites([...sites, { name: 'New Site', screened: 0, enrolled: 0, failed: 0 }]);
  };

  const removeSite = (index) => {
    setSites(sites.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" data-testid="edit-recruitment-modal">
        <DialogHeader>
          <DialogTitle>Edit Recruitment Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Screened</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      value={site.name}
                      onChange={(e) => updateSite(i, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={site.screened}
                      onChange={(e) => updateSite(i, 'screened', e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={site.enrolled}
                      onChange={(e) => updateSite(i, 'enrolled', e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={site.failed}
                      onChange={(e) => updateSite(i, 'failed', e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeSite(i)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="outline" onClick={addSite}>
            <Plus className="w-4 h-4 mr-2" /> Add Site
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ sites })} data-testid="save-recruitment-btn">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Demographics Modal
const EditDemographicsModal = ({ open, onClose, demographics, onSave }) => {
  const [formData, setFormData] = useState({
    gender: demographics?.gender || { male: 0, female: 0, other: 0 },
    ethnicity: demographics?.ethnicity || {}
  });

  const updateGender = (key, value) => {
    setFormData({
      ...formData,
      gender: { ...formData.gender, [key]: parseInt(value) || 0 }
    });
  };

  const updateEthnicity = (key, value) => {
    setFormData({
      ...formData,
      ethnicity: { ...formData.ethnicity, [key]: parseInt(value) || 0 }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="edit-demographics-modal">
        <DialogHeader>
          <DialogTitle>Edit Demographics</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Gender</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Male</Label>
                <Input
                  type="number"
                  value={formData.gender.male}
                  onChange={(e) => updateGender('male', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Female</Label>
                <Input
                  type="number"
                  value={formData.gender.female}
                  onChange={(e) => updateGender('female', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Other</Label>
                <Input
                  type="number"
                  value={formData.gender.other}
                  onChange={(e) => updateGender('other', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-base font-semibold">Race/Ethnicity</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.ethnicity).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key}</Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => updateEthnicity(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)} data-testid="save-demographics-btn">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Team Modal
const EditTeamModal = ({ open, onClose, team, onSave }) => {
  const [members, setMembers] = useState(team || []);

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { id: crypto.randomUUID(), name: '', role: '', dateAdded: new Date().toISOString().split('T')[0] }]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="edit-team-modal">
        <DialogHeader>
          <DialogTitle>Edit Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {members.map((member, i) => (
            <Card key={member.id} className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={member.role}
                    onChange={(e) => updateMember(i, 'role', e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Date Added</Label>
                    <Input
                      type="date"
                      value={member.dateAdded}
                      onChange={(e) => updateMember(i, 'dateAdded', e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMember(i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <Button variant="outline" onClick={addMember}>
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(members)} data-testid="save-team-btn">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Tags Modal
const EditTagsModal = ({ open, onClose, tags, onSave }) => {
  const [tagList, setTagList] = useState(tags || []);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tagList.includes(newTag.trim())) {
      setTagList([...tagList, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setTagList(tagList.filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="edit-tags-modal">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tagList.map(tag => (
              <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                {tag}
                <button 
                  onClick={() => removeTag(tag)} 
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(tagList)} data-testid="save-tags-btn">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Section Header Component
const SectionHeader = ({ title, icon: Icon, onEdit }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-semibold font-[Manrope]">{title}</h3>
    </div>
    <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`edit-${title.toLowerCase().replace(/\s+/g, '-')}-btn`}>
      <Pencil className="w-4 h-4" />
    </Button>
  </div>
);

export default function StudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudyById, updateStudy, updateTask, addTask, deleteTask } = useData();
  
  const study = getStudyById(id);
  
  // Section collapse states
  const [infoOpen, setInfoOpen] = useState(true);
  const [fundOpen, setFundOpen] = useState(true);
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);
  const [demographicsOpen, setDemographicsOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  
  // Modal states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editFundOpen, setEditFundOpen] = useState(false);
  const [editRecruitmentOpen, setEditRecruitmentOpen] = useState(false);
  const [editDemographicsOpen, setEditDemographicsOpen] = useState(false);
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  
  // Change reason modal
  const [changeReasonOpen, setChangeReasonOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  if (!study) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <p className="text-muted-foreground mb-4">Study not found</p>
        <Button onClick={() => navigate('/studies')}>Back to Studies</Button>
      </div>
    );
  }

  const handleSaveWithReason = (section, updates) => {
    setPendingUpdate({ section, updates });
    setChangeReasonOpen(true);
  };

  const confirmChange = (reason, note) => {
    if (pendingUpdate) {
      updateStudy(id, {
        ...pendingUpdate.updates,
        section: pendingUpdate.section,
        changes: pendingUpdate.updates
      }, reason, note);
      setPendingUpdate(null);
      toast.success('Changes saved successfully');
    }
  };

  // Calculate metrics
  const totalEnrolled = study.recruitment.sites.reduce((sum, site) => sum + site.enrolled, 0);
  const totalScreened = study.recruitment.sites.reduce((sum, site) => sum + site.screened, 0);
  const totalBudget = study.fund.categories.reduce((sum, cat) => sum + cat.initial, 0);
  const usedBudget = study.fund.categories.reduce((sum, cat) => sum + cat.used, 0);

  // Chart data
  const genderData = Object.entries(study.demographics.gender).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })).filter(d => d.value > 0);

  const ethnicityData = Object.entries(study.demographics.ethnicity).map(([name, value]) => ({
    name,
    value
  })).filter(d => d.value > 0);

  const recruitmentChartData = study.recruitment.sites.map(site => ({
    name: site.name.length > 15 ? site.name.slice(0, 15) + '...' : site.name,
    Screened: site.screened,
    Enrolled: site.enrolled,
    Failed: site.failed
  }));

  const irbExpiry = getExpiryBadge(study.irbExpiryDate);
  const grantExpiry = getExpiryBadge(study.grantEndDate);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="study-detail-page">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/studies')} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-[Manrope]">{study.shortTitle}</h1>
              <StatusBadge status={study.status} />
            </div>
            <p className="text-muted-foreground mt-1">{study.ecosRef}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setHistoryOpen(true)} data-testid="history-btn">
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      {/* Study Information Section */}
      <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-study-info">
              <SectionHeader 
                title="Study Information" 
                icon={Calendar} 
                onEdit={() => setEditInfoOpen(true)} 
              />
              {infoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Long Title</Label>
                <p className="mt-1">{study.longTitle}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground">Principal Investigator</Label>
                  <p className="mt-1 font-medium">{study.pi}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phase</Label>
                  <p className="mt-1 font-medium">{study.phase}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IRB Dates</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm">{new Date(study.irbApprovalDate).toLocaleDateString()} - {new Date(study.irbExpiryDate).toLocaleDateString()}</p>
                    <Badge className={`${irbExpiry.color} border-0 text-xs`}>{irbExpiry.text}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grant Period</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm">{new Date(study.grantStartDate).toLocaleDateString()} - {new Date(study.grantEndDate).toLocaleDateString()}</p>
                    <Badge className={`${grantExpiry.color} border-0 text-xs`}>{grantExpiry.text}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Fund Overview Section */}
      <Collapsible open={fundOpen} onOpenChange={setFundOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-fund-overview">
              <div className="flex items-center gap-4">
                <SectionHeader 
                  title="Fund Overview" 
                  icon={DollarSign} 
                  onEdit={() => setEditFundOpen(true)} 
                />
                <Badge variant="outline" className="font-normal">
                  <Building2 className="w-3 h-3 mr-1" />
                  {study.fund.grantBody}
                </Badge>
              </div>
              {fundOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="font-mono">{study.fund.ioCode}</Badge>
                <span className="text-sm text-muted-foreground">
                  Total: {formatCurrency(totalBudget)} | Used: {formatCurrency(usedBudget)} | Remaining: {formatCurrency(totalBudget - usedBudget)}
                </span>
              </div>
              <div className="space-y-3">
                {study.fund.categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-28 text-sm text-muted-foreground">{cat.name}</span>
                    <div className="flex-1">
                      <Progress value={(cat.used / cat.initial) * 100} className="h-3" />
                    </div>
                    <span className="text-sm tabular-nums w-48 text-right">
                      {formatCurrency(cat.used)} / {formatCurrency(cat.initial)}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 tabular-nums w-28 text-right">
                      {formatCurrency(cat.initial - cat.used)} left
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Recruitment Section */}
      <Collapsible open={recruitmentOpen} onOpenChange={setRecruitmentOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-recruitment">
              <SectionHeader 
                title="Recruitment" 
                icon={Users} 
                onEdit={() => setEditRecruitmentOpen(true)} 
              />
              {recruitmentOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Progress value={(totalEnrolled / study.targetEnrollment) * 100} className="h-3 flex-1" />
                      <span className="text-sm tabular-nums font-medium">{totalEnrolled}/{study.targetEnrollment}</span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead className="text-right">Screened</TableHead>
                        <TableHead className="text-right">Enrolled</TableHead>
                        <TableHead className="text-right">Failed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {study.recruitment.sites.map((site, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{site.name}</TableCell>
                          <TableCell className="text-right tabular-nums">{site.screened}</TableCell>
                          <TableCell className="text-right tabular-nums">{site.enrolled}</TableCell>
                          <TableCell className="text-right tabular-nums">{site.failed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recruitmentChartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Screened" fill="#3b82f6" />
                      <Bar dataKey="Enrolled" fill="#10b981" />
                      <Bar dataKey="Failed" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Demographics Section */}
      <Collapsible open={demographicsOpen} onOpenChange={setDemographicsOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-demographics">
              <SectionHeader 
                title="Demographics" 
                icon={Users} 
                onEdit={() => setEditDemographicsOpen(true)} 
              />
              {demographicsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Gender Distribution</h4>
                  {genderData.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {genderData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data yet</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Race/Ethnicity Distribution</h4>
                  {ethnicityData.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ethnicityData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          >
                            {ethnicityData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Team Section */}
      <Collapsible open={teamOpen} onOpenChange={setTeamOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-team">
              <SectionHeader 
                title="Team" 
                icon={Users} 
                onEdit={() => setEditTeamOpen(true)} 
              />
              {teamOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {study.team.map(member => (
                  <Card key={member.id} className="p-4">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Added {new Date(member.dateAdded).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Tags Section */}
      <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-tags">
              <SectionHeader 
                title="Tags" 
                icon={Tag} 
                onEdit={() => setEditTagsOpen(true)} 
              />
              {tagsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {study.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm py-1 px-3 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Tasks Section */}
      <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="toggle-tasks">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold font-[Manrope]">Tasks</h3>
                <Badge variant="secondary" className="ml-2">
                  {study.tasks.filter(t => !t.completed).length} pending
                </Badge>
              </div>
              {tasksOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-2">
                {study.tasks
                  .sort((a, b) => {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                    if (a.priority !== b.priority) return a.priority === 'crucial' ? -1 : 1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                  })
                  .map(task => (
                    <div 
                      key={task.id}
                      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      data-testid={`study-task-${task.id}`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => updateTask(id, task.id, { completed: !task.completed })}
                      />
                      <div className="flex-1 min-w-0">
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                        {task.priority === 'crucial' && !task.completed && (
                          <Badge variant="destructive" className="ml-2 text-xs">Crucial</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteTask(id, task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Modals */}
      <HistoryModal 
        open={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        history={study.history} 
      />
      
      <EditStudyInfoModal
        open={editInfoOpen}
        onClose={() => setEditInfoOpen(false)}
        study={study}
        onSave={(data) => {
          setEditInfoOpen(false);
          handleSaveWithReason('Study Information', data);
        }}
      />
      
      <EditFundModal
        open={editFundOpen}
        onClose={() => setEditFundOpen(false)}
        fund={study.fund}
        onSave={(data) => {
          setEditFundOpen(false);
          handleSaveWithReason('Fund Overview', { fund: data });
        }}
      />
      
      <EditRecruitmentModal
        open={editRecruitmentOpen}
        onClose={() => setEditRecruitmentOpen(false)}
        recruitment={study.recruitment}
        onSave={(data) => {
          setEditRecruitmentOpen(false);
          handleSaveWithReason('Recruitment', { recruitment: data });
        }}
      />
      
      <EditDemographicsModal
        open={editDemographicsOpen}
        onClose={() => setEditDemographicsOpen(false)}
        demographics={study.demographics}
        onSave={(data) => {
          setEditDemographicsOpen(false);
          handleSaveWithReason('Demographics', { demographics: data });
        }}
      />
      
      <EditTeamModal
        open={editTeamOpen}
        onClose={() => setEditTeamOpen(false)}
        team={study.team}
        onSave={(data) => {
          setEditTeamOpen(false);
          handleSaveWithReason('Team', { team: data });
        }}
      />
      
      <EditTagsModal
        open={editTagsOpen}
        onClose={() => setEditTagsOpen(false)}
        tags={study.tags}
        onSave={(data) => {
          setEditTagsOpen(false);
          handleSaveWithReason('Tags', { tags: data });
        }}
      />
      
      <ChangeReasonModal
        open={changeReasonOpen}
        onClose={() => {
          setChangeReasonOpen(false);
          setPendingUpdate(null);
        }}
        onConfirm={confirmChange}
      />
    </div>
  );
}
