import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Mail, Settings, Users, BarChart3, Shield, ArrowLeft, Database, Activity, Home, Server, UserCog, MessageSquare, FileText, LogOut, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      await apiRequest(`/api/admin/users/${userData.id}`, {
        method: "PATCH", 
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      });
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
    { id: 'emails', label: 'Почтовая система', icon: Mail },
    { id: 'mail-server', label: 'Настройки сервера', icon: Server },
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'database', label: 'База данных', icon: Database },
    { id: 'monitoring', label: 'Мониторинг', icon: Activity },
    { id: 'security', label: 'Безопасность', icon: Shield },
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
      
      case 'emails':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Почтовая система</h2>
              <p className="text-gray-400">Управление почтовыми сервисами и настройками</p>
            </div>
            <Card className="bg-black/40 border-gray-800">
              <CardContent className="p-6">
                <p className="text-gray-400">Настройки почтовой системы будут добавлены в следующих обновлениях.</p>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'mail-server':
        return <MailServerSettings />;
      
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Настройки почтового сервера</h2>
          <p className="text-gray-400">Настройка SMTP и IMAP серверов для системы LITIUM.SPACE</p>
        </div>
        <Card className="bg-black/40 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#b9ff6a] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Загрузка статуса собственного почтового сервера
  const { data: serverStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/mail-server/status'],
    refetchInterval: 5000, // Обновляем каждые 5 секунд
  });

  // Запуск собственного почтового сервера
  const startServerMutation = useMutation({
    mutationFn: async (port: number = 2525) => {
      return apiRequest('/api/admin/mail-server/start', {
        method: 'POST',
        body: JSON.stringify({ port }),
        headers: { 'Content-Type': 'application/json' }
      });
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

  // Остановка собственного почтового сервера
  const stopServerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/mail-server/stop', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      });
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
              <li>• Адрес сервера: mail.litium.space:2525</li>
              <li>• Поддержка SSL/TLS: Да</li>
              <li>• Аутентификация: Обязательная</li>
              <li>• Максимальный размер письма: 10 МБ</li>
              <li>• Домены: @litium.space</li>
            </ul>
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