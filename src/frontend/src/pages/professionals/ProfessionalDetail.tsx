import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Mail, Briefcase, BookOpen, Tag } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { getProfessionalById, ProfessionalDto } from "@/lib/professionals-api";

const ProfessionalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [professional, setProfessional] = useState<ProfessionalDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) { setError("ID do profissional não informado."); setLoading(false); return; }
      setLoading(true); setError("");
      try {
        const res = await getProfessionalById(id);
        if (res.success && res.data) { setProfessional(res.data); }
        else { setError(res.message || "Profissional não encontrado."); }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar profissional.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fullName = professional ? `${professional.firstname} ${professional.surname}`.trim() : "";
  const initials = fullName.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Link to="/profissionais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Profissionais
        </Link>

        {loading && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Carregando profissional...</p>
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div><p className="font-medium">Profissional não encontrado</p><p className="opacity-90">{error}</p></div>
            </div>
          </div>
        )}

        {!loading && !error && professional && (
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
                {initials || "?"}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold truncate">{fullName || "—"}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />{professional.email}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <InfoSection icon={<Briefcase className="w-4 h-4" />} title="Especialização" content={professional.specialization || "Não informado"} />
            <InfoSection icon={<BookOpen className="w-4 h-4" />} title="Biografia" content={professional.biography || "Não informado"} multiline />

            {professional.skills && professional.skills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wide">Competências</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

interface InfoSectionProps { icon: React.ReactNode; title: string; content: string; multiline?: boolean; }

const InfoSection = ({ icon, title, content, multiline = false }: InfoSectionProps) => (
  <div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
      {icon}<span className="font-medium uppercase tracking-wide">{title}</span>
    </div>
    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
      <p className={`text-sm text-foreground ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}>{content}</p>
    </div>
  </div>
);

export default ProfessionalDetail;
