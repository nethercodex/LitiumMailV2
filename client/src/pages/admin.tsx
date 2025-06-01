import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Mail, Settings, Users, BarChart3, Shield, ArrowLeft, Database, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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

    if (!isLoading && user && user.role !== 'admin' && user.role !== 'support') {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав доступа к админ-панели.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto pulse-glow">
            <Settings className="text-dark h-6 w-6" />
          </div>
          <p className="text-text-muted">Загрузка админ-панели...</p>
        </div>
      </div>
    );
  }

  if (!user || user.id !== 'admin') return null;

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="border-b border-surface bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-surface/50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="text-dark h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-primary">LITIUM.SPACE</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1">
              ADMIN
            </Badge>
            <h1 className="text-lg font-semibold text-white">Панель администратора</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface border-surface-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Всего пользователей</p>
                  <p className="text-2xl font-bold text-white">1,234</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-green-400">+12%</span>
                <span className="text-xs text-text-muted ml-2">за месяц</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Активных пользователей</p>
                  <p className="text-2xl font-bold text-white">856</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-green-400">+8%</span>
                <span className="text-xs text-text-muted ml-2">за неделю</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Отправлено писем</p>
                  <p className="text-2xl font-bold text-white">12,456</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-green-400">+24%</span>
                <span className="text-xs text-text-muted ml-2">за день</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Использовано места</p>
                  <p className="text-2xl font-bold text-white">67%</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-orange-400">+3%</span>
                <span className="text-xs text-text-muted ml-2">за день</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Управление пользователями */}
          <Card className="bg-surface border-surface-lighter">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="w-5 h-5 text-primary" />
                <span>Управление пользователями</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button className="w-full justify-start bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">
                  <Users className="w-4 h-4 mr-2" />
                  Список всех пользователей
                </Button>
                
                <Button className="w-full justify-start bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Модерация аккаунтов
                </Button>
                
                <Button className="w-full justify-start bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Статистика пользователей
                </Button>
              </div>

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary font-medium mb-2">Быстрые действия:</p>
                <ul className="text-xs text-text-muted space-y-1">
                  <li>• Заблокировать пользователя</li>
                  <li>• Сбросить пароль</li>
                  <li>• Изменить тарифный план</li>
                  <li>• Отправить уведомление</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Системные настройки */}
          <Card className="bg-surface border-surface-lighter">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Settings className="w-5 h-5 text-primary" />
                <span>Системные настройки</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button className="w-full justify-start bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20">
                  <Database className="w-4 h-4 mr-2" />
                  Управление базой данных
                </Button>
                
                <Button className="w-full justify-start bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Настройки безопасности
                </Button>
                
                <Button className="w-full justify-start bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20">
                  <Activity className="w-4 h-4 mr-2" />
                  Мониторинг системы
                </Button>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-300 font-medium mb-2">Статус системы:</p>
                <ul className="text-xs text-text-muted space-y-1">
                  <li>• Сервер: Работает стабильно</li>
                  <li>• База данных: Активна</li>
                  <li>• Почтовая служба: Онлайн</li>
                  <li>• Резервное копирование: Включено</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Логи и мониторинг */}
          <Card className="bg-surface border-surface-lighter lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Последние события</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-surface-lighter">
                  <div>
                    <p className="text-sm text-white">Новый пользователь зарегистрирован</p>
                    <p className="text-xs text-text-muted">support@litium.space • 2 минуты назад</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Регистрация
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-surface-lighter">
                  <div>
                    <p className="text-sm text-white">Обновление системы безопасности</p>
                    <p className="text-xs text-text-muted">Система • 15 минут назад</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Система
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-surface-lighter">
                  <div>
                    <p className="text-sm text-white">Резервное копирование завершено</p>
                    <p className="text-xs text-text-muted">Система • 1 час назад</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Бэкап
                  </Badge>
                </div>
              </div>

              <Button className="w-full mt-4 bg-primary text-dark hover:bg-primary/90 font-medium">
                Просмотреть все логи
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}