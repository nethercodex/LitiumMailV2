import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Mail, Plus, Search, Inbox, Send, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import EmailList from "@/components/email-list";
import EmailViewer from "@/components/email-viewer";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { EmailWithDetails } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'inbox' | 'sent'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: emails, isLoading: emailsLoading, error } = useQuery({
    queryKey: [currentView === 'inbox' ? '/api/emails/inbox' : '/api/emails/sent'],
    enabled: !!user,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const filteredEmails = emails?.filter((email: EmailWithDetails) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(query) ||
      email.sender.email?.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto pulse-glow">
            <Mail className="text-dark h-6 w-6" />
          </div>
          <p className="text-text-muted">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="border-b border-surface bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Mail className="text-dark h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-primary">LITIUM.SPACE</span>
          </div>
          
          <div className="flex items-center space-x-4 max-w-md flex-1 mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-4 w-4" />
              <Input
                placeholder="Поиск писем..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface border-surface-lighter"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/compose">
              <Button className="bg-primary text-dark hover:bg-primary/80 btn-hover-lift glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Написать
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-muted">
                {user?.firstName || user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="btn-hover-scale">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          selectedEmailId={selectedEmailId}
          onEmailSelect={setSelectedEmailId}
        />

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-80 border-r border-surface bg-surface/30">
            <div className="p-4 border-b border-surface">
              <h2 className="font-semibold flex items-center">
                {currentView === 'inbox' ? (
                  <>
                    <Inbox className="mr-2 h-4 w-4" />
                    Входящие
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Отправленные
                  </>
                )}
                {!emailsLoading && (
                  <span className="ml-2 text-sm text-text-muted">
                    ({filteredEmails.length})
                  </span>
                )}
              </h2>
            </div>
            
            <EmailList
              emails={filteredEmails}
              selectedEmailId={selectedEmailId}
              onEmailSelect={setSelectedEmailId}
              isLoading={emailsLoading}
            />
          </div>

          {/* Email Viewer */}
          <div className="flex-1">
            {selectedEmailId ? (
              <EmailViewer 
                emailId={selectedEmailId} 
                onClose={() => setSelectedEmailId(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mail className="h-16 w-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Выберите письмо</h3>
                  <p className="text-text-muted">
                    Выберите письмо из списка, чтобы прочитать его
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
