import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { userPreferencesApi } from '../services/userPreferencesApi';

type Language = 'en' | 'es' | 'fr';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Common
    'app.title': 'Todo App',
    'app.welcome': 'Welcome',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.role': 'Role',
    
    // Navigation
    'nav.tasks': 'Tasks',
    'nav.users': 'Users',
    'nav.todoStates': 'Todo States',
    
    // Tasks
    'task.title': 'Title',
    'task.description': 'Description',
    'task.dueDate': 'Due Date',
    'task.priority': 'Priority',
    'task.state': 'State',
    'task.create': 'Create New Task',
    'task.edit': 'Edit Task',
    'task.delete': 'Delete Task',
    'task.deleteConfirm': 'Are you sure you want to delete this task?',
    'task.noTasks': 'No tasks yet. Create your first task!',
    'task.filter': 'Search tasks...',
    'task.sort': 'Sort By',
    'task.stats.total': 'Total',
    'task.stats.active': 'Active',
    'task.stats.completed': 'Completed',
    'task.stats.highPriority': 'High Priority',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.createAccount': 'Create Account',
    
    // User Menu
    'userMenu.settings': 'Settings',
    'userMenu.configureStats': 'Configure Stats',
    'userMenu.logout': 'Logout',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.language': 'Language',
    'settings.stats': 'Statistics',
  },
  es: {
    // Common
    'app.title': 'Aplicación de Tareas',
    'app.welcome': 'Bienvenido',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.role': 'Rol',
    
    // Navigation
    'nav.tasks': 'Tareas',
    'nav.users': 'Usuarios',
    'nav.todoStates': 'Estados',
    
    // Tasks
    'task.title': 'Título',
    'task.description': 'Descripción',
    'task.dueDate': 'Fecha de Vencimiento',
    'task.priority': 'Prioridad',
    'task.state': 'Estado',
    'task.create': 'Crear Nueva Tarea',
    'task.edit': 'Editar Tarea',
    'task.delete': 'Eliminar Tarea',
    'task.deleteConfirm': '¿Está seguro de que desea eliminar esta tarea?',
    'task.noTasks': 'Aún no hay tareas. ¡Crea tu primera tarea!',
    'task.filter': 'Buscar tareas...',
    'task.sort': 'Ordenar Por',
    'task.stats.total': 'Total',
    'task.stats.active': 'Activas',
    'task.stats.completed': 'Completadas',
    'task.stats.highPriority': 'Alta Prioridad',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.logout': 'Cerrar Sesión',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.firstName': 'Nombre',
    'auth.lastName': 'Apellido',
    'auth.createAccount': 'Crear Cuenta',
    
    // User Menu
    'userMenu.settings': 'Configuración',
    'userMenu.configureStats': 'Configurar Estadísticas',
    'userMenu.logout': 'Cerrar Sesión',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.language': 'Idioma',
    'settings.stats': 'Estadísticas',
  },
  fr: {
    // Common
    'app.title': 'Application de Tâches',
    'app.welcome': 'Bienvenue',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.update': 'Mettre à jour',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.role': 'Rôle',
    
    // Navigation
    'nav.tasks': 'Tâches',
    'nav.users': 'Utilisateurs',
    'nav.todoStates': 'États',
    
    // Tasks
    'task.title': 'Titre',
    'task.description': 'Description',
    'task.dueDate': 'Date d\'échéance',
    'task.priority': 'Priorité',
    'task.state': 'État',
    'task.create': 'Créer une Nouvelle Tâche',
    'task.edit': 'Modifier la Tâche',
    'task.delete': 'Supprimer la Tâche',
    'task.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cette tâche?',
    'task.noTasks': 'Aucune tâche pour le moment. Créez votre première tâche!',
    'task.filter': 'Rechercher des tâches...',
    'task.sort': 'Trier Par',
    'task.stats.total': 'Total',
    'task.stats.active': 'Actives',
    'task.stats.completed': 'Terminées',
    'task.stats.highPriority': 'Haute Priorité',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.register': 'S\'inscrire',
    'auth.logout': 'Déconnexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.firstName': 'Prénom',
    'auth.lastName': 'Nom',
    'auth.createAccount': 'Créer un Compte',
    
    // User Menu
    'userMenu.settings': 'Paramètres',
    'userMenu.configureStats': 'Configurer les Statistiques',
    'userMenu.logout': 'Déconnexion',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.theme': 'Thème',
    'settings.theme.light': 'Clair',
    'settings.theme.dark': 'Sombre',
    'settings.language': 'Langue',
    'settings.stats': 'Statistiques',
  },
};

interface I18nContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => Promise<void>;
  availableLanguages: { code: Language; name: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  const availableLanguages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'es' as Language, name: 'Español' },
    { code: 'fr' as Language, name: 'Français' },
  ];

  // Load language from preferences on mount
  useEffect(() => {
    const loadLanguage = async () => {
      if (!user) {
        // For non-authenticated users, use browser language or localStorage
        const storedLang = localStorage.getItem('language') as Language | null;
        if (storedLang && ['en', 'es', 'fr'].includes(storedLang)) {
          setLanguageState(storedLang);
        } else {
          const browserLang = navigator.language.split('-')[0];
          const lang = (browserLang === 'es' || browserLang === 'fr') ? browserLang : 'en';
          setLanguageState(lang as Language);
        }
        setIsLoading(false);
        return;
      }

      try {
        const preferences = await userPreferencesApi.get();
        const savedLanguage = (preferences.language || 'en') as Language;
        setLanguageState(savedLanguage);
      } catch (err) {
        console.error('Failed to load language preferences:', err);
        // Use browser language as fallback
        const browserLang = navigator.language.split('-')[0];
        const lang = (browserLang === 'es' || browserLang === 'fr') ? browserLang : 'en';
        setLanguageState(lang as Language);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [user]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

    // Save to preferences (only if authenticated)
    if (user) {
      try {
        await userPreferencesApi.update({ language: lang });
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    } else {
      // For non-authenticated users, save to localStorage as fallback
      localStorage.setItem('language', lang);
    }
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  );
};

