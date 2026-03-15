import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { seedStudies, initializeData } from '../data/seedData';

const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
  const [studies, setStudies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const data = initializeData();
    setStudies(data.studies || []);
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever studies change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('rescue-data', JSON.stringify({ studies }));
    }
  }, [studies, isLoaded]);

  const getStudyById = useCallback((id) => {
    return studies.find(s => s.id === id);
  }, [studies]);

  const updateStudy = useCallback((id, updates, changeReason, changeNote = '') => {
    setStudies(prev => prev.map(study => {
      if (study.id !== id) return study;
      
      const historyEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        section: updates.section || 'General',
        reason: changeReason,
        note: changeNote,
        changes: updates.changes || {}
      };

      const { section, changes, ...actualUpdates } = updates;
      
      return {
        ...study,
        ...actualUpdates,
        history: [...(study.history || []), historyEntry]
      };
    }));
  }, []);

  const addStudy = useCallback((newStudy) => {
    const studyWithId = {
      ...newStudy,
      id: crypto.randomUUID(),
      history: [],
      tasks: [],
      publications: [],
      team: []
    };
    setStudies(prev => [...prev, studyWithId]);
    return studyWithId;
  }, []);

  const deleteStudy = useCallback((id) => {
    setStudies(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateTask = useCallback((studyId, taskId, updates) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      return {
        ...study,
        tasks: study.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      };
    }));
  }, []);

  const addTask = useCallback((studyId, task) => {
    const taskWithId = { ...task, id: crypto.randomUUID() };
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      return {
        ...study,
        tasks: [...study.tasks, taskWithId]
      };
    }));
    return taskWithId;
  }, []);

  const deleteTask = useCallback((studyId, taskId) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      return {
        ...study,
        tasks: study.tasks.filter(t => t.id !== taskId)
      };
    }));
  }, []);

  const deletePublication = useCallback((studyId, pubId) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      return {
        ...study,
        publications: study.publications.filter(p => p.id !== pubId)
      };
    }));
  }, []);

  const updateStudyDirect = useCallback((id, updates) => {
    // Direct update without audit trail (for optional reason changes like tags/publications)
    setStudies(prev => prev.map(study => {
      if (study.id !== id) return study;
      return { ...study, ...updates };
    }));
  }, []);

  const getAllTasks = useCallback(() => {
    return studies.flatMap(study => 
      study.tasks.map(task => ({
        ...task,
        studyId: study.id,
        studyTitle: study.shortTitle
      }))
    );
  }, [studies]);

  const getAllGrants = useCallback(() => {
    // Filter out studies without funds (no categories or empty categories)
    return studies
      .filter(study => study.fund.categories && study.fund.categories.length > 0)
      .map(study => ({
        studyId: study.id,
        studyTitle: study.shortTitle,
        status: study.status,
        ioCode: study.fund.ioCode,
        grantBody: study.fund.grantBody,
        categories: study.fund.categories,
        grantStartDate: study.grantStartDate,
        grantEndDate: study.grantEndDate
      }));
  }, [studies]);

  const getAllPublications = useCallback(() => {
    return studies.flatMap(study => 
      study.publications.map(pub => ({
        ...pub,
        studyId: study.id,
        studyTitle: study.shortTitle
      }))
    );
  }, [studies]);

  const exportData = useCallback(() => {
    const data = JSON.stringify({ studies }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rescue-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [studies]);

  const importData = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.studies && Array.isArray(data.studies)) {
        setStudies(data.studies);
        return { success: true };
      }
      return { success: false, error: 'Invalid data format' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const resetToSeed = useCallback(() => {
    setStudies(seedStudies);
  }, []);

  const getMetrics = useCallback(() => {
    const activeStudies = studies.filter(s => s.status === 'active').length;
    const completedStudies = studies.filter(s => s.status === 'completed').length;
    const pendingTasks = getAllTasks().filter(t => !t.completed).length;
    const totalPublications = getAllPublications().length;
    
    return { activeStudies, completedStudies, pendingTasks, totalPublications };
  }, [studies, getAllTasks, getAllPublications]);

  return (
    <DataContext.Provider value={{
      studies,
      isLoaded,
      getStudyById,
      updateStudy,
      updateStudyDirect,
      addStudy,
      deleteStudy,
      updateTask,
      addTask,
      deleteTask,
      deletePublication,
      getAllTasks,
      getAllGrants,
      getAllPublications,
      exportData,
      importData,
      resetToSeed,
      getMetrics
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
