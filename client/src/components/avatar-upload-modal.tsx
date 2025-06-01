import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  userInitials: string;
}

export default function AvatarUploadModal({ 
  isOpen, 
  onClose, 
  currentAvatarUrl, 
  userInitials 
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Аватар обновлен",
        description: "Ваш аватар успешно загружен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Неверный формат",
        description: "Поддерживаются только PNG, JPG и GIF файлы",
        variant: "destructive",
      });
      return;
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла: 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Создание превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-[#b9ff6a]/20 backdrop-blur-md max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#b9ff6a] text-xl">Загрузить аватар</DialogTitle>
          <DialogDescription className="text-gray-300">
            Выберите изображение для вашего профиля
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Текущий/новый аватар */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#b9ff6a]/50">
                <AvatarImage 
                  src={previewUrl || currentAvatarUrl || ''} 
                  alt="Предпросмотр аватара" 
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] text-black">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 bg-red-600 border-red-500 text-white hover:bg-red-700"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Загрузка файла */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="outline"
              className="w-full border-[#b9ff6a]/30 text-white hover:bg-[#b9ff6a]/10 hover:border-[#b9ff6a]/50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Выбрать файл
            </Button>

            <div className="text-sm text-gray-400 text-center">
              Поддерживаются форматы: PNG, JPG, GIF<br />
              Максимальный размер: 5MB
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-600 text-white hover:bg-gray-800"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#96d147] font-semibold"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                "Загружаем..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}