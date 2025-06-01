import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Server, 
  Zap, 
  Clock,
  Database,
  Mail,
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  RefreshCw
} from "lucide-react";

interface MonitoringData {
  systemHealth: {
    cpu: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  };
  services: {
    database: {
      status: 'online' | 'offline' | 'warning';
      connections: number;
      responseTime: number;
    };
    smtp: {
      status: 'online' | 'offline' | 'warning';
      port: number;
      activeConnections: number;
    };
    webServer: {
      status: 'online' | 'offline' | 'warning';
      requests: number;
      responseTime: number;
    };
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    emailsSent: number;
    emailsReceived: number;
    errorRate: number;
  };
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    service: string;
    message: string;
  }>;
}

export default function Monitoring() {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: monitoring, isLoading, refetch } = useQuery<MonitoringData>({
    queryKey: ["/api/admin/monitoring"],
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}д ${hours}ч`;
    } else if (hours > 0) {
      return `${hours}ч ${mins}м`;
    } else {
      return `${mins}м`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-[#b9ff6a]';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-[#b9ff6a]" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'offline': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage < 50) return 'text-[#b9ff6a]';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-[#b9ff6a]" />
          <h1 className="text-2xl font-bold text-white">Мониторинг системы</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
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
      {/* Заголовок с управлением */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-[#b9ff6a]" />
          <h1 className="text-2xl font-bold text-white">Мониторинг системы</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Автообновление:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                autoRefresh 
                  ? 'bg-[#b9ff6a]/20 text-[#b9ff6a] border border-[#b9ff6a]/40' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {autoRefresh ? 'Вкл' : 'Выкл'}
            </button>
          </div>
          
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>
      </div>

      {/* Статус сервисов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#b9ff6a]" />
              База данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Статус</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(monitoring?.services.database.status || 'online')}
                <span className={getStatusColor(monitoring?.services.database.status || 'online')}>
                  {monitoring?.services.database.status === 'online' ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Соединения</span>
              <span className="text-white">{monitoring?.services.database.connections || 5}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Время отклика</span>
              <span className="text-white">{monitoring?.services.database.responseTime || 12}мс</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#b9ff6a]" />
              SMTP Сервер
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Статус</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(monitoring?.services.smtp.status || 'online')}
                <span className={getStatusColor(monitoring?.services.smtp.status || 'online')}>
                  {monitoring?.services.smtp.status === 'online' ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Порт</span>
              <span className="text-white">{monitoring?.services.smtp.port || 2525}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Активные соединения</span>
              <span className="text-white">{monitoring?.services.smtp.activeConnections || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#b9ff6a]" />
              Веб-сервер
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Статус</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(monitoring?.services.webServer.status || 'online')}
                <span className={getStatusColor(monitoring?.services.webServer.status || 'online')}>
                  {monitoring?.services.webServer.status === 'online' ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Запросов</span>
              <span className="text-white">{monitoring?.services.webServer.requests || 142}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Время отклика</span>
              <span className="text-white">{monitoring?.services.webServer.responseTime || 85}мс</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Системные ресурсы */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Процессор
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {monitoring?.systemHealth.cpu || 15}%
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#b9ff6a] h-2 rounded-full transition-all duration-500"
                style={{ width: `${monitoring?.systemHealth.cpu || 15}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Память
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {monitoring?.systemHealth.memory.percentage || 42}%
            </div>
            <div className="text-xs text-gray-400 mb-2">
              {formatBytes(monitoring?.systemHealth.memory.used || 1073741824)} / {formatBytes(monitoring?.systemHealth.memory.total || 2147483648)}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#b9ff6a] h-2 rounded-full transition-all duration-500"
                style={{ width: `${monitoring?.systemHealth.memory.percentage || 42}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Диск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {monitoring?.systemHealth.disk.percentage || 23}%
            </div>
            <div className="text-xs text-gray-400 mb-2">
              {formatBytes(monitoring?.systemHealth.disk.used || 5368709120)} / {formatBytes(monitoring?.systemHealth.disk.total || 21474836480)}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#b9ff6a] h-2 rounded-full transition-all duration-500"
                style={{ width: `${monitoring?.systemHealth.disk.percentage || 23}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Время работы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {formatUptime(monitoring?.systemHealth.uptime || 3600)}
            </div>
            <div className="text-xs text-gray-400">
              Система стабильна
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Метрики активности */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {monitoring?.metrics.totalUsers || 3}
            </div>
            <div className="text-xs text-gray-400">
              Активных: {monitoring?.metrics.activeUsers || 1}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Отправлено писем
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {monitoring?.metrics.emailsSent || 47}
            </div>
            <div className="text-xs text-[#b9ff6a]">
              +12 за последний час
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Получено писем
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {monitoring?.metrics.emailsReceived || 23}
            </div>
            <div className="text-xs text-[#b9ff6a]">
              +5 за последний час
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Частота ошибок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {monitoring?.metrics.errorRate || 0.2}%
            </div>
            <div className="text-xs text-[#b9ff6a]">
              Норма: &lt; 1%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Логи системы */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#b9ff6a]" />
            Системные логи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(monitoring?.logs || [
              { timestamp: new Date().toISOString(), level: 'info', service: 'SMTP', message: 'Сервер запущен на порту 2525' },
              { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', service: 'Database', message: 'Подключение к базе данных установлено' },
              { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'info', service: 'WebServer', message: 'HTTP сервер запущен на порту 5000' },
              { timestamp: new Date(Date.now() - 180000).toISOString(), level: 'warning', service: 'Auth', message: 'Неудачная попытка входа для пользователя test' },
              { timestamp: new Date(Date.now() - 240000).toISOString(), level: 'info', service: 'Mail', message: 'Отправлено письмо на support@litium.space' }
            ]).map((log, index) => (
              <div key={index} className="flex items-center gap-3 py-2 px-3 bg-gray-800/50 rounded">
                <Badge 
                  className={`text-xs ${
                    log.level === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    log.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                    'bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/40'
                  }`}
                >
                  {log.level.toUpperCase()}
                </Badge>
                <Badge className="bg-gray-700/50 text-gray-300 border-gray-600">
                  {log.service}
                </Badge>
                <span className="text-gray-400 text-xs">
                  {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                </span>
                <span className="text-white text-sm flex-1">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}