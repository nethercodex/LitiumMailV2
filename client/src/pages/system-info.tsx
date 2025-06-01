import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Info, 
  Package, 
  Server, 
  Database, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Globe
} from "lucide-react";

interface SystemInfo {
  version: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  dependencies: {
    [key: string]: {
      version: string;
      status: 'working' | 'error' | 'warning';
      description: string;
    };
  };
}

export default function SystemInfo() {
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: systemInfo, isLoading } = useQuery<SystemInfo>({
    queryKey: ["/api/admin/system-info"],
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${mins}м`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-4 h-4 text-[#b9ff6a]" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/40';
      case 'error':
        return 'bg-red-400/20 text-red-400 border-red-400/40';
      case 'warning':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/40';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-6 h-6 text-[#b9ff6a]" />
          <h1 className="text-2xl font-bold text-white">Информация о панели</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Info className="w-6 h-6 text-[#b9ff6a]" />
        <h1 className="text-2xl font-bold text-white">Информация о панели</h1>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#b9ff6a]" />
              Версия системы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">LITIUM.SPACE</span>
              <Badge className="bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/40">
                v{systemInfo?.version || '1.0.0'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node.js</span>
              <span className="text-white">{systemInfo?.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Платформа</span>
              <span className="text-white">{systemInfo?.platform}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#b9ff6a]" />
              Состояние сервера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Время работы</span>
              <span className="text-white">{systemInfo ? formatUptime(systemInfo.uptime) : '0д 0ч 0м'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Память (исп.)</span>
              <span className="text-white">{systemInfo ? formatBytes(systemInfo.memoryUsage.heapUsed) : '0 MB'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Память (всего)</span>
              <span className="text-white">{systemInfo ? formatBytes(systemInfo.memoryUsage.heapTotal) : '0 MB'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#b9ff6a]" />
              Текущее время
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#b9ff6a] mb-2">
                {systemTime.toLocaleTimeString('ru-RU')}
              </div>
              <div className="text-gray-400">
                {systemTime.toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Информация о разработке */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#b9ff6a]" />
            Информация о разработке
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Название проекта</span>
                <span className="text-white">LITIUM.SPACE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Разработчик</span>
                <span className="text-white">Команда LITIUM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Лицензия</span>
                <span className="text-white">MIT License</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Репозиторий</span>
                <a 
                  href="https://github.com/nethercodex/LitiumMail/tree/main" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  GitHub
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Разработчик</span>
                <a 
                  href="https://t.me/nethercode" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  NETHERCODE
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Телеграм</span>
                <a 
                  href="https://t.me/nethercode" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  @nethercode
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Состояние зависимостей */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#b9ff6a]" />
            Состояние библиотек
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemInfo?.dependencies ? Object.entries(systemInfo.dependencies).map(([name, info]) => (
              <div key={name} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{name}</span>
                  {getStatusIcon(info.status)}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">v{info.version}</span>
                  <Badge className={getStatusColor(info.status)}>
                    {info.status === 'working' ? 'Работает' : 
                     info.status === 'error' ? 'Ошибка' : 'Предупреждение'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{info.description}</p>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                Загрузка информации о библиотеках...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Системные возможности */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#b9ff6a]" />
            Возможности системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
              <Mail className="w-8 h-8 text-[#b9ff6a] mx-auto mb-2" />
              <div className="font-medium text-white mb-1">SMTP Сервер</div>
              <div className="text-xs text-gray-400">Собственный почтовый сервер</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
              <Database className="w-8 h-8 text-[#b9ff6a] mx-auto mb-2" />
              <div className="font-medium text-white mb-1">PostgreSQL</div>
              <div className="text-xs text-gray-400">Надежная база данных</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
              <Shield className="w-8 h-8 text-[#b9ff6a] mx-auto mb-2" />
              <div className="font-medium text-white mb-1">Безопасность</div>
              <div className="text-xs text-gray-400">OAuth и сессии</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
              <Server className="w-8 h-8 text-[#b9ff6a] mx-auto mb-2" />
              <div className="font-medium text-white mb-1">API</div>
              <div className="text-xs text-gray-400">RESTful интерфейс</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}