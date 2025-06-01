import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  Play, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  Table,
  BarChart3,
  Clock,
  HardDrive,
  Activity,
  Users,
  Mail
} from "lucide-react";

interface DatabaseStats {
  totalSize: string;
  tableCount: number;
  connectionCount: number;
  uptime: string;
  queryStats: {
    totalQueries: number;
    slowQueries: number;
    avgQueryTime: number;
  };
}

interface TableInfo {
  tableName: string;
  rowCount: number;
  size: string;
  lastUpdated: string;
}

interface BackupInfo {
  id: string;
  fileName: string;
  size: string;
  createdAt: string;
  type: 'full' | 'incremental';
}

export default function DatabaseAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [showQueryResult, setShowQueryResult] = useState(false);

  // Загрузка статистики базы данных
  const { data: dbStats, isLoading: statsLoading } = useQuery<DatabaseStats>({
    queryKey: ["/api/admin/database/stats"],
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Загрузка информации о таблицах
  const { data: tables, isLoading: tablesLoading } = useQuery<TableInfo[]>({
    queryKey: ["/api/admin/database/tables"],
    refetchInterval: 60000, // Обновляем каждую минуту
  });

  // Загрузка списка резервных копий
  const { data: backups, isLoading: backupsLoading } = useQuery<BackupInfo[]>({
    queryKey: ["/api/admin/database/backups"],
  });

  // Выполнение SQL запроса
  const executeSqlMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest('POST', '/api/admin/database/execute', { query });
    },
    onSuccess: (data) => {
      setQueryResult(data);
      setShowQueryResult(true);
      toast({
        title: "Запрос выполнен",
        description: "SQL запрос успешно выполнен",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка выполнения",
        description: error.message || "Не удалось выполнить SQL запрос",
        variant: "destructive",
      });
    },
  });

  // Создание резервной копии
  const createBackupMutation = useMutation({
    mutationFn: async (type: 'full' | 'incremental') => {
      return apiRequest('POST', '/api/admin/database/backup', { type });
    },
    onSuccess: () => {
      toast({
        title: "Резервная копия создана",
        description: "Резервная копия базы данных успешно создана",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/database/backups"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка создания резервной копии",
        description: error.message || "Не удалось создать резервную копию",
        variant: "destructive",
      });
    },
  });

  // Восстановление из резервной копии
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return apiRequest('POST', '/api/admin/database/restore', { backupId });
    },
    onSuccess: () => {
      toast({
        title: "База данных восстановлена",
        description: "База данных успешно восстановлена из резервной копии",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/database/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/database/tables"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка восстановления",
        description: error.message || "Не удалось восстановить базу данных",
        variant: "destructive",
      });
    },
  });

  // Удаление резервной копии
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return apiRequest('DELETE', `/api/admin/database/backups/${backupId}`);
    },
    onSuccess: () => {
      toast({
        title: "Резервная копия удалена",
        description: "Резервная копия успешно удалена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/database/backups"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить резервную копию",
        variant: "destructive",
      });
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Пустой запрос",
        description: "Введите SQL запрос для выполнения",
        variant: "destructive",
      });
      return;
    }
    executeSqlMutation.mutate(sqlQuery);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-[#b9ff6a]" />
          <h1 className="text-2xl font-bold text-white">Управление базой данных</h1>
        </div>
        
        <Button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/database/stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/database/tables"] });
          }}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </Button>
      </div>

      {/* Статистика базы данных */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Размер БД
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dbStats?.totalSize || '0 MB'}
            </div>
            <div className="text-xs text-gray-400">
              PostgreSQL
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Table className="w-4 h-4" />
              Таблицы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dbStats?.tableCount || 0}
            </div>
            <div className="text-xs text-gray-400">
              Активные таблицы
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Соединения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dbStats?.connectionCount || 0}
            </div>
            <div className="text-xs text-gray-400">
              Активные подключения
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
            <div className="text-2xl font-bold text-white">
              {dbStats?.uptime || '0ч'}
            </div>
            <div className="text-xs text-gray-400">
              Непрерывная работа
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика запросов */}
      {dbStats?.queryStats && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#b9ff6a]" />
              Статистика запросов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {dbStats.queryStats.totalQueries.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Всего запросов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {dbStats.queryStats.slowQueries}
                </div>
                <div className="text-sm text-gray-400">Медленные запросы</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#b9ff6a]">
                  {dbStats.queryStats.avgQueryTime}мс
                </div>
                <div className="text-sm text-gray-400">Среднее время</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информация о таблицах */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-[#b9ff6a]" />
            Таблицы базы данных
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tablesLoading ? (
            <div className="text-center py-8 text-gray-400">
              Загрузка информации о таблицах...
            </div>
          ) : tables && tables.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Таблица</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Записей</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Размер</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Обновлена</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {table.tableName === 'users' && <Users className="w-4 h-4 text-[#b9ff6a]" />}
                          {table.tableName === 'emails' && <Mail className="w-4 h-4 text-[#b9ff6a]" />}
                          {table.tableName === 'sessions' && <Activity className="w-4 h-4 text-[#b9ff6a]" />}
                          {!['users', 'emails', 'sessions'].includes(table.tableName) && <Table className="w-4 h-4 text-gray-400" />}
                          <span className="text-white font-medium">{table.tableName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {table.rowCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {table.size}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(table.lastUpdated).toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Таблицы не найдены
            </div>
          )}
        </CardContent>
      </Card>

      {/* SQL запросы */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-[#b9ff6a]" />
            Выполнение SQL запросов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-yellow-400 font-medium mb-1">Внимание!</h5>
                <p className="text-sm text-yellow-200/80">
                  Будьте осторожны при выполнении SQL запросов. Неправильные запросы могут повредить данные.
                  Рекомендуется создать резервную копию перед выполнением изменяющих запросов.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sqlQuery" className="text-gray-300">
              SQL Запрос
            </Label>
            <Textarea
              id="sqlQuery"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Введите SQL запрос (например: SELECT * FROM users LIMIT 10;)"
              className="bg-gray-900/50 border-gray-700 text-white focus:border-[#b9ff6a] min-h-[120px] font-mono"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Поддерживаются SELECT, INSERT, UPDATE, DELETE запросы
            </div>
            <Button
              onClick={handleExecuteQuery}
              disabled={executeSqlMutation.isPending}
              className="bg-[#b9ff6a] hover:bg-[#a0e055] text-black font-medium"
            >
              {executeSqlMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Выполнение...
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Выполнить
                </>
              )}
            </Button>
          </div>

          {/* Результат запроса */}
          {showQueryResult && queryResult && (
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#b9ff6a]" />
                  Результат выполнения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-gray-300 bg-gray-900/50 p-4 rounded border overflow-auto max-h-64">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Резервные копии */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#b9ff6a]" />
            Резервные копии
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => createBackupMutation.mutate('incremental')}
              disabled={createBackupMutation.isPending}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:border-[#b9ff6a] hover:text-[#b9ff6a]"
            >
              Инкрементальная
            </Button>
            <Button
              onClick={() => createBackupMutation.mutate('full')}
              disabled={createBackupMutation.isPending}
              className="bg-[#b9ff6a] hover:bg-[#a0e055] text-black"
            >
              {createBackupMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Создание...
                </div>
              ) : (
                'Полная копия'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {backupsLoading ? (
            <div className="text-center py-8 text-gray-400">
              Загрузка резервных копий...
            </div>
          ) : backups && backups.length > 0 ? (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-white font-medium">{backup.fileName}</div>
                      <Badge className={backup.type === 'full' ? 'bg-[#b9ff6a]/20 text-[#b9ff6a] border-[#b9ff6a]/40' : 'bg-gray-600/20 text-gray-300 border-gray-600/40'}>
                        {backup.type === 'full' ? 'Полная' : 'Инкрементальная'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Размер: {backup.size} • Создана: {new Date(backup.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => restoreBackupMutation.mutate(backup.id)}
                      disabled={restoreBackupMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:border-[#b9ff6a] hover:text-[#b9ff6a]"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Восстановить
                    </Button>
                    <Button
                      onClick={() => deleteBackupMutation.mutate(backup.id)}
                      disabled={deleteBackupMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:border-red-500 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Резервные копии не найдены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}