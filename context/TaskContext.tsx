"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Task, Category, Priority, Status } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface UserProfile {
  name: string;
  role: string;
  avatar: string | null;
}

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  userProfile: UserProfile;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Shaxsiy', color: 'bg-blue-500' },
  { id: '2', name: 'Ish', color: 'bg-orange-500' },
  { id: '3', name: 'O\'qish', color: 'bg-purple-500' },
];

const DEFAULT_USER: UserProfile = {
  name: 'Alisher Usmanov',
  role: 'Premium Account',
  avatar: null,
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('protasker-tasks', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('protasker-categories', DEFAULT_CATEGORIES);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('protasker-user', DEFAULT_USER);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Avoids strict mode hydration issues by deferring setState slightly out of the render cycle
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, taskUpdates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...taskUpdates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Math.random().toString(36).substring(2, 9),
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    setTasks(tasks.map(t => t.categoryId === id ? { ...t, categoryId: undefined } : t));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile({ ...userProfile, ...updates });
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <TaskContext.Provider value={{ tasks, categories, userProfile, addTask, updateTask, deleteTask, addCategory, updateCategory, deleteCategory, updateUserProfile }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
