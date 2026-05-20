"use client";
import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Task, Priority } from '@/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, ChevronDown, UserCircle, Plus } from 'lucide-react';

export default function EditorialApp() {
  const { tasks, addTask, updateTask, deleteTask, categories, userProfile, updateUserProfile } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'today' | 'planned' | 'important'>('today');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const openProfileEdit = () => {
    setEditName(userProfile.name);
    setEditRole(userProfile.role);
    setIsProfileEditing(true);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name: editName, role: editRole });
    setIsProfileEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      description: newTaskDesc,
      status: 'todo',
      priority: newTaskPriority,
      categoryId: newTaskCategoryId || categories[0]?.id,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined
    });
    
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskCategoryId('');
    setNewTaskDueDate('');
    setIsAdding(false);
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask(task.id, { status: newStatus });
  };

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const completionPercentage = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  const clearCompleted = () => {
    completedTasks.forEach(t => deleteTask(t.id));
  };

  let displayedTasks = tasks;
  if (activeTab === 'today') {
    displayedTasks = tasks; 
  } else if (activeTab === 'important') {
    displayedTasks = tasks.filter(t => t.priority === 'high');
  } else if (activeTab === 'planned') {
    displayedTasks = tasks.filter(t => t.status !== 'done');
  }

  if (searchQuery.trim()) {
    displayedTasks = displayedTasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const currentDate = new Date();

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex h-screen text-editorial-text font-sans bg-editorial-bg w-full overflow-hidden relative">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] lg:w-[260px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} bg-editorial-sidebar border-r border-editorial-border flex flex-col justify-between h-full shadow-2xl lg:shadow-none`}>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="font-serif italic text-3xl tracking-tighter">Vazifa.</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold mt-1">Boshqaruv</p>
              </div>
              <button className="lg:hidden p-2 -mr-3 -mt-2 text-gray-500 hover:text-black transition-colors rounded-full hover:bg-black/5" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

          <nav className="space-y-6">
            <div className="group cursor-pointer">
              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3 group-hover:opacity-100 transition-opacity">Asosiy</p>
              <ul className="space-y-3 font-medium relative">
                <li 
                  className={`flex items-center text-lg cursor-pointer ${activeTab === 'today' ? '' : 'opacity-60 hover:opacity-100 transition-opacity'}`}
                  onClick={() => setActiveTab('today')}
                >
                  Barchasi
                  {activeTab === 'today' && <motion.div layoutId="nav-indicator" className="absolute -left-4 w-1 h-1 rounded-full bg-black top-2.5" />}
                  <span className="ml-auto text-xs bg-black text-white px-2 py-0.5 rounded-full">{tasks.length}</span>
                </li>
                <li 
                  className={`flex items-center text-lg cursor-pointer ${activeTab === 'planned' ? '' : 'opacity-60 hover:opacity-100 transition-opacity'}`}
                  onClick={() => setActiveTab('planned')}
                >
                  Jarayonda
                  {activeTab === 'planned' && <motion.div layoutId="nav-indicator" className="absolute -left-4 w-1 h-1 rounded-full bg-black top-12" />}
                </li>
                <li 
                  className={`flex items-center text-lg cursor-pointer ${activeTab === 'important' ? '' : 'opacity-60 hover:opacity-100 transition-opacity'}`}
                  onClick={() => setActiveTab('important')}
                >
                  Muhim 
                  {activeTab === 'important' && <motion.div layoutId="nav-indicator" className="absolute -left-4 w-1 h-1 rounded-full bg-black top-[88px]" />}
                  <span className="ml-auto text-xs bg-black text-white px-2 py-0.5 rounded-full">{tasks.filter(t => t.priority === 'high').length}</span>
                </li>
              </ul>
            </div>

            <div className="group cursor-pointer pt-6">
              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3 group-hover:opacity-100 transition-opacity">Loyihalar</p>
              <ul className="space-y-3 opacity-70 text-sm">
                {categories.map(category => (
                  <motion.li whileHover={{ x: 4 }} key={category.id} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${category.color.replace('bg-', 'bg-').replace('-500', '-500')}`}></span> 
                    {category.name}
                  </motion.li>
                ))}
              </ul>
            </div>
          </nav>
        </motion.div>

        </div>
        <div className="p-8 border-t border-editorial-border mt-auto w-full">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <div 
              onClick={openProfileEdit}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-editorial-border hover:bg-white transition-colors cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-serif italic font-bold group-hover:scale-105 transition-transform overflow-hidden relative">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{userProfile.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{userProfile.name}</p>
                <p className="text-[10px] opacity-60 uppercase tracking-wider truncate">{userProfile.role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-white relative min-w-0 drop-shadow-sm">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-editorial-border bg-white flex-shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100">
              <Menu size={24} />
            </button>
            <h1 className="font-serif italic text-2xl tracking-tighter">Vazifa.</h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-serif italic font-bold overflow-hidden cursor-pointer shadow-sm" onClick={openProfileEdit}>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{userProfile.name.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-12 overflow-y-auto w-full custom-scrollbar">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 flex-shrink-0 gap-6">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="w-full md:w-auto flex-1">
              <div className="mb-6 md:mb-8 relative w-full lg:max-w-sm hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  placeholder="Vazifalarni qidirish..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-gray-50/50 border-gray-200 focus-visible:ring-black rounded-lg w-full text-sm placeholder:text-gray-400"
                />
              </div>
              <h2 className="font-serif text-5xl md:text-6xl leading-[0.9] mb-4 text-[#1A1A1A]">
              Bugun Qanday ishlarni bajarmiz <br/><span className="italic">muhimlari</span>
            </h2>
            <p className="text-sm opacity-60 mt-4">
              {format(currentDate, "d-MMMM, EEEE", { locale: uz })}. Sizda hozir {tasks.filter(t => t.status === 'todo').length} ta bajarilmagan topshiriq bor.
            </p>
          </motion.div>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-left md:text-right flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end w-full md:w-auto">
            <div>
              <p className="text-4xl md:text-5xl font-light tracking-tighter tabular-nums">{format(currentDate, "HH:mm")}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold mt-1 text-gray-500">Toshkent, UZ</p>
            </div>
            
            <AnimatePresence>
              {completedTasks.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-0 md:mt-4">
                   <button 
                     onClick={clearCompleted}
                     className="text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                   >
                     Tugatish
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden relative w-full mb-0 mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Vazifalarni qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-gray-50/50 border-gray-200 focus-visible:ring-black rounded-lg w-full text-sm placeholder:text-gray-400"
            />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {displayedTasks.length === 0 ? (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="text-center italic opacity-40 py-12 font-serif text-xl border-t border-editorial-card-border pt-12"
               >
                 Hozircha vazifalar yo&apos;q.
               </motion.div>
            ) : (
              displayedTasks.map((task) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
                  key={task.id} 
                  className={`p-5 flex items-center gap-6 group border-b border-editorial-card-border transition-colors border-l-4 ${task.status === 'done' ? 'opacity-50 border-l-transparent bg-gray-50/30' : 'border-l-transparent hover:border-l-black hover:bg-gray-50/50'}`}
                >
                  <motion.div 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleTaskStatus(task)}
                    className={`w-6 h-6 border-2 rounded flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${task.status === 'done' ? 'border-slate-300 bg-slate-200' : 'border-black hover:bg-black group-hover:bg-black/10'}`}
                  >
                    {task.status === 'done' ? (
                      <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></motion.svg>
                    ) : (
                      <div className="w-2 h-2 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </motion.div>
                  
                  <div className="flex-1 origin-left transition-transform">
                    <h3 className={`font-medium text-lg text-[#1A1A1A] transition-colors duration-300 ${task.status === 'done' ? 'line-through opacity-70' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      {task.categoryId && (
                        <p className="text-xs opacity-60">
                          Loyiha: {categories.find(c => c.id === task.categoryId)?.name || 'Noma&apos;lum'}
                        </p>
                      )}
                      {task.description && (
                        <>
                          <span className="text-xs opacity-40">•</span>
                          <p className="text-xs opacity-60 max-w-xs truncate">{task.description}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    {task.priority === 'high' && task.status !== 'done' && (
                      <span className="text-[9px] px-2 py-0.5 bg-red-100 text-red-700 rounded uppercase font-bold tracking-wider shadow-sm">
                        Shoshilinch
                      </span>
                    )}
                    {task.priority === 'medium' && task.status !== 'done' && (
                      <span className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded uppercase font-bold tracking-wider shadow-sm">
                        O&apos;rta
                      </span>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500" 
                      onClick={() => deleteTask(task.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border-t border-editorial-card-border overflow-hidden flex-shrink-0"
            >
              <div className="pt-6">
                <form onSubmit={handleAddTask} className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <Input 
                      autoFocus
                      placeholder="Yangi vazifa nomi..." 
                      value={newTaskTitle} 
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="text-lg bg-gray-50/50 border-gray-200 h-10 rounded-none focus-visible:ring-black transition-shadow"
                    />
                    <Textarea 
                      placeholder="Qo'shimcha izoh (ixtiyoriy)..." 
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="bg-gray-50/50 border-gray-200 rounded-none focus-visible:ring-black min-h-[60px] transition-shadow resize-none"
                    />
                    <div className="flex gap-2 items-center">
                      {(['low', 'medium', 'high'] as Priority[]).map(p => (
                        <Badge 
                          key={p} 
                          variant={newTaskPriority === p ? 'default' : 'outline'}
                          className={`cursor-pointer font-medium uppercase text-[10px] tracking-wider rounded-none px-3 transition-colors ${newTaskPriority === p ? 'bg-black text-white hover:bg-black/90 shadow' : 'hover:bg-gray-100 text-gray-900 border-gray-200'}`}
                          onClick={() => setNewTaskPriority(p)}
                        >
                          {p === 'low' ? 'Past' : p === 'medium' ? 'O&apos;rta' : 'Yuqori'}
                        </Badge>
                      ))}
                      <Input 
                        type="date" 
                        value={newTaskDueDate} 
                        onChange={(e) => setNewTaskDueDate(e.target.value)} 
                        className="ml-2 w-auto bg-gray-50/50 border-gray-200 h-6 py-0 px-2 text-[10px] rounded-none focus-visible:ring-black"
                      />
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-widest leading-6 mr-2 opacity-50">Loyiha:</span>
                      {categories.map(c => (
                        <Badge 
                          key={c.id} 
                          variant={newTaskCategoryId === c.id || (!newTaskCategoryId && categories[0].id === c.id) ? 'default' : 'outline'}
                          className={`cursor-pointer font-medium text-[10px] tracking-wider rounded-none px-3 transition-colors ${newTaskCategoryId === c.id || (!newTaskCategoryId && categories[0].id === c.id) ? 'bg-black text-white hover:bg-black/90 shadow' : 'hover:bg-gray-100 text-gray-900 border-gray-200'}`}
                          onClick={() => setNewTaskCategoryId(c.id)}
                        >
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-32">
                    <Button type="submit" className="bg-black text-white hover:bg-black/90 font-bold text-xs uppercase tracking-widest rounded-none h-10 transition-transform active:scale-95 shadow border border-transparent">
                      Saqlash
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="rounded-none border-gray-200 font-bold text-xs uppercase tracking-widest h-10 hover:bg-gray-50 transition-colors bg-transparent text-[#1A1A1A]">
                      Bekor qilish
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-editorial-card-border flex flex-col md:flex-row gap-4 flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-4 font-bold text-sm uppercase tracking-widest hover:bg-black/90 transition-colors shadow-lg border border-transparent border-t-0"
          >
            <Plus size={18} /> {isAdding ? 'Bekor qilish' : 'Yangi Vazifa'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.01, backgroundColor: "#111827", color: "#fff" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCalendar(true)}
            className="md:px-8 flex items-center justify-center gap-2 border border-black py-4 font-bold text-sm uppercase tracking-widest transition-colors text-[#1A1A1A] bg-transparent"
          >
            <CalendarIcon size={18} /> Kalendar
          </motion.button>
        </motion.footer>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:flex bg-editorial-sidebar p-8 flex-col h-full border-l border-editorial-border overflow-y-auto w-[300px] shadow-sm">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mb-10 text-center flex-shrink-0 pt-4">
          <div className="relative inline-block">
            <svg width="140" height="140" className="-rotate-90 filter drop-shadow-sm">
              <circle stroke="#E5E3DA" strokeWidth="8" fill="transparent" r="60" cx="70" cy="70"/>
              <motion.circle 
                stroke="#111827" 
                strokeWidth="8" 
                strokeDasharray="377" 
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 - (377 * completionPercentage) / 100 }} 
                transition={{ duration: 1.2, ease: "easeOut" }}
                fill="transparent" 
                r="60" cx="70" cy="70"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="font-serif text-4xl font-bold tracking-tighter">{completionPercentage}%</span>
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-50 font-bold mt-1 text-[#1A1A1A]">Bajarildi</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-10 flex-1 flex flex-col">
          <section>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 items-center flex gap-2">
              Statistika
              <span className="flex-1 h-px bg-editorial-border"></span>
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-editorial-border shadow-sm transition-shadow hover:shadow-md cursor-default">
                <p className="font-serif text-3xl font-bold">{tasks.length}</p>
                <p className="text-[9px] opacity-60 uppercase tracking-widest mt-1 font-semibold">Vazifalar</p>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-editorial-border shadow-sm transition-shadow hover:shadow-md cursor-default">
                <p className="font-serif text-3xl font-bold">{completedTasks.length}</p>
                <p className="text-[9px] opacity-60 uppercase tracking-widest mt-1 font-semibold">Tugatilgan</p>
              </motion.div>
            </div>
          </section>

          <section className="bg-black text-white p-7 rounded-2xl relative overflow-hidden shadow-xl mt-6">
            <div className="relative z-10">
              <p className="font-serif italic text-xl mb-3 leading-snug">&quot;Vaqtni boshqarish - hayotni boshqarish demakdir.&quot;</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-medium">— Stiven Kovi</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 p-4 opacity-20">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.714 4.14-10.428 9.983-11.609l-1.928 3.513c-2.4 1.139-4.053 3.511-4.053 6.487h6v9h-10zm-14.017 0v-7.391c0-5.714 4.14-10.428 9.983-11.609l-1.928 3.513c-2.4 1.139-4.053 3.511-4.053 6.487h6v9h-10z"/></svg>
            </div>
          </section>

          <section className="mt-auto pt-8">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 items-center flex gap-2">
              Bildirishnomalar
              <span className="flex-1 h-px bg-editorial-border"></span>
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm italic font-serif group cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                <span className="opacity-80 group-hover:opacity-100 transition-opacity">Loyha muddati ertaga yakunlanadi.</span>
              </li>
              <li className="flex gap-3 text-sm italic font-serif group cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">Yangi xabar: Dizaynerdan javob keldi.</span>
              </li>
            </ul>
          </section>
        </motion.div>
      </aside>

      <AnimatePresence>
        {isProfileEditing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-editorial-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold">Profilni tahrirlash</h3>
                <button onClick={() => setIsProfileEditing(false)} className="text-gray-400 hover:text-black transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="flex flex-col items-center mb-8 relative group">
                <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-serif overflow-hidden shadow-lg border-4 border-white cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userProfile.name.charAt(0)}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                <p className="text-[10px] uppercase tracking-widest opacity-40 mt-3 font-semibold">Rasmni o'zgartirish</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-2">Ism familiya</label>
                  <Input 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="border-gray-200 bg-gray-50 h-11 focus-visible:ring-black rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-2">Rol / Mutaxassislik</label>
                  <Input 
                    value={editRole} 
                    onChange={e => setEditRole(e.target.value)} 
                    className="border-gray-200 bg-gray-50 h-11 focus-visible:ring-black rounded-lg"
                    required
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsProfileEditing(false)} className="flex-1 h-12 uppercase tracking-widest font-bold text-xs border-gray-200 hover:bg-gray-50 text-gray-700">Bekor qilish</Button>
                  <Button type="submit" className="flex-1 h-12 uppercase tracking-widest font-bold text-xs bg-black text-white hover:bg-black/90 shadow-md">Saqlash</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-editorial-border overflow-hidden"
            >
              <div className="p-6 border-b border-editorial-border flex justify-between items-center bg-editorial-sidebar">
                <div className="flex items-center gap-4">
                  <h3 className="font-serif text-3xl font-bold capitalize">{format(calendarMonth, 'MMMM yyyy', { locale: uz })}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="h-8 w-8 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="h-8 w-8 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </Button>
                  </div>
                </div>
                <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-black transition-colors bg-white p-2 rounded-full shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6 bg-editorial-bg custom-scrollbar">
                <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-[500px] md:min-w-0">
                  {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
                    <div key={day} className="text-center font-bold text-[10px] uppercase tracking-widest opacity-40 py-2">{day}</div>
                  ))}
                  {calendarDays.map(day => {
                    const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate || t.createdAt), day));
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    
                    return (
                      <div 
                        key={day.toString()} 
                        className={`min-h-[80px] md:min-h-[110px] border rounded-xl p-2 md:p-3 transition-colors ${
                          !isCurrentMonth 
                            ? 'bg-gray-50/50 border-gray-100 opacity-60' 
                            : 'bg-white border-editorial-border shadow-sm hover:border-black/20 hover:shadow-md'
                        }`}
                      >
                         <div className={`font-serif text-sm md:text-lg font-bold mb-2 md:mb-3 ${isSameDay(day, new Date()) ? 'w-6 h-6 md:w-8 md:h-8 bg-black text-white rounded-full flex items-center justify-center -mt-1 -ml-1' : ''}`}>
                           {format(day, 'd')}
                         </div>
                         <div className="space-y-1.5 custom-scrollbar">
                           {dayTasks.slice(0, 3).map(t => (
                             <div key={t.id} className={`text-[9px] font-medium px-2 py-1 rounded truncate border ${
                               t.status === 'done' ? 'bg-gray-50 border-gray-200 text-gray-400 line-through' :
                               t.priority === 'high' ? 'bg-red-50 border-red-100 text-red-700' :
                               t.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                               'bg-blue-50 border-blue-100 text-blue-700'
                             }`}>
                               {t.title}
                             </div>
                           ))}
                           {dayTasks.length > 3 && (
                             <div className="text-[9px] text-gray-500 font-bold ml-1">+{dayTasks.length - 3} ta...</div>
                           )}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
