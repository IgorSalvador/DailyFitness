import { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Home, Utensils, Dumbbell, Users, Trophy, Menu, X,
  LogOut, User, ClipboardList, ShieldCheck, ChevronDown,
  Sparkles, LucideIcon,
} from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface NavDropdownConfig {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

// ── Itens de navegação ────────────────────────────────────────────────────────

const baseNavItems: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Dieta", icon: Utensils, href: "/dieta" },
  { label: "Treinos", icon: Dumbbell, href: "/treinos" },
  { label: "Profissionais", icon: Users, href: "/profissionais" },
  { label: "Desafios", icon: Trophy, href: "/desafios" },
];

const adminDropdown: NavDropdownConfig = {
  label: "Painel Admin",
  icon: ShieldCheck,
  items: [
    { label: "Solicitações", icon: ClipboardList, href: "/profissionais/admin/solicitacoes" },
    { label: "Desafios", icon: Trophy, href: "/desafios/admin" },
  ],
};

const professionalDropdown: NavDropdownConfig = {
  label: "Área Pro",
  icon: Sparkles,
  items: [
    { label: "Meus Desafios", icon: Trophy, href: "/desafios/profissional" },
  ],
};

// ── Componente de dropdown de nav ─────────────────────────────────────────────

const NavDropdown = ({ config, location }: { config: NavDropdownConfig; location: ReturnType<typeof useLocation> }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const Icon = config.icon;

  const isGroupActive = config.items.some((item) =>
    location.pathname.startsWith(item.href)
  );

  const openDropdown = () => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    setOpen(true);
  };

  const scheduleClose = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2
          ${isGroupActive
            ? "text-foreground after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-accent"
            : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <Icon size={16} />
        {config.label}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full pt-2 z-50"
          onMouseEnter={openDropdown}
          onMouseLeave={scheduleClose}
        >
          <div className="glass-card rounded-xl p-1.5 min-w-[200px] animate-scale-in shadow-lg border border-border">
            {/* Cabeçalho decorativo */}
            <div className="px-3 py-2 mb-1 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon size={13} className="text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {config.label}
                </span>
              </div>
            </div>

            {config.items.map((item) => {
              const ItemIcon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all
                    ${isActive
                      ? "text-foreground bg-secondary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <ItemIcon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── DashboardHeader ───────────────────────────────────────────────────────────

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileWrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const user = getUser();
  const isAdmin = user?.role === "Administrator";
  const isProfessional = user?.role === "Professional";
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Usuário";
  const firstName = displayName.split(" ")[0];

  const roleDropdown = isAdmin ? adminDropdown : isProfessional ? professionalDropdown : null;

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileWrapperRef.current && !profileWrapperRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openMenu = () => {
    if (closeTimerRef.current) { window.clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
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
          {baseNavItems.map((item) => {
            const isActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2
                  ${isActive
                    ? "text-foreground after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-accent"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}

          {/* Dropdown de papel (Admin / Professional) */}
          {roleDropdown && (
            <NavDropdown config={roleDropdown} location={location} />
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Avatar + Dropdown de perfil */}
          <div ref={profileWrapperRef} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
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
              <div role="menu" className="absolute right-0 top-12 pt-2 z-50" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
                <div className="glass-card rounded-xl p-2 min-w-[220px] animate-scale-in shadow-lg">
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                    {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                  </div>
                  <Link
                    to="/perfil"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
                  >
                    <User size={16} /> Perfil
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botão do menu mobile */}
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
          {baseNavItems.map((item) => {
            const isActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all
                  ${isActive ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {/* Seção de papel no mobile */}
          {roleDropdown && (
            <>
              <div className="mt-2 mb-1 border-t border-border" />
              <button
                type="button"
                onClick={() => setMobileDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg text-primary hover:bg-secondary transition-all"
              >
                <span className="flex items-center gap-3">
                  <roleDropdown.icon size={18} />
                  {roleDropdown.label}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {mobileDropdownOpen && (
                <div className="pl-4">
                  {roleDropdown.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => { setMobileMenuOpen(false); setMobileDropdownOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all
                          ${isActive ? "text-foreground bg-secondary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                      >
                        <ItemIcon size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default DashboardHeader;
