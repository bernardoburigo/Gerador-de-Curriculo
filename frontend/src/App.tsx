import { useMemo, useRef, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

type PerguntasResponse = { perguntas: string[] };

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function LoadingOverlay({ visible, text }: { visible: boolean; text: string }) {
  if (!visible) return null;
  return (
    <div className="overlay">
      <div>
        <div className="spinner" />
        <div className="overlay-text">{text}</div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Gerador de Currículo com IA</h1>
          <p className="hero-sub">
            Transforme respostas em um currículo profissional em minutos. Geração assistida por IA, pronta para ATS e exportação em PDF.
          </p>
          <button className="btn btn-accent" onClick={() => navigate('/perguntas')}>Começar agora →</button>
        </div>
      </section>
      <div className="container">
        <div className="card grid-3">
          <div>
            <h3 className="section-title">Rápido</h3>
            <p className="subtle">Perguntas objetivas para capturar seu histórico e gerar um currículo limpo.</p>
          </div>
          <div>
            <h3 className="section-title">Profissional</h3>
            <p className="subtle">Formato compatível com processos seletivos e sistemas de triagem.</p>
          </div>
          <div>
            <h3 className="section-title">Exportável</h3>
            <p className="subtle">Visualize em Markdown e exporte em PDF com um clique.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Perguntas() {
  const [area, setArea] = useState('Desenvolvedor Front-End');
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
      if (!res.ok) throw new Error('Falha ao obter perguntas');
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
          <Link className="btn btn-ghost" to="/">Voltar</Link>
        </div>
        {error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
      </div>

      {perguntas.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="section-title">Perguntas</h3>
          <ol>
            {perguntas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
          <button className="btn btn-accent" onClick={() => navigate('/respostas', { state: { perguntas, area } })}>
            Responder
          </button>
        </div>
      )}
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
            <label className="label">{p}</label>
            <textarea className="textarea" value={respostas[i] || ''} onChange={(e) => setRespostas({ ...respostas, [i]: e.target.value })} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            className="btn btn-accent"
            onClick={() => {
              const perguntasRespostas = perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] || '' }));
              navigate('/gerar', { state: { perguntasRespostas, areaAtuacao: area, nome, email, celular, cidade, links, contexto: '' } });
            }}
          >
            Gerar currículo
          </button>
          <Link className="btn btn-ghost" to="/perguntas">Voltar</Link>
        </div>
      </div>
    </div>
  );
}

function Gerar() {
  const [state] = useState<any>(() => window.history.state?.usr || {});
  const [markdown, setMarkdown] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement | null>(null);

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
      const md = data.curriculo ?? data?.curriculo?.toString?.() ?? '';
      setMarkdown(md);
    } catch (e: any) {
      setError(e.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <LoadingOverlay visible={loading} text="Gerando currículo com IA..." />
      <div className="card card-accent">
        <h2 className="section-title">Currículo</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={gerar} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar agora'}
          </button>
          {markdown && (
            <button
              className="btn btn-accent"
              onClick={async () => {
                const element = printRef.current;
                if (!element) return;
                const [{ default: html2pdf }] = await Promise.all([
                  import('html2pdf.js') as any
                ]);
                const opt = {
                  margin:       0.5,
                  filename:     'curriculo.pdf',
                  image:        { type: 'jpeg', quality: 0.98 },
                  html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                  jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
              }}
            >
              Exportar PDF
            </button>
          )}
        </div>
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
  );
}

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perguntas" element={<Perguntas />} />
        <Route path="/respostas" element={<Respostas />} />
        <Route path="/gerar" element={<Gerar />} />
      </Routes>
    </div>
  );
}


