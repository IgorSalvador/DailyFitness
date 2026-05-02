import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearAuth, onSessionExpired, resetSessionExpiredFlag, startSessionWatcher } from "@/lib/auth";

/**
 * Escuta o evento global de sessão expirada e exibe um modal
 * informando o usuário, com botão para redirecioná-lo ao login.
 */
const SessionExpiredDialog = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stopWatcher = startSessionWatcher();
    const off = onSessionExpired(() => setOpen(true));
    return () => {
      off();
      stopWatcher();
    };
  }, []);

  const handleGoToLogin = () => {
    clearAuth();
    resetSessionExpiredFlag();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleGoToLogin()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Sessão expirada</DialogTitle>
          <DialogDescription className="text-center">
            Sua sessão expirou por inatividade ou tempo limite. Por favor, faça login
            novamente para continuar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <button
            type="button"
            onClick={handleGoToLogin}
            className="h-11 px-6 rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Ir para o login
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiredDialog;
