import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
  Share,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const STORAGE_KEY = 'lifeos-v1';
const CATEGORIES = [
  'Alimentari',
  'Trasporti',
  'Università',
  'Svago',
  'Abbonamenti',
  'Salute',
  'Lavoro',
  'Altro',
];

const DEFAULT_BUDGETS = {
  Alimentari: 200,
  Trasporti: 100,
  Università: 100,
  Svago: 100,
  Abbonamenti: 50,
  Salute: 50,
  Lavoro: 100,
  Altro: 100,
};
const INITIAL = {
  goals: [],
  projects: [],
  transactions: [],
  tasks: [],
  events: [],
  subjects: [],
  budgets: DEFAULT_BUDGETS,
  savingsGoal: 1000,
  habits: [
    { id: 'habit-study', name: 'Studiare', done: false },
    { id: 'habit-training', name: 'Allenamento', done: false },
    { id: 'habit-water', name: 'Bere acqua', done: false },
  ],
};

const euro = (n) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(n);

export default function App() {
  const getGoalProgress = (goal) => {
  const target = Number(goal.target) || 0;
  const saved = Number(goal.saved) || 0;

  if (target <= 0) return 0;

  return Math.min(100, Math.round((saved / target) * 100));
};
const getWeeklyOverview = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setDate(end.getDate() + 7);

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const endKey = [
    end.getFullYear(),
    String(end.getMonth() + 1).padStart(2, '0'),
    String(end.getDate()).padStart(2, '0'),
  ].join('-');

  const events = (data.events || []).filter(
    (event) => !event.done && event.date
  );

  return {
    overdue: events.filter((event) => event.date < todayKey),
    upcoming: events
      .filter(
        (event) =>
          event.date >= todayKey && event.date < endKey
      )
      .sort((a, b) => a.date.localeCompare(b.date)),
    highPriority: events.filter(
      (event) => event.priority === 'Alta'
    ),
  };
};
  const [showNotifications, setShowNotifications] = useState(false);
  const [eventFilter, setEventFilter] = useState('Tutti');
  const [data, setData] = useState(INITIAL);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('Home');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState('expense');
  const [category, setCategory] = useState('Altro');
const [goalInput, setGoalInput] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskPriority, setTaskPriority] = useState('Media');
  const [subjectName, setSubjectName] = useState('');
const [subjectCfu, setSubjectCfu] = useState('');
const [subjectExamDate, setSubjectExamDate] = useState('');
const [studyMinutes, setStudyMinutes] = useState('');
const [projectName, setProjectName] = useState('');
const [projectDescription, setProjectDescription] = useState('');
const [projectAction, setProjectAction] = useState('');
const [projectDate, setProjectDate] = useState('');
const [projectPriority, setProjectPriority] = useState('Media');
const [eventTitle, setEventTitle] = useState('');
const [eventDate, setEventDate] = useState('');
const [eventTime, setEventTime] = useState('');
const [eventPriority, setEventPriority] = useState('Media');
const [eventDescription, setEventDescription] = useState('');

const [budgetInputs, setBudgetInputs] = useState({});
const [goalName, setGoalName] = useState('');
const [goalTarget, setGoalTarget] = useState('');
const [goalSaved, setGoalSaved] = useState('');
  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active && raw) {
          const parsed = JSON.parse(raw);
          setData({ ...INITIAL, ...parsed });
        }
      })
      .catch((err) => console.warn('Errore caricamento', err))
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      .catch((err) => console.warn('Errore salvataggio', err));
  }, [data, ready]);


