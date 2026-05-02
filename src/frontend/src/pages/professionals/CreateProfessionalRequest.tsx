import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Send, AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { createProfessionalRequest } from "@/lib/professionals-api";
import { getUser } from "@/lib/auth";

const MAX_SKILLS = 10;

const CreateProfessionalRequest = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [biography, setBiography] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.length >= MAX_SKILLS) { setError(`São permitidas no máximo ${MAX_SKILLS} skills.`); return; }
    if (skills.includes(trimmed)) { setSkillInput(""); return; }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
    setError("");
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(""); setSuccess("");
    if (!user?.id) { setError("Não foi possível identificar o usuário autenticado."); return; }
    const bio = biography.trim();
    const spec = specialization.trim();
    if (!bio) { setError("A biografia é obrigatória."); return; }
    if (bio.length > 6000) { setError("A biografia deve ter no máximo 6000 caracteres."); return; }
    if (!spec) { setError("A especialização é obrigatória."); return; }
    if (spec.length > 5000) { setError("A especialização deve ter no máximo 5000 caracteres."); return; }
    if (skills.length === 0) { setError("Informe ao menos uma skill."); return; }

    setSaving(true);
    try {
      const res = await createProfessionalRequest({ userId: user.id, biography: bio, specialization: spec, skills });
      if (!res.success) throw new Error(res.message || "Falha ao enviar solicitação.");
      setSuccess("Solicitação enviada com sucesso! Um administrador irá analisá-la em breve.");
      setTimeout(() => navigate("/profissionais"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />
      <main className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Link to="/profissionais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Profissionais
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-1">Solicitar Acesso como Profissional</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Preencha as informações abaixo. Após o envio, um administrador irá avaliar sua solicitação.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1.5">Especialização <span className="text-destructive">*</span></span>
              <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Ex: Nutricionista esportivo, Personal Trainer..." disabled={saving} maxLength={5000}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60" />
              <span className="text-xs text-muted-foreground mt-1 block text-right">{specialization.length}/5000</span>
            </label>

            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1.5">Biografia <span className="text-destructive">*</span></span>
              <textarea value={biography} onChange={(e) => setBiography(e.target.value)}
                placeholder="Descreva sua experiência, formação e área de atuação..." disabled={saving} maxLength={6000} rows={6}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60 resize-none" />
              <span className="text-xs text-muted-foreground mt-1 block text-right">{biography.length}/6000</span>
            </label>

            <div>
              <span className="block text-xs text-muted-foreground mb-1.5">
                Competências / Skills <span className="text-destructive">*</span>
                <span className="ml-2 text-muted-foreground/60">(máx. {MAX_SKILLS})</span>
              </span>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} disabled={saving} className="hover:text-destructive transition-colors disabled:opacity-50">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {skills.length < MAX_SKILLS && (
                <div className="flex gap-2">
                  <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                    placeholder="Digite uma skill e pressione Enter" disabled={saving}
                    className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all disabled:opacity-60" />
                  <button type="button" onClick={addSkill} disabled={!skillInput.trim() || saving}
                    className="px-4 py-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{skills.length}/{MAX_SKILLS} skills adicionadas</p>
            </div>

            {error && !success && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" /><span>{success}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving || !!success}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
                style={{ background: "var(--gradient-primary)" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {saving ? "Enviando..." : "Enviar solicitação"}
              </button>
              <Link to="/profissionais" className="px-5 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProfessionalRequest;
