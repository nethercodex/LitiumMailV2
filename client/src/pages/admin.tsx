import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Mail, Settings, Users, BarChart3, Shield, ArrowLeft, Database, Activity, Home, Server, UserCog, MessageSquare, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');

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
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <p className="text-xs text-gray-400">+20.1% за месяц</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Отправлено писем</CardTitle>
                  <Mail className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">12,234</div>
                  <p className="text-xs text-gray-400">+180.1% за месяц</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Активность системы</CardTitle>
                  <BarChart3 className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">98.5%</div>
                  <p className="text-xs text-gray-400">+2.5% за неделю</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-[#b9ff6a]/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Серверов онлайн</CardTitle>
                  <Server className="h-4 w-4 text-[#b9ff6a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">4/4</div>
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
              <CardContent className="p-6">
                <p className="text-gray-400">Функции управления пользователями будут добавлены в следующих обновлениях.</p>
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
    </div>
  );
}