import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Footer from './components/Footer';

type PerguntasResponse = { perguntas: string[] };
const API_BASE = '/api';

function LoadingOverlay({ visible, text }: { visible: boolean; text: string }) {
  if (!visible) return null;
  return (
    <div className="overlay" role="status" aria-live="polite">
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div className="spinner" />
        <div style={{ marginTop: 12 }}>{text}</div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    
      <section className="hero">
        <div className="hero-inner container" style={{ display: 'flex', alignItems: 'center' }}>

          <div className="hero-left">

            {/* TÍTULO */}
            <h1 className="hero-title" style={{ lineHeight: 1.12 }}>
              Gerador de Currículo com IA
            </h1>

            {/* SUBTÍTULO */}
            <p className="hero-sub" style={{ maxWidth: 520 }}>
              Transforme suas respostas em um currículo profissional pronto para ATS em minutos.
              Otimização automática, layout limpo e exportação em PDF.
            </p>

            {/* BOTÃO */}
            <div className="hero-cta">
              <button className="btn" onClick={() => navigate('/perguntas')}>
                Começar agora
              </button>
            </div>

            {/* FEATURES */}
            <div style={{ marginTop: 22 }}>
              <div id="features" className="features">

                {/* Card 1 */}
                <div className="feature-card feature-hover">
                  <div className="feature-icon">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="feature-title">Rápido</div>
                    <div className="feature-desc">Geração em minutos usando prompts otimizados.</div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="feature-card feature-hover">
                  <div className="feature-icon">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 11l19-9-9 19-2-8-8-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="feature-title">Profissional</div>
                    <div className="feature-desc">Formato compatível com processos seletivos e ATS.</div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="feature-card feature-hover">
                  <div className="feature-icon">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 20h9" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16.5 3h-9A2.5 2.5 0 005 5.5v13A1.5 1.5 0 006.5 20H12" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 7h8M8 11h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="feature-title">Exportável</div>
                    <div className="feature-desc">Exporte em PDF mantendo a formatação.</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>
  );
}

function Perguntas() {
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perguntas, setPerguntas] = useState<string[]>([]);
  const navigate = useNavigate();

  async function fetchPerguntas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/llm/gerar-perguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaAtuacao: area })
      });

      if (!res.ok) throw new Error(`Falha ao obter perguntas: ${res.status} ${res.statusText}`);
      const txt = await res.text();
      const data = JSON.parse(txt) as PerguntasResponse;
      setPerguntas(data.perguntas ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-wrapper">
      <div className="modal-box">
        <div className="container">
          <LoadingOverlay visible={loading} text="Gerando perguntas com IA..." />
          <div className="card card-accent">
            <h2 className="section-title">Área de atuação</h2>
            <input
              className="input"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex.: Desenvolvedor Back-End"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={fetchPerguntas} disabled={loading}>
                {loading ? 'Gerando...' : 'Gerar perguntas'}
              </button>
              <Link className="btn secondary" to="/">Voltar</Link>
            </div>
            {error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
          </div>

          {perguntas.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="section-title">Perguntas</h3>
              <ol style={{ marginTop: 12 }}>
                {perguntas.map((p, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{p}</li>
                ))}
              </ol>
              <button className="btn" onClick={() => navigate('/respostas', { state: { perguntas, area } })}>Responder</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Respostas() {
  const [state] = useState<any>(() => window.history.state?.usr || {});
  const perguntas: string[] = state?.perguntas || [];
  const area: string = state?.area || '';

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [cidade, setCidade] = useState('');
  const [linksRaw, setLinksRaw] = useState('');
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  const links = useMemo(() => linksRaw.split(/\s|,/).map(s => s.trim()).filter(Boolean), [linksRaw]);

  if (perguntas.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <p>Nenhuma pergunta carregada. <Link to="/perguntas">Gerar perguntas</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-wrapper">
      <div className="modal-box">
        <div className="container">
          <div className="card card-accent">
            <h2 className="section-title">Seus dados</h2>
            <div className="grid-2">
              <input className="input" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
              <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} />
              <input className="input" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              <input className="input" placeholder="Links (espaço ou vírgula)" value={linksRaw} onChange={(e) => setLinksRaw(e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="section-title">Respostas</h3>
            {perguntas.map((p, i) => (
              <div key={i} className="field">
                <label className="label" style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>{p}</label>
                <textarea className="textarea" value={respostas[i] || ''} onChange={(e) => setRespostas({ ...respostas, [i]: e.target.value })} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="btn"
                onClick={() => {
                  const perguntasRespostas = perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] || '' }));
                  navigate('/gerar', { state: { perguntasRespostas, areaAtuacao: area, nome, email, celular, cidade, links, contexto: '' } });
                }}
              >
                Gerar currículo
              </button>
              <Link className="btn secondary" to="/perguntas">Voltar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Gerar() {
  const location = useLocation();
  const state = location.state || {};

  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  async function gerar() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/llm/gerar-curriculo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });

      if (!res.ok) throw new Error('Falha ao gerar currículo');
      const txt = await res.text();
      const data = JSON.parse(txt);
      setMarkdown(data.curriculo ?? '');
    } catch (e: any) {
      setError(e.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  // gerar automaticamente
  useEffect(() => {
    gerar();
  }, []);

  return (
    <div className="modal-wrapper">
      <div className="modal-box">
        <div className="container">
          <LoadingOverlay visible={loading} text="Gerando currículo com IA..." />

          <div className="card card-accent">
            <h2 className="section-title">Currículo</h2>

            {markdown && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>

                {/* BOTÃO VOLTAR */}
                <button
                  className="btn secondary"
                  onClick={() => navigate('/')}
                >
                  Voltar
                </button>

                {/* BOTÃO PDF */}
                <button
                  className="btn"
                  onClick={async () => {
                    const element = printRef.current;
                    if (!element) return;

                    const [{ default: html2pdf }] = await Promise.all([
                      import('html2pdf.js') as any
                    ]);

                    const opt = {
                      margin: 0.5,
                      filename: 'curriculo.pdf',
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                    };

                    html2pdf().set(opt).from(element).save();
                  }}
                >
                  Exportar PDF
                </button>
              </div>
            )}

            {error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
          </div>

          {markdown && (
            <div className="resume card" style={{ marginTop: 16 }} ref={printRef}>
              <div className="markdown">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const location = useLocation();
  const isModal =
    location.pathname === "/perguntas" ||
    location.pathname === "/respostas" ||
    location.pathname === "/gerar";

  return (
    <div>
      <div className={`app-shell ${isModal ? "blur" : ""}`}>
        <Home />
      </div>

      {isModal && (
        <Routes>
          <Route path="/perguntas" element={<Perguntas />} />
          <Route path="/respostas" element={<Respostas />} />
          <Route path="/gerar" element={<Gerar />} />
        </Routes>
      )}

      <Footer />
    </div>
  );
}

