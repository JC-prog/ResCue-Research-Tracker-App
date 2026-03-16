import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { seedStudies } from '../data/seedData';

const DataContext = createContext(undefined);

const API = 'http://localhost:3001';

export const DataProvider = ({ children }) => {
  const [studies, setStudies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load studies from json-server on mount
  useEffect(() => {
    fetch(`${API}/studies`)
      .then(res => res.json())
      .then(data => {
        setStudies(data);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  const getStudyById = useCallback((id) => {
    return studies.find(s => s.id === id);
  }, [studies]);

  const markStudyOpened = useCallback((id) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== id) return study;
      const updated = { ...study, lastOpened: new Date().toISOString() };
      fetch(`${API}/studies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    }));
  }, []);

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

      const updated = {
        ...study,
        ...actualUpdates,
        history: [...(study.history || []), historyEntry]
      };

      fetch(`${API}/studies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});

      return updated;
    }));
  }, []);

  const addStudy = useCallback(async (newStudy) => {
    const studyWithId = {
      ...newStudy,
      id: crypto.randomUUID(),
      history: [],
      tasks: [],
      publications: [],
      team: []
    };
    await fetch(`${API}/studies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studyWithId)
    });
    setStudies(prev => [...prev, studyWithId]);
    return studyWithId;
  }, []);

  const deleteStudy = useCallback(async (id) => {
    await fetch(`${API}/studies/${id}`, { method: 'DELETE' });
    setStudies(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateTask = useCallback((studyId, taskId, updates) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      const updated = {
        ...study,
        tasks: study.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      };
      fetch(`${API}/studies/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    }));
  }, []);

  const addTask = useCallback((studyId, task) => {
    const taskWithId = { ...task, id: crypto.randomUUID() };
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      const updated = {
        ...study,
        tasks: [...study.tasks, taskWithId]
      };
      fetch(`${API}/studies/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    }));
    return taskWithId;
  }, []);

  const deleteTask = useCallback((studyId, taskId) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      const updated = {
        ...study,
        tasks: study.tasks.filter(t => t.id !== taskId)
      };
      fetch(`${API}/studies/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    }));
  }, []);

  const deletePublication = useCallback((studyId, pubId) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== studyId) return study;
      const updated = {
        ...study,
        publications: study.publications.filter(p => p.id !== pubId)
      };
      fetch(`${API}/studies/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    }));
  }, []);

  const updateStudyDirect = useCallback((id, updates) => {
    setStudies(prev => prev.map(study => {
      if (study.id !== id) return study;
      const updated = { ...study, ...updates };
      fetch(`${API}/studies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
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

  const importData = useCallback(async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.studies && Array.isArray(data.studies)) {
        // Delete all existing studies
        await Promise.all(
          studies.map(s => fetch(`${API}/studies/${s.id}`, { method: 'DELETE' }))
        );
        // Insert all imported studies
        await Promise.all(
          data.studies.map(s =>
            fetch(`${API}/studies`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(s)
            })
          )
        );
        setStudies(data.studies);
        return { success: true };
      }
      return { success: false, error: 'Invalid data format' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [studies]);

  const resetToSeed = useCallback(async () => {
    await Promise.all(
      studies.map(s => fetch(`${API}/studies/${s.id}`, { method: 'DELETE' }))
    );
    await Promise.all(
      seedStudies.map(s =>
        fetch(`${API}/studies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s)
        })
      )
    );
    setStudies(seedStudies);
  }, [studies]);

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
      markStudyOpened,
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
