import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, BookOpen, ExternalLink, Calendar, FileText, Eye } from 'lucide-react';

const typeColors = {
  'Journal Article': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Conference Paper': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Abstract': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Poster': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Book Chapter': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
};

export default function Publications() {
  const navigate = useNavigate();
  const { getAllPublications } = useData();
  const publications = getAllPublications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const publicationTypes = useMemo(() => {
    const types = new Set(publications.map(p => p.type));
    return ['all', ...Array.from(types)];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesSearch = 
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.studyTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || pub.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [publications, searchQuery, typeFilter]);

  const typeCounts = useMemo(() => {
    return publications.reduce((acc, pub) => {
      acc[pub.type] = (acc[pub.type] || 0) + 1;
      return acc;
    }, {});
  }, [publications]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="publications-page">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-[Manrope]">Publications</h1>
        <p className="text-muted-foreground mt-2">Research outputs and publications from all studies</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold tabular-nums">{publications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(typeCounts).slice(0, 3).map(([type, count]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[type]?.split(' ')[0] || 'bg-gray-100'}`}>
                  <FileText className={`w-5 h-5 ${typeColors[type]?.split(' ')[1] || 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{type}</p>
                  <p className="text-xl font-bold tabular-nums">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search publications by title or study..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-publications-input"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="type-filter-select">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {publicationTypes.filter(t => t !== 'all').map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Publications List */}
      {filteredPublications.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No publications found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPublications.map(pub => (
            <Card 
              key={pub.id} 
              className="hover:shadow-md transition-shadow"
              data-testid={`publication-card-${pub.id}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <Badge className={`${typeColors[pub.type] || 'bg-gray-100 text-gray-800'} border-0 shrink-0`}>
                        {pub.type}
                      </Badge>
                      <h3 className="font-semibold text-lg leading-tight">{pub.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button 
                        onClick={() => navigate(`/studies/${pub.studyId}`)}
                        className="hover:text-primary hover:underline"
                      >
                        {pub.studyTitle}
                      </button>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pub.date).toLocaleDateString('en-US', { 
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  {pub.link && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(pub.link, '_blank')}
                      data-testid={`view-publication-${pub.id}`}
                      title="View Publication"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
