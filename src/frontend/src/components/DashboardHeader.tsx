import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, Utensils, Dumbbell, Users, Trophy, Menu, X, LogOut, User } from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";

const navItems = [
  { label: "Home", icon: Home, href: "/", active: true },
  { label: "Dieta", icon: Utensils, href: "/dieta" },
  { label: "Treinos", icon: Dumbbell, href: "/treinos" },
  { label: "Profissionais", icon: Users, href: "/profissionais" },
  { label: "Desafios", icon: Trophy, href: "/desafios" },
];

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileWrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const user = getUser();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Usuário";
  const firstName = displayName.split(" ")[0];

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // Fecha ao clicar fora
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        profileWrapperRef.current &&
        !profileWrapperRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setProfileOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setProfileOpen(false), 180);
  };

  return (
    <header className="w-full max-w-6xl mx-auto mb-8">
      <div className="flex items-center justify-between py-4 border-b border-border">
        <h1 className="text-xl md:text-2xl font-semibold">
          Olá, <span className="gradient-text">{firstName}</span>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2
                ${item.active
                  ? "text-foreground after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-accent"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Avatar + Dropdown (hover + click) */}
          <div
            ref={profileWrapperRef}
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-3 group cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="hidden sm:block text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {displayName}
              </span>
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt={displayName}
                className="w-10 h-10 rounded-full ring-2 ring-border group-hover:ring-primary transition-all duration-300"
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 pt-2 z-50"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                <div className="glass-card rounded-xl p-2 min-w-[220px] animate-scale-in shadow-lg">
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/perfil"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
                  >
                    <User size={16} />
                    Perfil
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden glass-card rounded-xl mt-3 p-3 animate-fade-in">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all
                ${item.active
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default DashboardHeader;