const exportBackup = async () => {
  try {
    const backup = JSON.stringify(
      {
        app: 'LifeOS',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: data,
      },
      null,
      2
    );

    if (Platform.OS === 'web') {
      const blob = new Blob([backup], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `lifeos-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      window.alert('Backup esportato. Controlla Download o File.');
    } else {
      await Share.share({
        title: 'Backup LifeOS',
        message: backup,
      });
    }
  } catch (error) {
    console.warn('Errore backup:', error);

    if (Platform.OS === 'web') {
      window.alert('Errore durante l’esportazione del backup.');
    }
  }
};


  const importBackup = () => {
        // Evita di usare API del browser su iOS e Android.
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Importa backup',
        'Per importare un file JSON, apri LifeOS nella versione web.'
      );
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const backup = JSON.parse(reader.result);

          if (
            backup.app !== 'LifeOS' ||
            !backup.data ||
            typeof backup.data !== 'object' ||
            Array.isArray(backup.data) ||
                       !Array.isArray(backup.data.goals) ||
            !Array.isArray(backup.data.transactions) ||
            !Array.isArray(backup.data.tasks) ||
            (backup.data.events !== undefined &&
              !Array.isArray(backup.data.events)) ||
            (backup.data.habits !== undefined &&
              !Array.isArray(backup.data.habits)) ||
            (backup.data.projects !== undefined &&
              !Array.isArray(backup.data.projects)) ||
            (backup.data.subjects !== undefined &&
              !Array.isArray(backup.data.subjects)) ||
            !backup.data.budgets ||
            typeof backup.data.budgets !== 'object' ||
            Array.isArray(backup.data.budgets)
          ) {
            throw new Error('Formato backup non valido');
          }

          const restoredData = {
  ...INITIAL,
  ...backup.data,
  subjects: Array.isArray(backup.data.subjects)
    ? backup.data.subjects
    : [],
  projects: Array.isArray(backup.data.projects)
    ? backup.data.projects
    : [],
};

          const confirmed = window.confirm(
            'Importare questo backup? I dati attuali di LifeOS saranno sostituiti.'
          );

          if (!confirmed) return;

          AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(restoredData)
          )
            .then(() => {
              setData(restoredData);
              window.alert('Backup importato correttamente.');
            })
            .catch(() => {
              window.alert('Errore durante il salvataggio del backup.');
            });
        } catch (error) {
          window.alert(
            'Backup non valido o danneggiato. Nessun dato è stato importato.'
          );
        }
      };

      reader.onerror = () => {
        window.alert('Impossibile leggere il file selezionato.');
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const income = data.transactions
    .filter((x) => x.kind === 'income')
    .reduce((sum, x) => sum + x.amount, 0);

  const expenses = data.transactions
    .filter((x) => x.kind === 'expense')
    .reduce((sum, x) => sum + x.amount, 0);

  const balance = income - expenses;
  const currentMonth = `${new Date().getFullYear()}-${String(
  new Date().getMonth() + 1
).padStart(2, '0')}`;

const monthlyTransactions = data.transactions.filter(
  (t) => t.month === currentMonth
);

const monthlyExpenses = monthlyTransactions
  .filter((t) => t.kind === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);

const monthlyIncome = monthlyTransactions
  .filter((t) => t.kind === 'income')
  .reduce((sum, t) => sum + t.amount, 0);
  const doneTasks = data.tasks.filter((x) => x.done).length;
  const doneHabits = data.habits.filter((x) => x.done).length;

const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - (5 - i));

  const key = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;

  const transactions = data.transactions.filter(
    (t) => t.month === key
  );

  return {
    key,
    label: date.toLocaleDateString('it-IT', {
      month: 'short',
    }),
    income: transactions
      .filter((t) => t.kind === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    expenses: transactions
      .filter((t) => t.kind === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  };
});

const categoryAnalysis = CATEGORIES.map((name) => ({
  name,
  total: monthlyTransactions
    .filter(
      (t) => t.kind === 'expense' && t.category === name
    )
    .reduce((sum, t) => sum + t.amount, 0),
})).sort((a, b) => b.total - a.total);

const maxCategoryExpense = Math.max(
  1,
  ...categoryAnalysis.map((x) => x.total)
);

const maxMonthlyValue = Math.max(
  1,
  ...lastSixMonths.flatMap((m) => [m.income, m.expenses])
);

  
function addTransaction() {
  const value = Number(amount.trim().replace(',', '.'));

  if (
    !description.trim() ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return;
  }

  setData((old) => ({
    ...old,
    transactions: [
      {
        id: String(Date.now()),
        description: description.trim(),
        amount: Math.round(value * 100) / 100,
        kind,
        category,
        month: `${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1
        ).padStart(2, '0')}`,
        date: new Date().toLocaleDateString('it-IT'),
      },
      ...old.transactions,
    ],
  }));

  setDescription('');
  setAmount('');
}


  function addTask() {
  if (!taskName.trim()) return;

  setData((old) => ({
    ...old,
    tasks: [
      {
        id: String(Date.now()),
        name: taskName.trim(),
        done: false,
        priority: taskPriority,
      },
      ...(old.tasks || []),
    ],
  }));

  setTaskName('');
  setTaskPriority('Media');
}




function addHabit() {
  if (!habitName.trim()) return;

  if (editingHabitId !== null) {
    setData((old) => ({
      ...old,
      habits: old.habits.map((h) =>
        h.id === editingHabitId
          ? { ...h, name: habitName.trim() }
          : h
      ),
    }));

    setEditingHabitId(null);
  } else {
    setData((old) => ({
      ...old,
      habits: [
        ...old.habits,
        {
          id: String(Date.now()),
          name: habitName.trim(),
          done: false,
        },
      ],
    }));
  }

  setHabitName('');
}



function addEvent() {
  if (!eventTitle.trim() || !eventDate) return;

  setData((old) => ({
    ...old,
    events: [
      ...(old.events || []),
      {
        id: String(Date.now()),
        title: eventTitle.trim(),
        date: eventDate,
        time: eventTime,
        priority: eventPriority,
        description: eventDescription.trim(),
        done: false,
      },
    ].sort((a, b) =>
      `${a.date} ${a.time || '23:59'}`.localeCompare(
        `${b.date} ${b.time || '23:59'}`
      )
    ),
  }));

  setEventTitle('');
  setEventDate('');
  setEventTime('');
  setEventPriority('Media');
  setEventDescription('');
}
function addSubject() {
  const cfu = Number(subjectCfu);

  if (!subjectName.trim() || !Number.isFinite(cfu) || cfu < 0) return;

  setData((old) => ({
    ...old,
    subjects: [
      ...(old.subjects || []),
      {
        id: String(Date.now()),
        name: subjectName.trim(),
        cfu,
        examDate: subjectExamDate,
        minutes: 0,
      },
    ],
  }));

  setSubjectName('');
  setSubjectCfu('');
  setSubjectExamDate('');
}

function deleteSubject(id) {
  setData((old) => ({
    ...old,
    subjects: (old.subjects || []).filter((s) => s.id !== id),
  }));
}

function addStudySession(id) {
  const rawMinutes = Number(studyMinutes);
  if (!Number.isFinite(rawMinutes) || rawMinutes <= 0) return;

  const minutes = Math.round(rawMinutes);

  setData((old) => ({
    ...old,
    subjects: (old.subjects || []).map((s) =>
      s.id === id
        ? { ...s, minutes: (s.minutes || 0) + minutes }
        : s
    ),
  }));

  setStudyMinutes('');
}

function toggleEvent(id) {
  setData((old) => ({
    ...old,
    events: (old.events || []).map((event) =>
      event.id === id ? { ...event, done: !event.done } : event
    ),
  }));
}

function deleteEvent(id) {
  setData((old) => ({
    ...old,
    events: (old.events || []).filter((event) => event.id !== id),
  }));
}

function addGoal() {
  const target = Number(goalTarget.trim().replace(',', '.'));
  const saved = Number(goalSaved.trim().replace(',', '.'));

  if (
    !goalName.trim() ||
    !Number.isFinite(target) ||
    target <= 0 ||
    !Number.isFinite(saved) ||
    saved < 0
  ) {
    return;
  }

  setData((old) => ({
    ...old,
    goals: [
      ...(old.goals || []),
      {
        id: String(Date.now()),
        name: goalName.trim(),
        target,
        saved,
      },
    ],
  }));

  setGoalName('');
  setGoalTarget('');
  setGoalSaved('');
}

function updateGoalProgress(id, value) {
  const amount = Number(String(value).replace(',', '.'));

  if (!Number.isFinite(amount) || amount < 0) return;

  setData((old) => ({
    ...old,
    goals: old.goals.map((goal) =>
      goal.id === id ? { ...goal, saved: amount } : goal
    ),
  }));
}

function addProject() {
  if (!projectName.trim()) return;

  setData((old) => ({
    ...old,
    projects: [
      {
        id: String(Date.now()),
        name: projectName.trim(),
        description: projectDescription.trim(),
        nextAction: projectAction.trim(),
        targetDate: projectDate,
        priority: projectPriority,
        status: 'Da iniziare',
        createdAt: new Date().toISOString(),
      },
      ...(old.projects || []),
    ],
  }));

  setProjectName('');
  setProjectDescription('');
  setProjectAction('');
  setProjectDate('');
  setProjectPriority('Media');
}

function updateProjectStatus(id, status) {
  setData((old) => ({
    ...old,
    projects: (old.projects || []).map((project) =>
      project.id === id ? { ...project, status } : project
    ),
  }));
}

function deleteProject(id) {
  setData((old) => ({
    ...old,
    projects: (old.projects || []).filter((project) => project.id !== id),
  }));
}

  function toggleTask(id) {
    setData((old) => ({
      ...old,
      tasks: old.tasks.map((x) =>
        x.id === id ? { ...x, done: !x.done } : x
      ),
    }));
  }

  function toggleHabit(id) {
    setData((old) => ({
      ...old,
      habits: old.habits.map((x) =>
        x.id === id ? { ...x, done: !x.done } : x
      ),
    }));
  }

const notifications = [
  ...(data.events || [])
    .filter((event) => !event.done)
    .map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      detail: `Scadenza: ${event.date}${event.time ? ` · ${event.time}` : ''}`,
      date: event.date,
      priority: event.priority || 'Media',
      type: 'Evento',
    })),
  ...(data.projects || [])
    .filter((project) => project.status !== 'Completato')
    .filter((project) => project.targetDate)
    .map((project) => ({
      id: `project-${project.id}`,
      title: project.name,
      detail: `Progetto: ${project.status}`,
      date: project.targetDate,
      priority: project.priority || 'Media',
      type: 'Progetto',
    })),
].sort((a, b) => a.date.localeCompare(b.date));
const lifeosToday = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})();

const lifeosTasks = data.tasks || [];
const lifeosEvents = data.events || [];
const lifeosProjects = data.projects || [];

const lifeosOpenTasks = lifeosTasks.filter((task) => !task.done);
const lifeosCompletedTasks = lifeosTasks.filter((task) => task.done);

const lifeosTodayEvents = lifeosEvents.filter(
  (event) => !event.done && event.date === lifeosToday
);

const lifeosOverdueEvents = lifeosEvents.filter(
  (event) => !event.done && event.date && event.date < lifeosToday
);

const lifeosActiveProjects = lifeosProjects.filter(
  (project) => project.status !== 'Completato'
);

const lifeosUrgentEvents = lifeosEvents
  .filter((event) => !event.done && event.date)
  .filter(
    (event) =>
      event.date <= lifeosToday || event.priority === 'Alta'
  )
  .sort((a, b) => a.date.localeCompare(b.date));

const lifeosNextAction = lifeosOverdueEvents.length > 0
  ? {
      title: 'Recupera una scadenza',
      detail: lifeosOverdueEvents[0].title,
      section: 'Calendario',
    }
  : lifeosTodayEvents.length > 0
  ? {
      title: 'Gestisci gli impegni di oggi',
      detail: lifeosTodayEvents[0].title,
      section: 'Calendario',
    }
  : lifeosOpenTasks.length > 0
  ? {
      title: 'Completa un’attività',
      detail:
        lifeosOpenTasks[0].title ||
        lifeosOpenTasks[0].name ||
        'Attività da completare',
      section: 'Attività',
    }
  : lifeosActiveProjects.length > 0
  ? {
      title: 'Fai avanzare un progetto',
      detail: lifeosActiveProjects[0].name,
      section: 'Progetti',
    }
  : {
      title: 'Pianifica la giornata',
      detail: 'Aggiungi un nuovo obiettivo o impegno.',
      section: 'Obiettivi',
    };

const lifeosCompletion = lifeosTasks.length
  ? Math.round(
      (lifeosCompletedTasks.length / lifeosTasks.length) * 100
    )
  : 0;
  const field = (placeholder, value, onChangeText, extra = {}) => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#858CA1"
      value={value}
      onChangeText={onChangeText}
      {...extra}
    />
  );

  const button = (label, onPress, secondary = false) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );

  const heading = (label) => (
    <Text style={styles.heading}>{label}</Text>
  );

  const card = (children, extraStyle = {}) => (
    <View style={[styles.card, extraStyle]}>{children}</View>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.muted}>Caricamento LifeOS...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#10131D"
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            LIFE<Text style={styles.purple}>OS</Text>
          </Text>
          <Text style={styles.eyebrow}>
            IL TUO CENTRO DI CONTROLLO
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.purple}>L</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'Home' && (
          <>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>
                IL TUO SPAZIO PERSONALE
              </Text>
              <Text style={styles.heroTitle}>
                Prendi il controllo.
              </Text>
              <Text style={styles.heroSub}>
                Un passo alla volta, ogni giorno.
              </Text>
              <Text style={styles.balanceLabel}>
                Saldo registrato
              </Text>
              <Text style={styles.balance}>
                {euro(balance)}
              </Text>
              <Text style={styles.heroSub}>
                Calcolato sulle operazioni inserite
              </Text>
            </View>

<View style={styles.card}>
  <Text style={styles.heading}>Backup dei dati</Text>
  <Text style={styles.muted}>
    Esporta una copia dei tuoi dati LifeOS.
  </Text>
  <Pressable
    style={styles.button}
    onPress={exportBackup}
  >

<Pressable
  style={styles.button}
  onPress={importBackup}
>
  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
    Importa backup
  </Text>
</Pressable>

    <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
      Esporta backup
    </Text>
  </Pressable>
</View>

            <View style={styles.row}>
              {card(
                <>
                  <Text style={styles.muted}>ENTRATE</Text>
                  <Text style={styles.green}>{euro(income)}</Text>
                </>,
                styles.half
              )}
              {card(
                <>
                  <Text style={styles.muted}>USCITE</Text>
                  <Text style={styles.red}>{euro(expenses)}</Text>
                </>,
                styles.half
              )}
            </View>
<View style={styles.card}>
  {heading('La settimana in arrivo')}

  <Text style={styles.itemText}>
    {getWeeklyOverview().upcoming.length} impegni nei prossimi 7 giorni
  </Text>

  <Text style={styles.muted}>
    {getWeeklyOverview().overdue.length} scadenze arretrate
  </Text>

  <Text style={styles.muted}>
    {getWeeklyOverview().highPriority.length} impegni con priorità alta
  </Text>

  {getWeeklyOverview().overdue.length > 0 && (
    <Text style={styles.red}>
      Da recuperare: {getWeeklyOverview().overdue[0].title}
    </Text>
  )}

  {getWeeklyOverview().upcoming.slice(0, 3).map((event) => (
    <View key={event.id} style={{ marginTop: 10 }}>
      <Text style={styles.itemText}>{event.title}</Text>
      <Text style={styles.muted}>
        {event.date}
        {event.time ? ` · ${event.time}` : ''}
      </Text>
    </View>
  ))}

  {button('Apri calendario', () => setTab('Calendario'), true)}
</View>
            {heading('La tua giornata')}

            <View style={styles.row}>
              {card(
                <>
                  <Text style={styles.big}>
                    {doneTasks}/{data.tasks.length}
                  </Text>
                  <Text style={styles.muted}>
                    Attività completate
                  </Text>
                </>,
                styles.half
              )}

              {card(
                <>
                  <Text style={styles.big}>
                    {doneHabits}/{data.habits.length}
                  </Text>
                  <Text style={styles.muted}>
                    Abitudini completate
                  </Text>
                </>,
                styles.half
              )}
            </View>

{button(
  `Promemoria (${notifications.length})`,
  () => setShowNotifications((value) => !value),
  true
)}

{showNotifications && (
  <View style={styles.card}>
    {heading('Promemoria e scadenze')}
    {notifications.length === 0 ? (
      <Text style={styles.muted}>Non ci sono promemoria aperti.</Text>
    ) : (
      notifications.map((item) => (
        <View key={item.id} style={{ marginBottom: 12 }}>
          <Text style={styles.itemText}>{item.title}</Text>
          <Text style={styles.muted}>{item.detail}</Text>
          <Text style={item.priority === 'Alta' ? styles.red : styles.muted}>
            {item.type} · Priorità {item.priority}
          </Text>
        </View>
      ))
    )}
  </View>
)}
<View style={styles.card}>
  {heading('La tua giornata')}

  <View style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.muted}>Attività aperte</Text>
      <Text style={styles.title}>{lifeosOpenTasks.length}</Text>
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.muted}>Scadenze oggi</Text>
      <Text style={styles.title}>{lifeosTodayEvents.length}</Text>
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.muted}>Progetti attivi</Text>
      <Text style={styles.title}>{lifeosActiveProjects.length}</Text>
    </View>
  </View>

  <View style={{ marginTop: 18 }}>
    <View style={styles.row}>
      <Text style={styles.itemText}>Completamento attività</Text>
      <Text style={styles.itemText}>{lifeosCompletion}%</Text>
    </View>

    <View
      style={{
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: `${lifeosCompletion}%`,
          height: 8,
          backgroundColor: '#16A34A',
          borderRadius: 8,
        }}
      />
    </View>
  </View>

  {lifeosOverdueEvents.length > 0 && (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.red}>
        Attenzione: {lifeosOverdueEvents.length} scadenze superate
      </Text>
    </View>
  )}
</View>

<View style={styles.card}>
  {heading('Priorità suggerita')}

  <Text style={styles.itemText}>{lifeosNextAction.title}</Text>
  <Text style={styles.muted}>{lifeosNextAction.detail}</Text>

  {button(
    `Apri ${lifeosNextAction.section}`,
    () => setTab(lifeosNextAction.section)
  )}
</View>

<View style={styles.card}>
  {heading('Scadenze urgenti')}

  {lifeosUrgentEvents.length === 0 ? (
    <Text style={styles.muted}>
      Nessuna scadenza urgente individuata.
    </Text>
  ) : (
    lifeosUrgentEvents.slice(0, 3).map((event) => (
      <View key={event.id} style={{ marginBottom: 12 }}>
        <Text style={styles.itemText}>{event.title}</Text>
        <Text style={styles.muted}>
          {event.date} · {event.priority || 'Media'}
        </Text>
      </View>
    ))
  )}
</View>
<View style={styles.card}>
  {heading('Le tue attività')}

  <View style={styles.row}>
    <Text style={styles.muted}>Da completare</Text>
    <Text style={styles.itemText}>
      {(data.tasks || []).filter((task) => !task.done).length}
    </Text>
  </View>

  <View style={styles.row}>
    <Text style={styles.muted}>Completate</Text>
    <Text style={styles.green}>
      {(data.tasks || []).filter((task) => task.done).length}
    </Text>
  </View>

  <View style={{ marginTop: 12 }}>
    <Text style={styles.muted}>
      Avanzamento complessivo
    </Text>

    <View
      style={{
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 6,
      }}
    >
      <View
        style={{
          height: 8,
          width: `${
            (data.tasks || []).length
              ? Math.round(
                  ((data.tasks || []).filter((task) => task.done).length /
                    (data.tasks || []).length) *
                    100
                )
              : 0
          }%`,
          backgroundColor: '#16A34A',
          borderRadius: 8,
        }}
      />
    </View>
  </View>

  {button('Apri le attività', () => setTab('Attività'), true)}
</View>
{heading('Il tuo prossimo passo')}

{card(<>
  <Text style={styles.itemText}>Attività da completare</Text>
  <Text style={styles.big}>
    {data.tasks.filter((task) => !task.done).length}
  </Text>
  <Text style={styles.muted}>
    Attività ancora aperte
  </Text>
</>)}

{card(<>
  <Text style={styles.itemText}>Progetti in corso</Text>
  <Text style={styles.big}>
    {(data.projects || []).filter(
      (project) => project.status === 'In corso'
    ).length}
  </Text>
  <Text style={styles.muted}>
    Progetti che richiedono attenzione
  </Text>
</>)}

{card(<>
  <Text style={styles.itemText}>Prossime scadenze</Text>
  {(data.events || [])
    .filter((event) => !event.done)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
    .map((event) => (
      <View key={event.id} style={{ marginTop: 8 }}>
        <Text style={styles.itemText}>{event.title}</Text>
        <Text style={styles.muted}>
          {event.date}{event.time ? ` · ${event.time}` : ''}
        </Text>
      </View>
    ))}
  {(data.events || []).filter((event) => !event.done).length === 0 && (
    <Text style={styles.muted}>Nessuna scadenza aperta.</Text>
  )}
</>)}

{card(<>
  <Text style={styles.itemText}>Studio universitario</Text>
  <Text style={styles.big}>
    {Math.round(
      (data.subjects || []).reduce(
        (total, subject) => total + (subject.minutes || 0),
        0
      ) / 60 * 10
    ) / 10} h
  </Text>
  <Text style={styles.muted}>Ore registrate complessivamente</Text>
</>)}

            {heading('Accesso rapido')}

            {[
              ['€', 'Gestisci i soldi', 'Soldi'],
              ['✓', 'Organizza le attività', 'Attività'],
              ['◉', 'Monitora le abitudini', 'Abitudini'],
              ['▦', 'Gestisci le scadenze', 'Calendario'],
['📚', 'Vai allo studio', 'Studio'],
['🚀', 'Gestisci i progetti', 'Progetti'],
            ].map(([icon, label, dest]) => (
              <Pressable
                key={dest}
                style={styles.quick}
                onPress={() => setTab(dest)}
              >
                <Text style={styles.quickIcon}>{icon}</Text>
                <Text style={styles.itemText}>{label}</Text>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </>
        )}

{tab === 'Calendario' && <>
  {heading('Calendario e scadenze')}
  <Text style={styles.muted}>
    Organizza eventi, esami e appuntamenti.
  </Text>

  {card(<>
    {heading('Nuovo evento')}
    {field('Titolo evento', eventTitle, setEventTitle)}
    {field('Descrizione (facoltativa)', eventDescription, setEventDescription)}
    {field('Data (AAAA-MM-GG)', eventDate, setEventDate, {
      placeholder: 'AAAA-MM-GG',
    })}
    {field('Ora (facoltativa, HH:MM)', eventTime, setEventTime, {
      placeholder: 'HH:MM',
    })}
    
<View style={styles.row}>
  {['Bassa', 'Media', 'Alta'].map((priority) => (
    <Pressable
      key={priority}
      onPress={() => setEventPriority(priority)}
      style={[
        styles.button,
        eventPriority !== priority && styles.buttonSecondary,
        { flex: 1 },
      ]}
    >
      <Text style={styles.buttonText}>
        {priority === eventPriority ? `✓ ${priority}` : priority}
      </Text>
    </Pressable>
  ))}
</View>

    {button('Aggiungi evento', addEvent)}
  </>)}

{heading('Scadenze e priorità')}

{(() => {
  const today = new Date().toISOString().slice(0, 10);
  const pending = (data.events || [])
    .filter((event) => !event.done)
    .sort((a, b) =>
      `${a.date} ${a.time || '23:59'}`.localeCompare(
        `${b.date} ${b.time || '23:59'}`
      )
    );

  const overdue = pending.filter((event) => event.date < today);
  const todayEvents = pending.filter((event) => event.date === today);
  const upcoming = pending.filter((event) => event.date > today);

  return (
    <>
      {card(<>
        <Text style={styles.itemText}>Scaduti: {overdue.length}</Text>
        <Text style={styles.itemText}>Oggi: {todayEvents.length}</Text>
        <Text style={styles.itemText}>Prossimi: {upcoming.length}</Text>
      </>)}

      {[...overdue, ...todayEvents, ...upcoming]
        .filter((event) => event.priority === 'Alta')
        .slice(0, 3)
        .map((event) => (
          <View key={event.id} style={styles.card}>
            <Text style={styles.red}>PRIORITÀ ALTA</Text>
            <Text style={styles.itemText}>{event.title}</Text>
            <Text style={styles.muted}>{event.date} {event.time}</Text>
          </View>
        ))}
    </>
  );
})()}

  {heading('I tuoi eventi')}
  
{(() => {
  const today = new Date().toLocaleDateString('en-CA');
  const events = (data.events || [])
    .map((event) => ({
      ...event,
      status: event.done
        ? 'Completato'
        : event.date < today
          ? 'Scaduto'
          : event.date === today
            ? 'Oggi'
            : 'Prossimo',
    }))
    .filter((event) => {
      if (eventFilter === 'Tutti') return true;
      if (eventFilter === 'Scaduti') return event.status === 'Scaduto';
      if (eventFilter === 'Oggi') return event.status === 'Oggi';
      if (eventFilter === 'Prossimi') return event.status === 'Prossimo';
      return true;
    })
    .sort((a, b) =>
      `${a.date} ${a.time || '23:59'}`.localeCompare(
        `${b.date} ${b.time || '23:59'}`
      )
    );

  return (
    <>
      <View style={styles.row}>
        {['Tutti', 'Oggi', 'Prossimi', 'Scaduti'].map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setEventFilter(filter)}
            style={[
              styles.button,
              eventFilter !== filter && styles.buttonSecondary,
              { flex: 1 },
            ]}
          >
            <Text style={styles.buttonText}>{filter}</Text>
          </Pressable>
        ))}
      </View>

      {events.length === 0
        ? card(
            <Text style={styles.muted}>
              Nessun evento in questa categoria.
            </Text>
          )
        : events.map((event) => (
            <View key={event.id} style={styles.card}>
              <Text style={styles.itemText}>{event.title}</Text>
              <Text style={styles.muted}>
                {event.date}{event.time ? ` · ${event.time}` : ''}
              </Text>
              <Text style={styles.muted}>
                Priorità: {event.priority || 'Media'}
              </Text>
              <Text
                style={
                  event.status === 'Scaduto'
                    ? styles.red
                    : event.status === 'Completato'
                      ? styles.green
                      : styles.muted
                }
              >
                {event.status}
              </Text>
              {!!event.description && (
                <Text style={styles.muted}>{event.description}</Text>
              )}
              <View style={styles.row}>
                {button(
                  event.done ? 'Riapri' : 'Completa',
                  () => toggleEvent(event.id),
                  true
                )}
                {button('Elimina', () => deleteEvent(event.id), true)}
              </View>
            </View>
       
        ))}
    </>
  );
})()}
</>}

{tab === 'Studio' && <>
  {heading('Studio universitario')}
  <Text style={styles.muted}>
    Gestisci materie, esami e tempo dedicato alla preparazione.
  </Text>

  {card(<>
    {heading('Aggiungi materia')}
    {field('Nome materia', subjectName, setSubjectName)}
    {field('CFU', subjectCfu, setSubjectCfu, {
      keyboardType: 'numeric',
    })}
    {field('Data esame (AAAA-MM-GG)', subjectExamDate, setSubjectExamDate)}
    {button('Aggiungi materia', addSubject)}
  </>)}

  {heading('Riepilogo')}
  {card(<>
    <Text style={styles.itemText}>
      Materie: {(data.subjects || []).length}
    </Text>
    <Text style={styles.itemText}>
      Ore di studio registrate:{' '}
      {Math.round(
        (data.subjects || []).reduce(
          (total, subject) => total + (subject.minutes || 0),
          0
        ) / 60 * 10
      ) / 10}
    </Text>
    <Text style={styles.itemText}>
      CFU totali: {(data.subjects || []).reduce(
        (total, subject) => total + (Number(subject.cfu) || 0),
        0
      )}
    </Text>
  </>)}

  {heading('Le tue materie')}

  {(data.subjects || []).length === 0
    ? card(
        <Text style={styles.muted}>
          Nessuna materia inserita. Aggiungi la prima qui sopra.
        </Text>
      )
    : (data.subjects || []).map((subject) => (
        <View key={subject.id} style={styles.card}>
          <Text style={styles.itemText}>{subject.name}</Text>
          <Text style={styles.muted}>
            {subject.cfu} CFU
          </Text>
          <Text style={styles.muted}>
            {subject.examDate
              ? `Esame: ${subject.examDate}`
              : 'Data esame non impostata'}
          </Text>
          <Text style={styles.green}>
            Tempo studiato: {Math.floor((subject.minutes || 0) / 60)} h{' '}
            {(subject.minutes || 0) % 60} min
          </Text>

          {field(
            'Minuti della sessione',
            studyMinutes,
            setStudyMinutes,
            { keyboardType: 'numeric' }
          )}
          {button(
            'Registra sessione',
            () => addStudySession(subject.id),
            true
          )}
          {button(
            'Elimina materia',
            () => deleteSubject(subject.id),
            true
          )}
        </View>
      ))
  }
</>}



        {tab === 'Soldi' && (
          <>
            {heading('Le tue finanze')}

            {card(
              <>
                <Text style={styles.muted}>
                  Saldo netto registrato
                </Text>
                <Text style={styles.big}>{euro(balance)}</Text>
                <View style={styles.separator} />
                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.muted}>Entrate</Text>
                    <Text style={styles.green}>{euro(income)}</Text>
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.muted}>Spese</Text>
                    <Text style={styles.red}>{euro(expenses)}</Text>
                  </View>
                </View>
              </>
            )}

            {card(
              <>
                <Text style={styles.cardTitle}>
                  Nuova operazione
                </Text>

                <View style={styles.row}>
                  {button(
                    '− Spesa',
                    () => setKind('expense'),
                    kind !== 'expense'
                  )}
                  {button(
                    '+ Entrata',
                    () => setKind('income'),
                    kind !== 'income'
                  )}
                </View>
<Text style={styles.muted}>Categoria</Text>

<View style={styles.categoryList}>
  {CATEGORIES.map((item) => (
    <Pressable
      key={item}
      onPress={() => setCategory(item)}
      style={[
        styles.categoryButton,
        category === item && styles.categorySelected,
      ]}
    >
      <Text style={styles.categoryText}>{item}</Text>
    </Pressable>
  ))}
</View>
                {field(
                  'Descrizione (es. stipendio)',
                  description,
                  setDescription
                )}

                {field(
                  'Importo in euro',
                  amount,
                  setAmount,
                  { keyboardType: 'decimal-pad' }
                )}

                {button('Salva operazione', addTransaction)}
              </>
            )}

{heading('Riepilogo del mese')}

{card(
  <>
    <Text style={styles.muted}>
      {new Date().toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric',
      })}
    </Text>

    <Text style={styles.muted}>Entrate del mese</Text>
    <Text style={styles.green}>{euro(monthlyIncome)}</Text>

    <Text style={styles.muted}>Spese del mese</Text>
    <Text style={styles.red}>{euro(monthlyExpenses)}</Text>

    <View style={styles.separator} />

    <Text style={styles.muted}>Differenza mensile</Text>
    <Text
      style={monthlyIncome - monthlyExpenses >= 0
        ? styles.green
        : styles.red}
    >
      {euro(monthlyIncome - monthlyExpenses)}
    </Text>
  </>
)}

{heading('Budget per categoria')}

{CATEGORIES.map((item) => {
  const spent = monthlyTransactions
    .filter(
      (t) => t.kind === 'expense' && t.category === item
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const budget =
    data.budgets?.[item] ?? DEFAULT_BUDGETS[item] ?? 0;

  const remaining = budget - spent;
  const progress =
    budget > 0 ? Math.min(spent / budget, 1) * 100 : 0;

  return (
    <View key={item} style={styles.card}>
      <Text style={styles.cardTitle}>{item}</Text>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.muted}>Speso</Text>
          <Text style={styles.itemText}>{euro(spent)}</Text>
        </View>

        <View style={styles.half}>
          <Text style={styles.muted}>Budget</Text>
          <Text style={styles.itemText}>{euro(budget)}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor:
                remaining < 0 ? '#FF8E9B' : '#9A8CFF',
            },
          ]}
        />
      </View>

      <Text style={remaining < 0 ? styles.red : styles.green}>
        {remaining < 0
          ? `Superato di ${euro(Math.abs(remaining))}`
          : `Disponibili ${euro(remaining)}`}
      </Text>

      <Text style={styles.muted}>Imposta budget mensile (€)</Text>

      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={
          budgetInputs[item] !== undefined
            ? budgetInputs[item]
            : String(budget)
        }
        onChangeText={(value) =>
          setBudgetInputs((old) => ({
            ...old,
            [item]: value,
          }))
        }
        placeholder="Importo del budget"
        placeholderTextColor="#858CA1"
      />

      <Pressable
        style={styles.button}
        onPress={() => {
          const value = Number(
            String(
              budgetInputs[item] !== undefined
                ? budgetInputs[item]
                : budget
            ).replace(',', '.')
          );

          if (!Number.isFinite(value) || value < 0) return;

          setData((old) => ({
            ...old,
            budgets: {
              ...DEFAULT_BUDGETS,
              ...(old.budgets || {}),
              [item]: value,
            },
          }));

          setBudgetInputs((old) => {
            const next = { ...old };
            delete next[item];
            return next;
          });
        }}
      >
        <Text style={styles.buttonText}>Salva budget</Text>
      </Pressable>
    </View>
  );
})}

            {heading('Movimenti recenti')}

            {data.transactions.length === 0
              ? card(
                  <Text style={styles.muted}>
                    Ancora nessun movimento. Inserisci la prima operazione.
                  </Text>
                )
              : data.transactions.map((x) => (
                  <View key={x.id} style={styles.listItem}>
                    <View style={styles.flex}>
                      <Text style={styles.itemText}>
                        {x.description}
                      </Text>
                      <Text style={styles.muted}>{x.date}</Text>
                    </View>

                    <Text
                      style={
                        x.kind === 'income'
                          ? styles.green
                          : styles.red
                      }
                    >
                      {x.kind === 'income' ? '+' : '−'}
                      {euro(x.amount)}
                    </Text>

                    <Pressable
                      onPress={() =>
                        setData((old) => ({
                          ...old,
                          transactions: old.transactions.filter(
                            (t) => t.id !== x.id
                          ),
                        }))
                      }
                    >
                      <Text style={styles.delete}>×</Text>
                    </Pressable>
                  </View>
                ))}
          </>
        )}

{tab === 'Analisi' && (
  <>
    {heading('Analisi finanziaria')}

    <Text style={styles.muted}>
      Dati registrati nel mese corrente
    </Text>

    {card(
      <>
        <Text style={styles.cardTitle}>
          1. Spese per categoria
        </Text>

        {categoryAnalysis.map((item) => (
          <View key={item.name} style={{ marginTop: 12 }}>
            <View style={styles.row}>
              <Text style={[styles.itemText, styles.flex]}>
                {item.name}
              </Text>
              <Text style={styles.muted}>
                {euro(item.total)}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (item.total / maxCategoryExpense) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </>
    )}

    {card(
      <>
        <Text style={styles.cardTitle}>
          2. Entrate e uscite del mese
        </Text>

        <View style={styles.row}>
          <Text style={[styles.muted, styles.flex]}>
            Entrate
          </Text>
          <Text style={styles.green}>
            {euro(monthlyIncome)}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (monthlyIncome / maxMonthlyValue) * 100
                }%`,
                backgroundColor: '#62D6A4',
              },
            ]}
          />
        </View>

        <View style={[styles.row, { marginTop: 12 }]}>
          <Text style={[styles.muted, styles.flex]}>
            Uscite
          </Text>
          <Text style={styles.red}>
            {euro(monthlyExpenses)}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (monthlyExpenses / maxMonthlyValue) * 100
                }%`,
                backgroundColor: '#FF8E9B',
              },
            ]}
          />
        </View>

        <Text style={[styles.muted, { marginTop: 10 }]}>
          Le barre condividono la stessa scala.
        </Text>
      </>
    )}

    {card(
      <>
        <Text style={styles.cardTitle}>
          3. Andamento degli ultimi sei mesi
        </Text>

        {lastSixMonths.map((month) => (
          <View key={month.key} style={{ marginTop: 15 }}>
            <Text style={styles.itemText}>
              {month.label}
            </Text>

            <View style={[styles.row, { marginTop: 7 }]}>
              <Text style={styles.green}>E</Text>
              <View style={styles.flex}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (month.income / maxMonthlyValue) * 100
                        }%`,
                        backgroundColor: '#62D6A4',
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.muted}>
                {euro(month.income)}
              </Text>
            </View>

            <View style={[styles.row, { marginTop: 5 }]}>
              <Text style={styles.red}>U</Text>
              <View style={styles.flex}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (month.expenses / maxMonthlyValue) * 100
                        }%`,
                        backgroundColor: '#FF8E9B',
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.muted}>
                {euro(month.expenses)}
              </Text>
            </View>
          </View>
        ))}
      </>
    )}
  </>
)}

{tab === 'Obiettivi' && (
  <>
    {heading('I tuoi obiettivi')}

    {card(
      <>
        <Text style={styles.cardTitle}>
          Crea un obiettivo di risparmio
        </Text>

        {field('Nome (es. Nuovo iPhone)', goalName, setGoalName)}

        {field(
          'Importo da raggiungere (€)',
          goalTarget,
          setGoalTarget,
          { keyboardType: 'decimal-pad' }
        )}

        {field(
          'Quanto hai già risparmiato (€)',
          goalSaved,
          setGoalSaved,
          { keyboardType: 'decimal-pad' }
        )}

        {button('Crea obiettivo', addGoal)}
      </>
    )}

    {(data.goals || []).length === 0
      ? card(
          <Text style={styles.muted}>
            Non hai ancora creato obiettivi.
          </Text>
        )
      : data.goals.map((goal) => {
          const target = Number(goal.target) || 0;
const saved = Number(goal.saved) || 0;

const progress =
  target > 0
    ? Math.min(100, Math.max(0, (saved / target) * 100))
    : 0;

          return (
            <View key={goal.id} style={styles.card}>
              <Text style={styles.cardTitle}>{goal.name}</Text>

              <Text style={styles.muted}>
                {euro(goal.saved)} su {euro(goal.target)}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.muted}>
  {saved >= target
    ? '🎉 Obiettivo raggiunto!'
    : `Ti mancano ${euro(Math.max(0, target - saved))}`}
</Text>

              {field(
                'Aggiorna il risparmio totale (€)',
                String(goal.saved),
                (value) => updateGoalProgress(goal.id, value),
                { keyboardType: 'decimal-pad' }
              )}
            </View>
          );
        })}
  </>
)}

{tab === 'Progetti' && <>
  {heading('Progetti e idee')}
  <Text style={styles.muted}>
    Trasforma le idee in azioni concrete.
  </Text>

  {card(<>
    {heading('Nuovo progetto')}
    {field('Nome del progetto', projectName, setProjectName)}
    {field('Descrizione', projectDescription, setProjectDescription)}
    {field('Prossima azione', projectAction, setProjectAction)}
    {field('Data obiettivo (AAAA-MM-GG)', projectDate, setProjectDate)}

    <Text style={styles.muted}>Priorità</Text>
    <View style={styles.row}>
      {['Bassa', 'Media', 'Alta'].map((priority) => (
        <Pressable
          key={priority}
          onPress={() => setProjectPriority(priority)}
          style={[
            styles.button,
            projectPriority !== priority && styles.buttonSecondary,
            { flex: 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            {projectPriority === priority ? `✓ ${priority}` : priority}
          </Text>
        </Pressable>
      ))}
    </View>

    {button('Crea progetto', addProject)}
  </>)}

  {heading('I tuoi progetti')}

  {(data.projects || []).length === 0
    ? card(
        <Text style={styles.muted}>
          Nessun progetto ancora. Inserisci la tua prima idea.
        </Text>
      )
    : (data.projects || []).map((project) => (
        <View key={project.id} style={styles.card}>
          <Text style={styles.itemText}>{project.name}</Text>

          {!!project.description && (
            <Text style={styles.muted}>{project.description}</Text>
          )}

          {!!project.nextAction && (
            <Text style={styles.itemText}>
              Prossima azione: {project.nextAction}
            </Text>
          )}

          {!!project.targetDate && (
            <Text style={styles.muted}>
              Obiettivo: {project.targetDate}
            </Text>
          )}

          <Text style={styles.muted}>
            Priorità: {project.priority}
          </Text>

          <Text style={styles.green}>
            Stato: {project.status}
          </Text>

          <View style={styles.row}>
            {button(
              'Da iniziare',
              () => updateProjectStatus(project.id, 'Da iniziare'),
              true
            )}
            {button(
              'In corso',
              () => updateProjectStatus(project.id, 'In corso'),
              true
            )}
            {button(
              'Completato',
              () => updateProjectStatus(project.id, 'Completato'),
              true
            )}
          </View>

          {button(
            'Elimina progetto',
            () => deleteProject(project.id),
            true
          )}
        </View>
      ))
  }
</>}

        {tab === 'Attività' && (
          <>
            {heading('Le tue attività')}

            {card(
              <>
                <Text style={styles.cardTitle}>
                  Cosa devi fare?
                </Text>

                {field(
                  'Es. Studiare fisica',
                  taskName,
                  setTaskName,
                  {
                    returnKeyType: 'done',
                    onSubmitEditing: addTask,
                  }
                )}
                <Text style={styles.muted}>Priorità dell'attività</Text>

<View style={styles.row}>
  {['Alta', 'Media', 'Bassa'].map((priority) => (
    <Pressable
      key={priority}
      onPress={() => setTaskPriority(priority)}
      style={{
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor:
          taskPriority === priority ? '#16A34A' : '#E5E7EB',
      }}
    >
      <Text
        style={{
          color: taskPriority === priority ? '#FFFFFF' : '#111827',
          fontWeight: '600',
        }}
      >
        {priority}
      </Text>
    </Pressable>
  ))}
</View>

                {button('+ Aggiungi attività', addTask)}
              </>
            )}

            {heading(
              `Completate: ${doneTasks}/${data.tasks.length}`
            )}

            {data.tasks.length === 0
              ? card(
                  <Text style={styles.muted}>
                    Aggiungi la tua prima attività.
                  </Text>
                )
              : data.tasks.map((x) => (
                  <Pressable
                    key={x.id}
                    style={styles.listItem}
                    onPress={() => toggleTask(x.id)}
                  >
                    <Text style={styles.check}>
                      {x.done ? '☑' : '☐'}
                    </Text>
                    <Text
                      style={[
                        styles.itemText,
                        styles.flex,
                        x.done && styles.done,
                      ]}
                    >
                      {x.name}
                      <Text style={styles.muted}>
  <Text style={styles.muted}>
  Priorità: {x.priority || 'Media'}
   </Text>
    </Text>
                    </Text>
                  </Pressable>
                ))}
          </>
        )}

        {tab === 'Abitudini' && (
          <>
            {heading('Le tue abitudini')}

            {card(
              <>
                <Text style={styles.cardTitle}>
                  La tua routine
                </Text>
                <Text style={styles.muted}>
                  {doneHabits} di {data.habits.length} completate oggi
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          data.habits.length
                            ? (doneHabits / data.habits.length) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </>
            )}

            

{data.habits.map((x) => (
  <View key={x.id} style={styles.listItem}>
    <Pressable
      style={styles.flex}
      onPress={() => toggleHabit(x.id)}
    >
      <Text style={styles.check}>
        {x.done ? '☑' : '☐'}
      </Text>

      <Text
        style={[
          styles.itemText,
          x.done && styles.done,
        ]}
      >
        {x.name}
      </Text>
    </Pressable>

    {button('Modifica', () => {
      setHabitName(x.name);
      setEditingHabitId(x.id);
    }, true)}

    {button('Elimina', () => {
      const removeHabit = () => {
        setData((old) => ({
          ...old,
          habits: old.habits.filter((h) => h.id !== x.id),
        }));

        if (editingHabitId === x.id) {
          setEditingHabitId(null);
          setHabitName('');
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm('Vuoi eliminare questa abitudine?')) {
          removeHabit();
        }
      } else {
        Alert.alert(
          'Elimina abitudine',
          'Vuoi eliminare questa abitudine?',
          [
            { text: 'Annulla', style: 'cancel' },
            {
              text: 'Elimina',
              style: 'destructive',
              onPress: removeHabit,
            },
          ]
        );
      }
    }, true)}
  </View>
))}

            {card(
              <>
                <Text style={styles.cardTitle}>
                  {editingHabitId !== null
  ? 'Modifica abitudine'
  : 'Nuova abitudine'}
                </Text>

                {field(
                  'Es. Leggere 10 minuti',
                  habitName,
                  setHabitName,
                  {
                    returnKeyType: 'done',
                    onSubmitEditing: addHabit,
                  }
                )}

                {button(
  editingHabitId !== null
    ? 'Salva modifica'
    : '+ Aggiungi abitudine',
  addHabit
)}

{editingHabitId !== null &&
  button(
    'Annulla modifica',
    () => {
      setEditingHabitId(null);
      setHabitName('');
    },
    true
  )}

                {button(
                  'Azzera per un nuovo giorno',
                  () =>
                    setData((old) => ({
                      ...old,
                      habits: old.habits.map((h) => ({
                        ...h,
                        done: false,
                      })),
                    })),
                  true
                )}
              </>
            )}
          </>
        )}

        <Text style={styles.footer}>
          LIFEOS · VERSIONE 0.1
        </Text>
      </ScrollView>

      <View style={styles.nav}>
        
{[
  ['⌂', 'Home'],
  ['€', 'Soldi'],
  ['▥', 'Analisi'],
  ['◎', 'Obiettivi'],
  ['🚀', 'Progetti'],
  ['✓', 'Attività'],
  ['◉', 'Abitudini'],
  ['▦', 'Calendario'],
['📚', 'Studio'],
].map(([icon, label]) => (

          <Pressable
            key={label}
            style={styles.navItem}
            onPress={() => setTab(label)}
          >
            <Text
              style={[
                styles.navIcon,
                tab === label && styles.active,
              ]}
            >
              {icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                tab === label && styles.active,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131D',
  },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#292E3D',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2,
  },
  purple: {
    color: '#B9B0FF',
    fontWeight: '800',
  },
  eyebrow: {
    color: '#858CA1',
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#292444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 17,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: '#292444',
    borderRadius: 22,
    padding: 21,
    marginBottom: 13,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 12,
  },
  heroSub: {
    color: '#C2BDD8',
    fontSize: 12,
    marginTop: 5,
  },
  balanceLabel: {
    color: '#B9B0FF',
    marginTop: 24,
    fontSize: 12,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: '#1A1E2B',
    borderRadius: 17,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#292E3D',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 17,
    marginBottom: 11,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 9,
  },
  muted: {
    color: '#9097AA',
    fontSize: 12,
    lineHeight: 18,
  },
  green: {
    color: '#62D6A4',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  red: {
    color: '#FF8E9B',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  big: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginVertical: 5,
  },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1E2B',
    borderRadius: 14,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#292E3D',
  },
  quickIcon: {
    color: '#B9B0FF',
    fontSize: 21,
    width: 38,
  },
  itemText: {
    color: '#E9EAF1',
    fontSize: 14,
    fontWeight: '600',
  },
  arrow: {
    color: '#858CA1',
    fontSize: 24,
  },
  input: {
    backgroundColor: '#10131D',
    color: '#FFFFFF',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#353B4D',
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginTop: 10,
    fontSize: 15,
    minHeight: 45,
  },
  button: {
    flex: 1,
    backgroundColor: '#7565E8',
    borderRadius: 11,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 42,
  },
  buttonSecondary: {
    backgroundColor: '#252A39',
    borderWidth: 1,
    borderColor: '#454064',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#1A1E2B',
    borderRadius: 13,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#292E3D',
  },
  flex: {
    flex: 1,
  },
  check: {
    color: '#B9B0FF',
    fontSize: 22,
  },
  done: {
    color: '#777F95',
    textDecorationLine: 'line-through',
  },
  delete: {
    color: '#FF8E9B',
    fontSize: 23,
    paddingLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#303545',
    marginVertical: 14,
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#303545',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9A8CFF',
    borderRadius: 8,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 7,
    backgroundColor: '#171A26',
    borderTopWidth: 1,
    borderTopColor: '#292E3D',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  navIcon: {
    color: '#777F95',
    fontSize: 21,
  },
  navLabel: {
    color: '#777F95',
    fontSize: 10,
    fontWeight: '600',
  },
  active: {
    color: '#B9B0FF',
  },
  footer: {
    textAlign: 'center',
    color: '#5E6579',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 25,
    marginBottom: 7,
  },
  categoryList: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
},
categoryButton: {
  paddingVertical: 9,
  paddingHorizontal: 12,
  borderRadius: 10,
  backgroundColor: '#252A39',
  borderWidth: 1,
  borderColor: '#353B4D',
},
categorySelected: {
  backgroundColor: '#454064',
  borderColor: '#A99BFF',
},
categoryText: {
  color: '#FFFFFF',
  fontSize: 12,
},
});
