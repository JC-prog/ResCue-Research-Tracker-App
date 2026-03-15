import { v4 as uuidv4 } from 'uuid';

const generateId = () => uuidv4();

export const seedStudies = [
  {
    id: generateId(),
    shortTitle: 'Optomed',
    longTitle: 'Optimizing Medication Adherence Through Digital Intervention in Chronic Disease Management',
    pi: 'Dr. Sarah Chen',
    phase: 'Phase III',
    status: 'active',
    ecosRef: 'ECOS-2024-001',
    irbApprovalDate: '2024-01-15',
    irbExpiryDate: '2025-06-15',
    grantStartDate: '2024-02-01',
    grantEndDate: '2025-08-01',
    targetEnrollment: 250,
    tags: ['Chronic Disease', 'Digital Health', 'Medication Adherence'],
    fund: {
      grantBody: 'National Institutes of Health',
      ioCode: 'IO-NIH-2024-3421',
      categories: [
        { name: 'Manpower', initial: 150000, used: 89500 },
        { name: 'Equipment', initial: 50000, used: 42000 },
        { name: 'Consumables', initial: 30000, used: 18500 },
        { name: 'Travel', initial: 20000, used: 8200 }
      ]
    },
    recruitment: {
      sites: [
        { name: 'Main Hospital', screened: 180, enrolled: 145, failed: 35 },
        { name: 'Community Clinic A', screened: 85, enrolled: 62, failed: 23 },
        { name: 'Community Clinic B', screened: 45, enrolled: 28, failed: 17 }
      ]
    },
    demographics: {
      gender: { male: 112, female: 118, other: 5 },
      ethnicity: {
        'White': 95,
        'Black/African American': 68,
        'Hispanic/Latino': 42,
        'Asian': 22,
        'Other': 8
      }
    },
    team: [
      { id: generateId(), name: 'Dr. Sarah Chen', role: 'Principal Investigator', dateAdded: '2024-01-10' },
      { id: generateId(), name: 'Dr. Michael Torres', role: 'Co-Investigator', dateAdded: '2024-01-10' },
      { id: generateId(), name: 'Emily Johnson', role: 'Research Coordinator', dateAdded: '2024-01-15' },
      { id: generateId(), name: 'David Kim', role: 'Data Analyst', dateAdded: '2024-02-01' }
    ],
    tasks: [
      { id: generateId(), title: 'Submit quarterly IRB report', priority: 'crucial', completed: false, dueDate: '2025-01-30' },
      { id: generateId(), title: 'Review enrollment metrics', priority: 'normal', completed: true, dueDate: '2025-01-15' },
      { id: generateId(), title: 'Update consent forms', priority: 'crucial', completed: false, dueDate: '2025-02-15' }
    ],
    publications: [
      { id: generateId(), title: 'Digital Health Interventions in Chronic Disease: A Preliminary Analysis', type: 'Journal Article', link: 'https://example.com/pub1', date: '2024-08-15' }
    ],
    history: []
  },
  {
    id: generateId(),
    shortTitle: 'VR Rehab',
    longTitle: 'Virtual Reality-Based Rehabilitation for Post-Stroke Motor Recovery',
    pi: 'Dr. James Wilson',
    phase: 'Phase II',
    status: 'active',
    ecosRef: 'ECOS-2024-002',
    irbApprovalDate: '2024-03-01',
    irbExpiryDate: '2025-03-01',
    grantStartDate: '2024-04-01',
    grantEndDate: '2026-03-31',
    targetEnrollment: 120,
    tags: ['Neurology', 'VR Technology', 'Rehabilitation'],
    fund: {
      grantBody: 'American Heart Association',
      ioCode: 'IO-AHA-2024-7892',
      categories: [
        { name: 'Manpower', initial: 200000, used: 75000 },
        { name: 'Equipment', initial: 80000, used: 65000 },
        { name: 'Consumables', initial: 15000, used: 8000 },
        { name: 'Travel', initial: 25000, used: 5000 }
      ]
    },
    recruitment: {
      sites: [
        { name: 'Neuro Rehab Center', screened: 95, enrolled: 68, failed: 27 },
        { name: 'University Hospital', screened: 55, enrolled: 35, failed: 20 }
      ]
    },
    demographics: {
      gender: { male: 58, female: 44, other: 1 },
      ethnicity: {
        'White': 48,
        'Black/African American': 28,
        'Hispanic/Latino': 15,
        'Asian': 8,
        'Other': 4
      }
    },
    team: [
      { id: generateId(), name: 'Dr. James Wilson', role: 'Principal Investigator', dateAdded: '2024-03-01' },
      { id: generateId(), name: 'Dr. Lisa Park', role: 'Co-Investigator', dateAdded: '2024-03-01' },
      { id: generateId(), name: 'Robert Martinez', role: 'VR Technician', dateAdded: '2024-03-15' }
    ],
    tasks: [
      { id: generateId(), title: 'Calibrate VR equipment', priority: 'normal', completed: false, dueDate: '2025-01-25' },
      { id: generateId(), title: 'Submit progress report to AHA', priority: 'crucial', completed: false, dueDate: '2025-02-01' }
    ],
    publications: [],
    history: []
  },
  {
    id: generateId(),
    shortTitle: 'NeuroShield',
    longTitle: 'Neuroprotective Agents in Traumatic Brain Injury: A Multicenter Trial',
    pi: 'Dr. Amanda Roberts',
    phase: 'Phase III',
    status: 'completed',
    ecosRef: 'ECOS-2023-015',
    irbApprovalDate: '2023-02-15',
    irbExpiryDate: '2024-12-15',
    grantStartDate: '2023-03-01',
    grantEndDate: '2024-12-31',
    targetEnrollment: 400,
    tags: ['Neurology', 'TBI', 'Neuroprotection', 'Multicenter'],
    fund: {
      grantBody: 'Department of Defense',
      ioCode: 'IO-DOD-2023-1456',
      categories: [
        { name: 'Manpower', initial: 350000, used: 348000 },
        { name: 'Equipment', initial: 100000, used: 95000 },
        { name: 'Consumables', initial: 75000, used: 72000 },
        { name: 'Travel', initial: 50000, used: 48500 }
      ]
    },
    recruitment: {
      sites: [
        { name: 'Trauma Center Alpha', screened: 220, enrolled: 165, failed: 55 },
        { name: 'Trauma Center Beta', screened: 180, enrolled: 142, failed: 38 },
        { name: 'Trauma Center Gamma', screened: 130, enrolled: 93, failed: 37 }
      ]
    },
    demographics: {
      gender: { male: 285, female: 112, other: 3 },
      ethnicity: {
        'White': 180,
        'Black/African American': 95,
        'Hispanic/Latino': 72,
        'Asian': 35,
        'Other': 18
      }
    },
    team: [
      { id: generateId(), name: 'Dr. Amanda Roberts', role: 'Principal Investigator', dateAdded: '2023-02-01' },
      { id: generateId(), name: 'Dr. Kevin Zhang', role: 'Co-Investigator', dateAdded: '2023-02-01' },
      { id: generateId(), name: 'Dr. Maria Santos', role: 'Site Lead - Beta', dateAdded: '2023-02-15' },
      { id: generateId(), name: 'Jennifer Lee', role: 'Project Manager', dateAdded: '2023-02-10' }
    ],
    tasks: [
      { id: generateId(), title: 'Final data analysis', priority: 'crucial', completed: true, dueDate: '2024-11-30' },
      { id: generateId(), title: 'Prepare final report', priority: 'normal', completed: true, dueDate: '2024-12-15' }
    ],
    publications: [
      { id: generateId(), title: 'Neuroprotective Agents in TBI: Phase III Results', type: 'Journal Article', link: 'https://example.com/pub2', date: '2024-11-01' },
      { id: generateId(), title: 'Long-term Outcomes in TBI Patients Receiving Neuroprotective Treatment', type: 'Conference Paper', link: 'https://example.com/pub3', date: '2024-12-05' }
    ],
    history: []
  },
  {
    id: generateId(),
    shortTitle: 'PedVax',
    longTitle: 'Pediatric Vaccination Response in Immunocompromised Children',
    pi: 'Dr. Rachel Green',
    phase: 'Phase II',
    status: 'pending',
    ecosRef: 'ECOS-2025-001',
    irbApprovalDate: '2025-01-10',
    irbExpiryDate: '2026-01-10',
    grantStartDate: '2025-02-01',
    grantEndDate: '2027-01-31',
    targetEnrollment: 180,
    tags: ['Pediatrics', 'Immunology', 'Vaccination'],
    fund: {
      grantBody: 'CDC Foundation',
      ioCode: 'IO-CDC-2025-0891',
      categories: [
        { name: 'Manpower', initial: 180000, used: 0 },
        { name: 'Equipment', initial: 40000, used: 0 },
        { name: 'Consumables', initial: 60000, used: 0 },
        { name: 'Travel', initial: 30000, used: 0 }
      ]
    },
    recruitment: {
      sites: [
        { name: 'Children\'s Hospital Main', screened: 0, enrolled: 0, failed: 0 },
        { name: 'Pediatric Clinic East', screened: 0, enrolled: 0, failed: 0 }
      ]
    },
    demographics: {
      gender: { male: 0, female: 0, other: 0 },
      ethnicity: {
        'White': 0,
        'Black/African American': 0,
        'Hispanic/Latino': 0,
        'Asian': 0,
        'Other': 0
      }
    },
    team: [
      { id: generateId(), name: 'Dr. Rachel Green', role: 'Principal Investigator', dateAdded: '2025-01-05' },
      { id: generateId(), name: 'Dr. Thomas Brown', role: 'Co-Investigator', dateAdded: '2025-01-05' }
    ],
    tasks: [
      { id: generateId(), title: 'Finalize protocol amendments', priority: 'crucial', completed: false, dueDate: '2025-01-28' },
      { id: generateId(), title: 'Set up recruitment sites', priority: 'crucial', completed: false, dueDate: '2025-02-15' },
      { id: generateId(), title: 'Order initial supplies', priority: 'normal', completed: false, dueDate: '2025-02-01' }
    ],
    publications: [],
    history: []
  },
  {
    id: generateId(),
    shortTitle: 'FLEX',
    longTitle: 'Flexible Exercise Prescription for Elderly Patients with Osteoarthritis',
    pi: 'Dr. William Hayes',
    phase: 'Phase IV',
    status: 'on-hold',
    ecosRef: 'ECOS-2024-008',
    irbApprovalDate: '2024-05-01',
    irbExpiryDate: '2025-02-01',
    grantStartDate: '2024-06-01',
    grantEndDate: '2025-12-31',
    targetEnrollment: 300,
    tags: ['Geriatrics', 'Orthopedics', 'Exercise Medicine'],
    fund: {
      grantBody: 'Arthritis Foundation',
      ioCode: 'IO-AF-2024-5567',
      categories: [
        { name: 'Manpower', initial: 120000, used: 45000 },
        { name: 'Equipment', initial: 25000, used: 20000 },
        { name: 'Consumables', initial: 20000, used: 8000 },
        { name: 'Travel', initial: 15000, used: 3000 }
      ]
    },
    recruitment: {
      sites: [
        { name: 'Senior Care Center', screened: 85, enrolled: 52, failed: 33 },
        { name: 'Orthopedic Clinic', screened: 45, enrolled: 28, failed: 17 }
      ]
    },
    demographics: {
      gender: { male: 32, female: 48, other: 0 },
      ethnicity: {
        'White': 55,
        'Black/African American': 12,
        'Hispanic/Latino': 8,
        'Asian': 3,
        'Other': 2
      }
    },
    team: [
      { id: generateId(), name: 'Dr. William Hayes', role: 'Principal Investigator', dateAdded: '2024-05-01' },
      { id: generateId(), name: 'Nancy Thompson', role: 'Physical Therapist', dateAdded: '2024-05-15' },
      { id: generateId(), name: 'Carlos Rivera', role: 'Research Assistant', dateAdded: '2024-06-01' }
    ],
    tasks: [
      { id: generateId(), title: 'Renew IRB approval', priority: 'crucial', completed: false, dueDate: '2025-01-20' },
      { id: generateId(), title: 'Address safety concerns', priority: 'crucial', completed: false, dueDate: '2025-01-25' },
      { id: generateId(), title: 'Resume patient enrollment', priority: 'normal', completed: false, dueDate: '2025-02-10' }
    ],
    publications: [
      { id: generateId(), title: 'Exercise Adherence in Elderly OA Patients: Preliminary Findings', type: 'Abstract', link: 'https://example.com/pub4', date: '2024-09-20' }
    ],
    history: []
  }
];

export const initializeData = () => {
  const existingData = localStorage.getItem('rescue-data');
  if (!existingData) {
    localStorage.setItem('rescue-data', JSON.stringify({ studies: seedStudies }));
    return { studies: seedStudies };
  }
  return JSON.parse(existingData);
};
