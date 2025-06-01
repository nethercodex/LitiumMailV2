import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { registerSchema, loginSchema, type RegisterData, type LoginData } from "@shared/schema";
import { Zap, Mail, Server, Check, User, Lock, Crown } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      plan: "basic",
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Ошибка регистрации");
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Аккаунт создан",
        description: "Добро пожаловать в LITIUM.SPACE!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Ошибка входа");
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать обратно!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const plans = [
    {
      id: "basic",
      name: "Базовый",
      price: "Бесплатно",
      icon: Mail,
      features: ["1 GB хранилище", "100 писем в день", "Базовая поддержка"],
      color: "gray",
    },
    {
      id: "pro",
      name: "Профессиональный",
      price: "499₽/мес",
      icon: Zap,
      features: ["25 GB хранилище", "Неограниченные письма", "Приоритетная поддержка", "Пользовательские домены"],
      color: "primary",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Корпоративный",
      price: "1499₽/мес",
      icon: Server,
      features: ["100 GB хранилище", "Неограниченные письма", "Административная панель", "24/7 поддержка"],
      color: "violet",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-surface-lighter">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            LITIUM.SPACE
          </DialogTitle>
        </DialogHeader>

        <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-surface">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-dark">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-dark">
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-6">
            <Card className="bg-surface border-surface-lighter">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Вход в аккаунт</span>
                </CardTitle>
                <CardDescription>
                  Введите данные для входа в ваш аккаунт LITIUM.SPACE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="username"
                      {...loginForm.register("username")}
                      className="bg-background border-surface-lighter"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Введите пароль"
                      {...loginForm.register("password")}
                      className="bg-background border-surface-lighter"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-dark hover:bg-primary/80 font-semibold"
                    disabled={loginMutation.isPending}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {loginMutation.isPending ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            <Card className="bg-surface border-surface-lighter">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span>Создание аккаунта</span>
                </CardTitle>
                <CardDescription>
                  Выберите тариф и создайте свой аккаунт в LITIUM.SPACE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  {/* Plan Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Выберите тариф</Label>
                    <RadioGroup
                      value={registerForm.watch("plan")}
                      onValueChange={(value) => registerForm.setValue("plan", value as "basic" | "pro" | "enterprise")}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                          <div key={plan.id} className="relative">
                            {plan.popular && (
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                                <span className="bg-primary text-dark px-3 py-1 rounded-full text-xs font-bold">
                                  🔥 Популярный
                                </span>
                              </div>
                            )}
                            <Label htmlFor={plan.id} className="cursor-pointer">
                              <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                              <Card className={`transition-all hover:scale-105 ${
                                registerForm.watch("plan") === plan.id 
                                  ? "border-primary bg-primary/5" 
                                  : "border-surface-lighter hover:border-primary/50"
                              } ${plan.popular ? "mt-4" : ""}`}>
                                <CardContent className="p-4 text-center">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                                    plan.color === "primary" ? "bg-primary/20" :
                                    plan.color === "violet" ? "bg-violet-500/20" : "bg-gray-500/20"
                                  }`}>
                                    <Icon className={`h-6 w-6 ${
                                      plan.color === "primary" ? "text-primary" :
                                      plan.color === "violet" ? "text-violet-400" : "text-gray-400"
                                    }`} />
                                  </div>
                                  <h3 className="font-bold mb-1">{plan.name}</h3>
                                  <p className={`text-lg font-bold mb-3 ${
                                    plan.color === "primary" ? "text-primary" :
                                    plan.color === "violet" ? "text-violet-400" : "text-gray-400"
                                  }`}>{plan.price}</p>
                                  <ul className="space-y-1">
                                    {plan.features.map((feature, index) => (
                                      <li key={index} className="flex items-center text-xs">
                                        <Check className="h-3 w-3 text-green-400 mr-1 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* User Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        placeholder="Введите имя"
                        {...registerForm.register("firstName")}
                        className="bg-background border-surface-lighter"
                      />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-sm text-red-400">{registerForm.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        placeholder="Введите фамилию"
                        {...registerForm.register("lastName")}
                        className="bg-background border-surface-lighter"
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-sm text-red-400">{registerForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <div className="flex">
                      <Input
                        id="username"
                        placeholder="username"
                        {...registerForm.register("username")}
                        className="bg-background border-surface-lighter rounded-r-none"
                      />
                      <div className="bg-surface border border-l-0 border-surface-lighter px-3 py-2 rounded-r-md text-text-muted text-sm flex items-center">
                        @litium.space
                      </div>
                    </div>
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Создайте пароль"
                      {...registerForm.register("password")}
                      className="bg-background border-surface-lighter"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-dark hover:bg-primary/80 font-semibold"
                    disabled={registerMutation.isPending}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    {registerMutation.isPending ? "Создание аккаунта..." : "Создать аккаунт"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}