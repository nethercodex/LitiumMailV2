import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Mail, Settings, Users, BarChart3, Shield, ArrowLeft, Database, Activity, Home, Server, UserCog, MessageSquare, FileText, LogOut, Edit3, Globe, AlertTriangle, CheckCircle, Lock, Key, Eye, EyeOff, Timer, Ban } from "lucide-react";
import SystemInfo from "./system-info";
import Monitoring from "./monitoring";
import DatabaseAdmin from "./database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getPlanDisplayName, PLANS } from "@shared/plans";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.id === 'support',
  });

  // Fetch users list
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.id === 'support' && activeSection === 'users',
  });

  // Update user mutation
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      await apiRequest("PATCH", `/api/admin/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Данные пользователя обновлены",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные пользователя",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (userData: any) => {
    setEditingUser({
      id: userData.id,
      username: userData.username,
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      plan: userData.plan,
      isActive: userData.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUserMutation.mutate(editingUser);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Не авторизован",
        description: "Вы не авторизованы. Перенаправляем на страницу входа...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user && user.id !== 'support') {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав доступа к админ-панели.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#b9ff6a] mx-auto"></div>
          <p className="text-white mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || user.id !== 'support') return null;

  const sidebarItems = [
    { id: 'dashboard', label: 'Панель управления', icon: BarChart3 },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'mail-server', label: 'Настройки сервера', icon: Server },
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'database', label: 'База данных', icon: Database },
    { id: 'monitoring', label: 'Мониторинг', icon: Activity },
    { id: 'security', label: 'Безопасность', icon: Shield },
    { id: 'system-info', label: 'Информация о панели', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Панель управления</h2>
              <p className="text-gray-400">Обзор системы LITIUM.SPACE</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Всего пользователей</CardTitle>
                  <Users className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statsLoading ? "..." : stats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-gray-400">
                    {statsLoading ? "..." : `+${stats?.userGrowth || 0}% за месяц`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Отправлено писем</CardTitle>
                  <Mail className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statsLoading ? "..." : stats?.totalEmails || 0}
                  </div>
                  <p className="text-xs text-gray-400">
                    {statsLoading ? "..." : `+${stats?.emailGrowth || 0}% за месяц`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Активность системы</CardTitle>
                  <BarChart3 className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statsLoading ? "..." : `${stats?.systemUptime || 0}%`}
                  </div>
                  <p className="text-xs text-gray-400">Время работы</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Серверов онлайн</CardTitle>
                  <Server className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {statsLoading ? "..." : stats?.serversOnline || "0/0"}
                  </div>
                  <p className="text-xs text-gray-400">Все работают</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Последние действия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#b9ff6a] rounded-full"></div>
                      <span className="text-sm text-gray-300">Новый пользователь зарегистрирован</span>
                      <span className="text-xs text-gray-500 ml-auto">2 мин назад</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Отправлено 15 писем</span>
                      <span className="text-xs text-gray-500 ml-auto">5 мин назад</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Создана резервная копия</span>
                      <span className="text-xs text-gray-500 ml-auto">1 час назад</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="bg-[#b9ff6a]/20 hover:bg-[#b9ff6a]/30 text-[#b9ff6a] border border-[#b9ff6a]/30">
                      <UserCog className="w-4 h-4 mr-2" />
                      Управление
                    </Button>
                    <Button className="bg-[#b9ff6a]/20 hover:bg-[#b9ff6a]/30 text-[#b9ff6a] border border-[#b9ff6a]/30">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Уведомления
                    </Button>
                    <Button className="bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-700">
                      <FileText className="w-4 h-4 mr-2" />
                      Отчеты
                    </Button>
                    <Button className="bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-700">
                      <Database className="w-4 h-4 mr-2" />
                      Резерв
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Управление пользователями</h2>
              <p className="text-gray-400">Просмотр и управление учетными записями</p>
            </div>
            
            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Список пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">Загрузка пользователей...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users && users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="text-left py-3 px-4 text-gray-300">ID</th>
                              <th className="text-left py-3 px-4 text-gray-300">Имя пользователя</th>
                              <th className="text-left py-3 px-4 text-gray-300">Email</th>
                              <th className="text-left py-3 px-4 text-gray-300">План</th>
                              <th className="text-left py-3 px-4 text-gray-300">Статус</th>
                              <th className="text-left py-3 px-4 text-gray-300">Дата регистрации</th>
                              <th className="text-left py-3 px-4 text-gray-300">Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user: any) => (
                              <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                <td className="py-3 px-4 text-white font-mono text-xs">{user.id}</td>
                                <td className="py-3 px-4 text-white">
                                  <div className="flex items-center gap-2">
                                    <UserCog className="h-4 w-4 text-[#b9ff6a]" />
                                    {user.username}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-300">{user.email || 'Не указан'}</td>
                                <td className="py-3 px-4">
                                  <Badge 
                                    variant={user.plan === 'basic' ? 'secondary' : 'default'}
                                    className={
                                      user.plan === 'basic' 
                                        ? 'bg-gray-700 text-gray-300' 
                                        : user.plan === 'pro'
                                        ? 'bg-[#b9ff6a] text-black hover:bg-[#b9ff6a]/80'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }
                                  >
                                    {getPlanDisplayName(user.plan)}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge 
                                    variant={user.isActive ? 'default' : 'destructive'}
                                    className={
                                      user.isActive 
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }
                                  >
                                    {user.isActive ? 'Активен' : 'Заблокирован'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-gray-400">
                                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Не указано'}
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    onClick={() => handleEditUser(user)}
                                    size="sm"
                                    className="w-8 h-8 p-0 bg-[#b9ff6a] hover:bg-[#a0e055] text-black"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        Пользователи не найдены
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      

      case 'mail-server':
        return <MailServerSettings />;
      
      case 'monitoring':
        return <Monitoring />;
      
      case 'database':
        return <DatabaseAdmin />;
      
      case 'system-info':
        return <SystemInfo />;
      
      case 'settings':
        return <AdminSettings />;
      
      case 'security':
        return <AdminSecuritySettings />;
      
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Раздел в разработке</h2>
              <p className="text-gray-400">Этот раздел будет добавлен в следующих обновлениях.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/40 border-r border-gray-800 backdrop-blur-sm">
        <div className="p-6 border-b border-gray-800">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">LITIUM.SPACE</h1>
          <p className="text-sm text-gray-400">Админ-панель</p>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#b9ff6a]/20 text-[#b9ff6a] border border-[#b9ff6a]/30'
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-800">
            <Link href="/api/logout">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
                <LogOut className="w-4 h-4 mr-3" />
                Выйти
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">Панель администратора</h1>
              </div>
              <Badge variant="secondary" className="bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/30">
                <Shield className="w-3 h-3 mr-1" />
                Администратор
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black border-[#b9ff6a]/20 text-white max-w-lg shadow-2xl">
          <DialogHeader className="space-y-3 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#b9ff6a]/10 rounded-lg flex items-center justify-center">
                <UserCog className="w-5 h-5 text-[#b9ff6a]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-[#b9ff6a]">
                  Редактировать пользователя
                </DialogTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Изменение данных пользователя {editingUser?.username}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-2">
                  Основная информация
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                      Имя пользователя
                    </Label>
                    <Input
                      id="username"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                      className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] focus:ring-[#b9ff6a]/20 transition-colors"
                      placeholder="Введите имя пользователя"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email адрес
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] focus:ring-[#b9ff6a]/20 transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">
                      Имя
                    </Label>
                    <Input
                      id="firstName"
                      value={editingUser.firstName}
                      onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                      className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] focus:ring-[#b9ff6a]/20 transition-colors"
                      placeholder="Введите имя"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">
                      Фамилия
                    </Label>
                    <Input
                      id="lastName"
                      value={editingUser.lastName}
                      onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                      className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] focus:ring-[#b9ff6a]/20 transition-colors"
                      placeholder="Введите фамилию"
                    />
                  </div>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-2">
                  Настройки аккаунта
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan" className="text-sm font-medium text-gray-300">
                      Тарифный план
                    </Label>
                    <Select 
                      value={editingUser.plan} 
                      onValueChange={(value) => setEditingUser({...editingUser, plan: value})}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] focus:ring-[#b9ff6a]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {Object.values(PLANS).map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="text-white hover:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                plan.id === 'basic' ? 'bg-gray-500' : 
                                plan.id === 'pro' ? 'bg-[#b9ff6a]' : 
                                'bg-purple-500'
                              }`}></div>
                              {plan.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">
                      Статус аккаунта
                    </Label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-900/50 border border-gray-700 rounded-md">
                      <Switch
                        id="isActive"
                        checked={editingUser.isActive}
                        onCheckedChange={(checked) => setEditingUser({...editingUser, isActive: checked})}
                        className="data-[state=checked]:bg-[#b9ff6a]"
                      />
                      <Label htmlFor="isActive" className="text-sm text-gray-300 cursor-pointer">
                        {editingUser.isActive ? 'Активный' : 'Заблокированный'}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-6"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSaveUser}
                  disabled={updateUserMutation.isPending}
                  className="bg-[#b9ff6a] hover:bg-[#a0e055] text-black font-medium px-6 shadow-lg shadow-[#b9ff6a]/20"
                >
                  {updateUserMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Сохранение...
                    </div>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент настроек системы
function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LITIUM.SPACE',
    siteDescription: 'Надежная коммуникационная платформа',
    adminEmail: 'admin@litium.space',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxUsersPerPlan: 1000,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    logLevel: 'info'
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    twoFactorRequired: false,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15,
    sessionSecure: true,
    corsEnabled: false,
    allowedOrigins: '',
    rateLimitEnabled: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userRegistrationNotify: true,
    failedLoginNotify: true,
    maintenanceNotify: true,
    backupStatusNotify: true,
    diskSpaceAlerts: true,
    performanceAlerts: true
  });

  // Загрузка текущих настроек
  const { data: currentSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  // Обновляем локальные состояния при загрузке настроек
  useEffect(() => {
    if (currentSettings) {
      if (currentSettings.general) {
        setGeneralSettings(currentSettings.general);
      }
      if (currentSettings.security) {
        setSecuritySettings(currentSettings.security);
      }
      if (currentSettings.notifications) {
        setNotificationSettings(currentSettings.notifications);
      }
    }
  }, [currentSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest('PUT', '/api/admin/settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Настройки сохранены",
        description: "Настройки системы успешно обновлены",
      });
      // Обновляем кэш настроек
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      // Перезагружаем страницу для обновления навбара
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить настройки",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings
    });
  };

  // Перезапуск системы
  const restartSystemMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/system/restart');
    },
    onSuccess: () => {
      toast({
        title: "Система перезапускается",
        description: "Система будет перезапущена через несколько секунд",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка перезапуска",
        description: error.message || "Не удалось перезапустить систему",
        variant: "destructive",
      });
    },
  });

  // Очистка кэша
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/system/clear-cache');
    },
    onSuccess: () => {
      toast({
        title: "Кэш очищен",
        description: "Кэш системы успешно очищен",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка очистки кэша",
        description: error.message || "Не удалось очистить кэш",
        variant: "destructive",
      });
    },
  });

  // Экспорт конфигурации
  const exportConfigMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('GET', '/api/admin/config/export');
    },
    onSuccess: (data) => {
      // Создаем файл для скачивания
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `litium-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Конфигурация экспортирована",
        description: "Файл конфигурации сохранен на компьютер",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка экспорта",
        description: error.message || "Не удалось экспортировать конфигурацию",
        variant: "destructive",
      });
    },
  });

  // Переключение режима обслуживания
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest('POST', '/api/admin/maintenance', { enabled });
    },
    onSuccess: (data) => {
      setGeneralSettings(prev => ({ ...prev, maintenanceMode: data.enabled }));
      toast({
        title: data.enabled ? "Режим обслуживания включен" : "Режим обслуживания отключен",
        description: data.enabled 
          ? "Сайт недоступен для обычных пользователей"
          : "Сайт снова доступен для всех пользователей",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка переключения режима",
        description: error.message || "Не удалось изменить режим обслуживания",
        variant: "destructive",
      });
    },
  });

  const handleMaintenanceToggle = () => {
    toggleMaintenanceMutation.mutate(!generalSettings.maintenanceMode);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#b9ff6a]" />
          <h1 className="text-2xl font-bold text-white">Настройки системы</h1>
        </div>
        
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="bg-[#b9ff6a] hover:bg-[#a0e055] text-black font-medium"
        >
          {saveSettingsMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Сохранение...
            </div>
          ) : (
            'Сохранить изменения'
          )}
        </Button>
      </div>

      {/* Общие настройки */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#b9ff6a]" />
            Общие настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-gray-300">
                Название сайта
              </Label>
              <Input
                id="siteName"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-gray-300">
                Email администратора
              </Label>
              <Input
                id="adminEmail"
                type="email"
                value={generalSettings.adminEmail}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription" className="text-gray-300">
              Описание сайта
            </Label>
            <Textarea
              id="siteDescription"
              value={generalSettings.siteDescription}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxUsers" className="text-gray-300">
                Максимум пользователей
              </Label>
              <Input
                id="maxUsers"
                type="number"
                value={generalSettings.maxUsersPerPlan}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxUsersPerPlan: parseInt(e.target.value) }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-gray-300">
                Таймаут сессии (мин)
              </Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={generalSettings.sessionTimeout}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logLevel" className="text-gray-300">
                Уровень логирования
              </Label>
              <select
                value={generalSettings.logLevel}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, logLevel: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:border-[#b9ff6a] focus:outline-none"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={generalSettings.maintenanceMode}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="maintenanceMode" className="text-gray-300">
                Режим обслуживания
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="registrationEnabled"
                checked={generalSettings.registrationEnabled}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="registrationEnabled" className="text-gray-300">
                Разрешить регистрацию
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailVerification"
                checked={generalSettings.emailVerificationRequired}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, emailVerificationRequired: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="emailVerification" className="text-gray-300">
                Проверка email
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки безопасности */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#b9ff6a]" />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength" className="text-gray-300">
                Мин. длина пароля
              </Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="6"
                max="32"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts" className="text-gray-300">
                Макс. попыток входа
              </Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                min="3"
                max="10"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration" className="text-gray-300">
                Блокировка (мин)
              </Label>
              <Input
                id="lockoutDuration"
                type="number"
                min="5"
                max="60"
                value={securitySettings.accountLockoutDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, accountLockoutDuration: parseInt(e.target.value) }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rateLimitRequests" className="text-gray-300">
                Лимит запросов
              </Label>
              <Input
                id="rateLimitRequests"
                type="number"
                min="10"
                max="1000"
                value={securitySettings.rateLimitRequests}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, rateLimitRequests: parseInt(e.target.value) }))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="passwordSpecialChars"
                checked={securitySettings.passwordRequireSpecialChars}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireSpecialChars: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="passwordSpecialChars" className="text-gray-300 text-sm">
                Спец. символы
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="passwordNumbers"
                checked={securitySettings.passwordRequireNumbers}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireNumbers: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="passwordNumbers" className="text-gray-300 text-sm">
                Цифры
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="passwordUppercase"
                checked={securitySettings.passwordRequireUppercase}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireUppercase: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="passwordUppercase" className="text-gray-300 text-sm">
                Заглавные буквы
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="twoFactor"
                checked={securitySettings.twoFactorRequired}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="twoFactor" className="text-gray-300 text-sm">
                2FA обязательно
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedOrigins" className="text-gray-300">
              Разрешенные домены CORS (через запятую)
            </Label>
            <Input
              id="allowedOrigins"
              value={securitySettings.allowedOrigins}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, allowedOrigins: e.target.value }))}
              placeholder="https://example.com, https://app.example.com"
              className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Настройки уведомлений */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#b9ff6a]" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="emailNotifications" className="text-gray-300">
                Email уведомления
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="systemAlerts"
                checked={notificationSettings.systemAlerts}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="systemAlerts" className="text-gray-300">
                Системные оповещения
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="userRegistration"
                checked={notificationSettings.userRegistrationNotify}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, userRegistrationNotify: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="userRegistration" className="text-gray-300">
                Новые пользователи
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="failedLogin"
                checked={notificationSettings.failedLoginNotify}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, failedLoginNotify: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="failedLogin" className="text-gray-300">
                Неудачные входы
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenance"
                checked={notificationSettings.maintenanceNotify}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, maintenanceNotify: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="maintenance" className="text-gray-300">
                Обслуживание
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="backupStatus"
                checked={notificationSettings.backupStatusNotify}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, backupStatusNotify: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="backupStatus" className="text-gray-300">
                Резервные копии
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="diskSpace"
                checked={notificationSettings.diskSpaceAlerts}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, diskSpaceAlerts: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="diskSpace" className="text-gray-300">
                Место на диске
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="performance"
                checked={notificationSettings.performanceAlerts}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, performanceAlerts: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-[#b9ff6a] focus:ring-[#b9ff6a]"
              />
              <Label htmlFor="performance" className="text-gray-300">
                Производительность
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительные функции системы */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#b9ff6a]" />
            Управление системой
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Режим обслуживания */}
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
              <div>
                <div className="font-medium text-white">Режим обслуживания</div>
                <div className="text-sm text-gray-400">
                  {generalSettings.maintenanceMode ? "Включен" : "Отключен"}
                </div>
              </div>
              <Button
                variant={generalSettings.maintenanceMode ? "destructive" : "outline"}
                size="sm"
                onClick={handleMaintenanceToggle}
                disabled={toggleMaintenanceMutation.isPending}
              >
                {generalSettings.maintenanceMode ? "Отключить" : "Включить"}
              </Button>
            </div>

            {/* Перезапуск системы */}
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
              <div>
                <div className="font-medium text-white">Перезапуск системы</div>
                <div className="text-sm text-gray-400">
                  Безопасный перезапуск сервера
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restartSystemMutation.mutate()}
                disabled={restartSystemMutation.isPending}
              >
                {restartSystemMutation.isPending ? "Перезапуск..." : "Перезапустить"}
              </Button>
            </div>

            {/* Очистка кэша */}
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
              <div>
                <div className="font-medium text-white">Очистка кэша</div>
                <div className="text-sm text-gray-400">
                  Очистить весь системный кэш
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
              >
                {clearCacheMutation.isPending ? "Очистка..." : "Очистить"}
              </Button>
            </div>

            {/* Экспорт конфигурации */}
            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
              <div>
                <div className="font-medium text-white">Экспорт конфигурации</div>
                <div className="text-sm text-gray-400">
                  Скачать файл настроек
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportConfigMutation.mutate()}
                disabled={exportConfigMutation.isPending}
              >
                {exportConfigMutation.isPending ? "Экспорт..." : "Экспорт"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-between pt-6 border-t border-gray-800">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Сбросить изменения
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="bg-[#b9ff6a] text-black hover:bg-[#a8ef59]"
        >
          {saveSettingsMutation.isPending ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </div>

      {/* Информация о версии */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#b9ff6a]" />
            Информация о системе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Версия:</span>
                <span className="text-white font-medium">1.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Последнее обновление:</span>
                <span className="text-white font-medium">15.01.2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Лицензия:</span>
                <span className="text-white font-medium">MIT</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Разработчик:</span>
                <span className="text-[#b9ff6a] font-medium">NETHERCODE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Техподдержка:</span>
                <a href="https://t.me/nethercode" target="_blank" rel="noopener noreferrer" className="text-[#b9ff6a] hover:underline">
                  https://t.me/nethercode
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Статус:</span>
                <Badge className="bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/40">
                  Активна
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент для управления настройками почтового сервера
function MailServerSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
    imapHost: '',
    imapPort: 993,
    imapSecure: true,
    domain: 'litium.space'
  });

  // Загружаем текущие настройки
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/mail-settings'],
  });

  // Загрузка статуса собственного почтового сервера
  const { data: serverStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/mail-server/status'],
    refetchInterval: 5000, // Обновляем каждые 5 секунд
  });

  // Обновляем форму при загрузке настроек
  useEffect(() => {
    if (settings) {
      setFormData({
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpSecure: settings.smtpSecure !== false,
        smtpUser: settings.smtpUser || '',
        smtpPassword: settings.smtpPassword === '••••••••' ? '' : settings.smtpPassword || '',
        imapHost: settings.imapHost || '',
        imapPort: settings.imapPort || 993,
        imapSecure: settings.imapSecure !== false,
        domain: settings.domain || 'litium.space'
      });
    }
  }, [settings]);

  // Мутация для сохранения настроек
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/mail-settings', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Настройки сохранены",
        description: "Настройки почтового сервера успешно обновлены",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mail-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.smtpHost || !formData.smtpUser || !formData.imapHost || !formData.domain) {
      toast({
        title: "Ошибка валидации",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    saveSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Мутации для управления серверами
  const startServerMutation = useMutation({
    mutationFn: async (port: number = 2525) => {
      return apiRequest('POST', '/api/admin/mail-server/start', { port });
    },
    onSuccess: () => {
      toast({
        title: "Сервер запущен",
        description: "Собственный почтовый сервер LITIUM успешно запущен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mail-server/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка запуска",
        description: error.message || "Не удалось запустить почтовый сервер",
        variant: "destructive",
      });
    },
  });

  const stopServerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/mail-server/stop', {});
    },
    onSuccess: () => {
      toast({
        title: "Сервер остановлен",
        description: "Собственный почтовый сервер LITIUM остановлен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mail-server/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка остановки",
        description: error.message || "Не удалось остановить почтовый сервер",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Собственный почтовый сервер LITIUM.SPACE</h2>
        <p className="text-gray-400">Управление независимым почтовым сервером без зависимости от внешних сервисов</p>
      </div>

      {/* Статус собственного почтового сервера */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Server className="w-5 h-5" />
            Статус собственного SMTP сервера LITIUM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Состояние сервера</Label>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${serverStatus?.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${serverStatus?.isRunning ? 'text-green-400' : 'text-red-400'}`}>
                  {statusLoading ? 'Загрузка...' : serverStatus?.isRunning ? 'Запущен' : 'Остановлен'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Порт SMTP</Label>
              <span className="text-white font-mono">
                {serverStatus?.port || 2525}
              </span>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Домен</Label>
              <span className="text-white font-mono">
                mail.litium.space
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => startServerMutation.mutate(2525)}
              disabled={serverStatus?.isRunning || startServerMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {startServerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Запуск...
                </div>
              ) : (
                'Запустить сервер'
              )}
            </Button>
            
            <Button
              onClick={() => stopServerMutation.mutate()}
              disabled={!serverStatus?.isRunning || stopServerMutation.isPending}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              {stopServerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  Остановка...
                </div>
              ) : (
                'Остановить сервер'
              )}
            </Button>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Информация о сервере:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Адрес сервера: {window.location.hostname}:2525</li>
              <li>• Поддержка SSL/TLS: Да</li>
              <li>• Аутентификация: Обязательная</li>
              <li>• Максимальный размер письма: 10 МБ</li>
              <li>• Домены: @litium.space</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Инструкция по подключению домена */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Инструкция: Подключение собственного домена
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-[#b9ff6a]/10 to-transparent p-4 rounded-lg border border-[#b9ff6a]/20">
            <h4 className="text-[#b9ff6a] font-medium mb-3">Настройка DNS записей для домена litium.space</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-white font-medium mb-2">1. MX запись (обязательно)</h5>
                <div className="bg-black/40 p-3 rounded border font-mono text-sm">
                  <div className="text-gray-300 mb-1">Домен: litium.space</div>
                  <div className="text-gray-300 mb-1">Тип: MX</div>
                  <div className="text-gray-300 mb-1">Имя: @</div>
                  <div className="text-gray-300 mb-1">Значение: {window.location.hostname}</div>
                  <div className="text-gray-300">Приоритет: 10</div>
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-2">2. A запись (для SMTP сервера)</h5>
                <div className="bg-black/40 p-3 rounded border font-mono text-sm">
                  <div className="text-gray-300 mb-1">Домен: litium.space</div>
                  <div className="text-gray-300 mb-1">Тип: A</div>
                  <div className="text-gray-300 mb-1">Имя: mail</div>
                  <div className="text-gray-300">Значение: IP адрес {window.location.hostname}</div>
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-2">3. SPF запись (для защиты от спама)</h5>
                <div className="bg-black/40 p-3 rounded border font-mono text-sm">
                  <div className="text-gray-300 mb-1">Домен: litium.space</div>
                  <div className="text-gray-300 mb-1">Тип: TXT</div>
                  <div className="text-gray-300 mb-1">Имя: @</div>
                  <div className="text-gray-300">Значение: "v=spf1 a:{window.location.hostname} ~all"</div>
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-2">4. DMARC запись (рекомендуется)</h5>
                <div className="bg-black/40 p-3 rounded border font-mono text-sm">
                  <div className="text-gray-300 mb-1">Домен: litium.space</div>
                  <div className="text-gray-300 mb-1">Тип: TXT</div>
                  <div className="text-gray-300 mb-1">Имя: _dmarc</div>
                  <div className="text-gray-300">Значение: "v=DMARC1; p=quarantine; rua=mailto:dmarc@litium.space"</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium">Популярные DNS провайдеры:</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>• Cloudflare - Панель управления → DNS</div>
                <div>• Namecheap - Advanced DNS</div>
                <div>• GoDaddy - DNS Management</div>
                <div>• Reg.ru - Управление DNS</div>
                <div>• 2domains - DNS записи</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-white font-medium">Время применения:</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>• MX записи: 1-24 часа</div>
                <div>• A записи: 5-60 минут</div>
                <div>• TXT записи: 5-60 минут</div>
                <div>• Полная синхронизация: до 48 часов</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-yellow-400 font-medium mb-1">Важные замечания:</h5>
                <ul className="text-sm text-yellow-200/80 space-y-1">
                  <li>• Убедитесь, что TTL для DNS записей не превышает 3600 секунд</li>
                  <li>• Удалите старые MX записи перед добавлением новых</li>
                  <li>• Проверьте работу через онлайн-инструменты DNS lookup</li>
                  <li>• Сохраните резервные копии старых DNS настроек</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-green-400 font-medium mb-1">Проверка настройки:</h5>
                <div className="text-sm text-green-200/80 space-y-1">
                  <div>1. Команда: <code className="bg-black/40 px-2 py-1 rounded">nslookup -type=mx litium.space</code></div>
                  <div>2. Онлайн-инструменты: MXToolbox.com, DNSChecker.org</div>
                  <div>3. Тестовое письмо на адрес @litium.space</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Практическая инструкция подключения */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Пошаговая инструкция подключения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</div>
                Войдите в панель управления DNS
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>• Перейдите к провайдеру домена litium.space</div>
                <div>• Найдите раздел "DNS Management" или "Управление DNS"</div>
                <div>• Подготовьте данные: IP адрес {window.location.hostname}</div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
              <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">2</div>
                Настройте MX запись
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>• Удалите все существующие MX записи</div>
                <div>• Создайте новую MX запись:</div>
                <div className="bg-black/40 p-3 rounded border-l-4 border-purple-500 ml-4">
                  <div>Имя: @ (корень домена)</div>
                  <div>Значение: {window.location.hostname}</div>
                  <div>Приоритет: 10</div>
                  <div>TTL: 3600 (1 час)</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
              <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">3</div>
                Добавьте SPF запись
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>• Создайте TXT запись для защиты от спама:</div>
                <div className="bg-black/40 p-3 rounded border-l-4 border-orange-500 ml-4">
                  <div>Имя: @ (корень домена)</div>
                  <div>Значение: v=spf1 a:{window.location.hostname} ~all</div>
                  <div>TTL: 3600</div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
              <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">4</div>
                Проверьте и активируйте
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>• Сохраните все изменения в DNS панели</div>
                <div>• Подождите 15-60 минут для распространения</div>
                <div>• Проверьте через команду: <code className="bg-black/40 px-2 py-1 rounded">dig mx litium.space</code></div>
                <div>• Отправьте тестовое письмо на admin@litium.space</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-red-400 font-medium mb-2">Частые ошибки при настройке:</h5>
                <ul className="text-sm text-red-200/80 space-y-1">
                  <li>• Не удаление старых MX записей</li>
                  <li>• Неправильное указание IP адреса сервера</li>
                  <li>• Слишком большое значение TTL (больше 3600)</li>
                  <li>• Отсутствие точки в конце FQDN записей</li>
                  <li>• Неправильный синтаксис SPF записи</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP Settings */}
        <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Настройки SMTP (Исходящая почта)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Быстрая настройка популярных провайдеров */}
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700">
              <h4 className="text-gray-300 font-medium mb-3">Быстрая настройка популярных провайдеров:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => setFormData({
                    ...formData,
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpSecure: true
                  })}
                  variant="outline"
                  className="border-gray-600 hover:border-[#b9ff6a] hover:text-[#b9ff6a]"
                >
                  Gmail
                </Button>
                <Button
                  onClick={() => setFormData({
                    ...formData,
                    smtpHost: 'smtp.yandex.ru',
                    smtpPort: 587,
                    smtpSecure: true
                  })}
                  variant="outline"
                  className="border-gray-600 hover:border-[#b9ff6a] hover:text-[#b9ff6a]"
                >
                  Yandex
                </Button>
                <Button
                  onClick={() => setFormData({
                    ...formData,
                    smtpHost: 'smtp.mail.ru',
                    smtpPort: 587,
                    smtpSecure: true
                  })}
                  variant="outline"
                  className="border-gray-600 hover:border-[#b9ff6a] hover:text-[#b9ff6a]"
                >
                  Mail.ru
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                После выбора провайдера укажите логин и пароль от почтового ящика
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost" className="text-gray-300">
                  SMTP Сервер *
                </Label>
                <Input
                  id="smtpHost"
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort" className="text-gray-300">
                  SMTP Порт
                </Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value) || 587)}
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUser" className="text-gray-300">
                  SMTP Пользователь *
                </Label>
                <Input
                  id="smtpUser"
                  type="text"
                  value={formData.smtpUser}
                  onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword" className="text-gray-300">
                  SMTP Пароль *
                </Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={formData.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  placeholder={settings?.smtpPassword === '••••••••' ? 'Не изменять' : 'Введите пароль'}
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="smtpSecure"
                checked={formData.smtpSecure}
                onCheckedChange={(checked) => handleInputChange('smtpSecure', checked)}
              />
              <Label htmlFor="smtpSecure" className="text-gray-300">
                Использовать SSL/TLS для SMTP
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* IMAP Settings */}
        <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
              <Database className="w-5 h-5" />
              Настройки IMAP (Входящая почта)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imapHost" className="text-gray-300">
                  IMAP Сервер *
                </Label>
                <Input
                  id="imapHost"
                  type="text"
                  value={formData.imapHost}
                  onChange={(e) => handleInputChange('imapHost', e.target.value)}
                  placeholder="imap.gmail.com"
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imapPort" className="text-gray-300">
                  IMAP Порт
                </Label>
                <Input
                  id="imapPort"
                  type="number"
                  value={formData.imapPort}
                  onChange={(e) => handleInputChange('imapPort', parseInt(e.target.value) || 993)}
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="imapSecure"
                checked={formData.imapSecure}
                onCheckedChange={(checked) => handleInputChange('imapSecure', checked)}
              />
              <Label htmlFor="imapSecure" className="text-gray-300">
                Использовать SSL/TLS для IMAP
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Domain Settings */}
        <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Настройки домена
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-gray-300">
                Домен почтового сервиса *
              </Label>
              <Input
                id="domain"
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                placeholder="litium.space"
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
              />
              <p className="text-sm text-gray-500">
                Все новые email адреса будут создаваться в формате username@{formData.domain}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saveSettingsMutation.isPending}
            className="bg-[#b9ff6a] hover:bg-[#a0e055] text-black font-medium px-8 shadow-lg shadow-[#b9ff6a]/20"
          >
            {saveSettingsMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Сохранение...
              </div>
            ) : (
              'Сохранить настройки'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Компонент настроек безопасности системы
function AdminSecuritySettings() {
  const { toast } = useToast();
  const [securitySettings, setSecuritySettings] = useState({
    // Настройки паролей
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiration: 90,
    
    // Настройки входа
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 60,
    
    // Защита от атак
    enableRateLimit: true,
    rateLimitWindow: 15,
    rateLimitRequests: 100,
    
    // CORS и безопасность
    enableCORS: true,
    allowedOrigins: '',
    
    // Шифрование почты
    enableEmailEncryption: false,
    encryptionAlgorithm: 'AES-256',
    
    // Мониторинг безопасности
    enableSecurityLogs: true,
    logFailedLogins: true,
    logSuspiciousActivity: true,
    
    // Дополнительная защита
    enableIPWhitelist: false,
    whitelistedIPs: '',
    enableFirewall: true,
    
    // Патчи безопасности
    enableSQLInjectionProtection: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    enableHTTPSOnly: true,
    enableSecurityHeaders: true,
    enableBruteForceProtection: true,
    enableSessionHijackingProtection: true,
    enableDataValidation: true,
    enableAuditLogs: true
  });

  // Загрузка текущих настроек безопасности
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/security/settings'],
    retry: 1
  });

  useEffect(() => {
    if (currentSettings) {
      setSecuritySettings(currentSettings);
    }
  }, [currentSettings]);

  // Сохранение настроек безопасности
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest('POST', '/api/admin/security/settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Настройки безопасности сохранены",
        description: "Все изменения применены успешно",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить настройки",
        variant: "destructive",
      });
    },
  });

  // Генерация нового ключа шифрования
  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/security/generate-key');
    },
    onSuccess: () => {
      toast({
        title: "Новый ключ сгенерирован",
        description: "Ключ шифрования обновлен",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка генерации ключа",
        description: error.message || "Не удалось сгенерировать ключ",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(securitySettings);
  };

  const handleInputChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateKey = () => {
    generateKeyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-6 h-6 border-2 border-[#b9ff6a] border-t-transparent rounded-full animate-spin"></div>
          Загрузка настроек безопасности...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Настройки безопасности</h2>
        <p className="text-gray-400">Управление защитой системы и почтового сервера</p>
      </div>

      {/* Настройки паролей */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Политика паролей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Минимальная длина пароля</Label>
              <Input
                type="number"
                value={securitySettings.minPasswordLength}
                onChange={(e) => handleInputChange('minPasswordLength', parseInt(e.target.value))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                min="6"
                max="32"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Срок действия пароля (дни)</Label>
              <Input
                type="number"
                value={securitySettings.passwordExpiration}
                onChange={(e) => handleInputChange('passwordExpiration', parseInt(e.target.value))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                min="0"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Требовать заглавные буквы</Label>
              <Switch
                checked={securitySettings.requireUppercase}
                onCheckedChange={(checked) => handleInputChange('requireUppercase', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Требовать цифры</Label>
              <Switch
                checked={securitySettings.requireNumbers}
                onCheckedChange={(checked) => handleInputChange('requireNumbers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Требовать специальные символы</Label>
              <Switch
                checked={securitySettings.requireSpecialChars}
                onCheckedChange={(checked) => handleInputChange('requireSpecialChars', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки входа и сессий */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Key className="w-5 h-5" />
            Контроль входа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Максимум попыток входа</Label>
              <Input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Блокировка на (минут)</Label>
              <Input
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Таймаут сессии (минут)</Label>
              <Input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                min="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Защита от атак */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Защита от атак
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Ограничение скорости запросов</Label>
              <p className="text-sm text-gray-500">Защита от DDoS и спама</p>
            </div>
            <Switch
              checked={securitySettings.enableRateLimit}
              onCheckedChange={(checked) => handleInputChange('enableRateLimit', checked)}
            />
          </div>
          
          {securitySettings.enableRateLimit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Окно времени (минут)</Label>
                <Input
                  type="number"
                  value={securitySettings.rateLimitWindow}
                  onChange={(e) => handleInputChange('rateLimitWindow', parseInt(e.target.value))}
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Максимум запросов</Label>
                <Input
                  type="number"
                  value={securitySettings.rateLimitRequests}
                  onChange={(e) => handleInputChange('rateLimitRequests', parseInt(e.target.value))}
                  className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]"
                  min="10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Шифрование почты */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Шифрование почты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Шифрование электронной почты</Label>
              <p className="text-sm text-gray-500">Шифрование содержимого писем при хранении</p>
            </div>
            <Switch
              checked={securitySettings.enableEmailEncryption}
              onCheckedChange={(checked) => handleInputChange('enableEmailEncryption', checked)}
            />
          </div>
          
          {securitySettings.enableEmailEncryption && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Алгоритм шифрования</Label>
                <Select
                  value={securitySettings.encryptionAlgorithm}
                  onValueChange={(value) => handleInputChange('encryptionAlgorithm', value)}
                >
                  <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256">AES-256</SelectItem>
                    <SelectItem value="AES-192">AES-192</SelectItem>
                    <SelectItem value="AES-128">AES-128</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Ключ шифрования</Label>
                <Button
                  onClick={() => generateKeyMutation.mutate()}
                  disabled={generateKeyMutation.isPending}
                  variant="outline"
                  className="w-full border-gray-600 hover:border-[#b9ff6a] hover:text-[#b9ff6a]"
                >
                  {generateKeyMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#b9ff6a] border-t-transparent rounded-full animate-spin"></div>
                      Генерация...
                    </div>
                  ) : (
                    'Сгенерировать новый ключ'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Мониторинг безопасности */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Мониторинг безопасности
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Включить логи безопасности</Label>
              <Switch
                checked={securitySettings.enableSecurityLogs}
                onCheckedChange={(checked) => handleInputChange('enableSecurityLogs', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Логировать неудачные входы</Label>
              <Switch
                checked={securitySettings.logFailedLogins}
                onCheckedChange={(checked) => handleInputChange('logFailedLogins', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Логировать подозрительную активность</Label>
              <Switch
                checked={securitySettings.logSuspiciousActivity}
                onCheckedChange={(checked) => handleInputChange('logSuspiciousActivity', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP-фильтрация */}
      <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-[#b9ff6a] flex items-center gap-2">
            <Ban className="w-5 h-5" />
            IP-фильтрация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Белый список IP-адресов</Label>
              <p className="text-sm text-gray-500">Разрешить доступ только с указанных IP</p>
            </div>
            <Switch
              checked={securitySettings.enableIPWhitelist}
              onCheckedChange={(checked) => handleInputChange('enableIPWhitelist', checked)}
            />
          </div>
          
          {securitySettings.enableIPWhitelist && (
            <div className="space-y-2">
              <Label className="text-gray-300">Разрешенные IP-адреса</Label>
              <Textarea
                value={securitySettings.whitelistedIPs}
                onChange={(e) => handleInputChange('whitelistedIPs', e.target.value)}
                placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
                className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] min-h-[100px]"
              />
              <p className="text-xs text-gray-500">
                По одному IP или подсети на строку. Поддерживается CIDR нотация.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Включить файрвол</Label>
              <p className="text-sm text-gray-500">Базовая защита от атак</p>
            </div>
            <Switch
              checked={securitySettings.enableFirewall}
              onCheckedChange={(checked) => handleInputChange('enableFirewall', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Патчи безопасности */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#b9ff6a]" />
            Патчи безопасности
          </CardTitle>
          <p className="text-gray-400">Дополнительные меры защиты системы</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Защита от SQL-инъекций</Label>
                <p className="text-sm text-gray-500">Автоматическая фильтрация SQL-запросов</p>
              </div>
              <Switch
                checked={securitySettings.enableSQLInjectionProtection}
                onCheckedChange={(checked) => handleInputChange('enableSQLInjectionProtection', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Защита от XSS</Label>
                <p className="text-sm text-gray-500">Фильтрация вредоносных скриптов</p>
              </div>
              <Switch
                checked={securitySettings.enableXSSProtection}
                onCheckedChange={(checked) => handleInputChange('enableXSSProtection', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Защита от CSRF</Label>
                <p className="text-sm text-gray-500">Токены защиты от подделки запросов</p>
              </div>
              <Switch
                checked={securitySettings.enableCSRFProtection}
                onCheckedChange={(checked) => handleInputChange('enableCSRFProtection', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Принудительный HTTPS</Label>
                <p className="text-sm text-gray-500">Перенаправление на защищенное соединение</p>
              </div>
              <Switch
                checked={securitySettings.enableHTTPSOnly}
                onCheckedChange={(checked) => handleInputChange('enableHTTPSOnly', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Заголовки безопасности</Label>
                <p className="text-sm text-gray-500">HSTS, CSP, X-Frame-Options</p>
              </div>
              <Switch
                checked={securitySettings.enableSecurityHeaders}
                onCheckedChange={(checked) => handleInputChange('enableSecurityHeaders', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Защита от брутфорса</Label>
                <p className="text-sm text-gray-500">Интеллектуальная блокировка атак</p>
              </div>
              <Switch
                checked={securitySettings.enableBruteForceProtection}
                onCheckedChange={(checked) => handleInputChange('enableBruteForceProtection', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Защита от угона сессий</Label>
                <p className="text-sm text-gray-500">Контроль целостности сессий</p>
              </div>
              <Switch
                checked={securitySettings.enableSessionHijackingProtection}
                onCheckedChange={(checked) => handleInputChange('enableSessionHijackingProtection', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Валидация данных</Label>
                <p className="text-sm text-gray-500">Строгая проверка входящих данных</p>
              </div>
              <Switch
                checked={securitySettings.enableDataValidation}
                onCheckedChange={(checked) => handleInputChange('enableDataValidation', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <div>
                <Label className="text-gray-300">Журнал аудита</Label>
                <p className="text-sm text-gray-500">Подробное логирование действий</p>
              </div>
              <Switch
                checked={securitySettings.enableAuditLogs}
                onCheckedChange={(checked) => handleInputChange('enableAuditLogs', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопка сохранения */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-[#b9ff6a] text-black hover:bg-[#a8ef59] px-8 py-2"
        >
          {saveSettingsMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Сохранение...
            </div>
          ) : (
            'Сохранить настройки безопасности'
          )}
        </Button>
      </div>
    </div>
  );
}