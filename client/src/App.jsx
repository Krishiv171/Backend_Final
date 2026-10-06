import React, { useEffect, useMemo, useState } from "react";
import api from "./api";

const categories = ["all", "academic", "event", "exam"];

function safeUser() {
  try {
    const saved = localStorage.getItem("dnb_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("dnb_user");
    localStorage.removeItem("dnb_token");
    return null;
  }
}

function App() {
  const [user, setUser] = useState(safeUser);
  const [page, setPage] = useState("home");

  function logout() {
    localStorage.removeItem("dnb_token");
    localStorage.removeItem("dnb_user");
    setUser(null);
    setPage("home");
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand" onClick={() => setPage("home")}>
          <span className="brand-mark">N</span>
          <div>
            <strong>Digital Notice Board</strong>
            <small>College Information Portal</small>
          </div>
        </div>
        <nav>
          <button className="link-btn" onClick={() => setPage("home")}>Notices</button>
          {user && ["staff", "admin"].includes(user.role) && (
            <button className="primary small" onClick={() => setPage("create")}>+ Post Notice</button>
          )}
          {user ? (
            <div className="user-area">
              <span>{user.name} · {user.role}</span>
              <button className="secondary small" onClick={logout}>Logout</button>
            </div>
          ) : (
            <button className="secondary small" onClick={() => setPage("login")}>Login</button>
          )}
        </nav>
      </header>

      <main>
        {page === "home" && <NoticeBoard user={user} setPage={setPage} />}
        {page === "login" && <Login setUser={setUser} setPage={setPage} />}
        {page === "register" && <Register setUser={setUser} setPage={setPage} />}
        {page === "create" && <NoticeForm setPage={setPage} />}
        {page.startsWith("edit:") && (
          <EditPage id={page.split(":")[1]} setPage={setPage} />
        )}
      </main>

      <footer>Digital Notice Board · Node.js · Express.js · MongoDB</footer>
    </div>
  );
}

function NoticeBoard({ user, setPage }) {
  const [notices, setNotices] = useState([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("-postedDate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({ sort });
    if (category !== "all") params.set("category", category);
    return `?${params.toString()}`;
  }, [category, sort]);

  async function loadNotices() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/notices${query}`);
      setNotices(Array.isArray(response.data?.notices) ? response.data.notices : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load notices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, [query]);

  async function removeNotice(id) {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      await loadNotices();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  }

  const canModify = notice =>
    Boolean(user && (user.role === "admin" || notice.postedBy?._id === user.id));

  return (
    <section className="container">
      <div className="hero">
        <div>
          <span className="eyebrow">CAMPUS UPDATES</span>
          <h1>Stay informed.<br />Never miss a notice.</h1>
          <p>Academic, event and examination notices in one centralized place.</p>
        </div>
        <div className="hero-card">
          <strong>{notices.length}</strong>
          <span>notices displayed</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="tabs">
          {categories.map(item => (
            <button
              key={item}
              className={category === item ? "tab active" : "tab"}
              onClick={() => setCategory(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-postedDate">Newest first</option>
          <option value="postedDate">Oldest first</option>
        </select>
      </div>

      {loading && <div className="state">Loading notices...</div>}
      {error && (
        <div className="error">
          {error}
          <button className="secondary small" onClick={loadNotices}>Retry</button>
        </div>
      )}

      {!loading && !error && notices.length === 0 && (
        <div className="state">No notices found.</div>
      )}

      <div className="notice-grid">
        {notices.map(notice => (
          <article className="notice-card" key={notice._id}>
            <div className="card-top">
              <span className={`badge ${notice.category}`}>{notice.category}</span>
              <span className="date">{new Date(notice.postedDate).toLocaleDateString()}</span>
            </div>
            <h2>{notice.title}</h2>
            <p>{notice.content}</p>
            <div className="card-bottom">
              <span>Posted by <strong>{notice.postedBy?.name || "Unknown"}</strong></span>
              {canModify(notice) && (
                <div className="actions">
                  <button className="text-btn" onClick={() => setPage(`edit:${notice._id}`)}>Edit</button>
                  <button className="danger text-btn" onClick={() => removeNotice(notice._id)}>Delete</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Login({ setUser, setPage }) {
  const [email, setEmail] = useState("staff@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("dnb_token", data.token);
      localStorage.setItem("dnb_user", JSON.stringify(data.user));
      setUser(data.user);
      setPage("home");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your notices.">
      <form onSubmit={submit}>
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        {error && <div className="error">{error}</div>}
        <button className="primary full">Login</button>
        <p className="switch">No account? <button type="button" onClick={() => setPage("register")}>Register as student</button></p>
      </form>
    </AuthCard>
  );
}

function Register({ setUser, setPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("dnb_token", data.token);
      localStorage.setItem("dnb_user", JSON.stringify(data.user));
      setUser(data.user);
      setPage("home");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Public registration creates a student account.">
      <form onSubmit={submit}>
        <Field label="Name" value={form.name} onChange={v => update("name", v)} />
        <Field label="Email" value={form.email} onChange={v => update("email", v)} type="email" />
        <Field label="Password" value={form.password} onChange={v => update("password", v)} type="password" />
        {error && <div className="error">{error}</div>}
        <button className="primary full">Register</button>
      </form>
    </AuthCard>
  );
}

function NoticeForm({ setPage }) {
  const [form, setForm] = useState({ title: "", content: "", category: "academic" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/notices", form);
      setPage("home");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not create notice");
    }
  }

  return (
    <NoticeEditor
      title="Post a notice"
      form={form}
      setForm={setForm}
      error={error}
      onSubmit={submit}
      onCancel={() => setPage("home")}
    />
  );
}

function EditPage({ id, setPage }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/notices/${id}`)
      .then(({ data }) => setForm({
        title: data.notice.title,
        content: data.notice.content,
        category: data.notice.category
      }))
      .catch(err => setError(err.response?.data?.message || err.message || "Could not load notice"));
  }, [id]);

  if (!form) {
    return (
      <section className="auth-wrap">
        <div className="auth-card">
          <h2>{error || "Loading notice..."}</h2>
          {error && <button className="secondary" onClick={() => setPage("home")}>Back</button>}
        </div>
      </section>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.patch(`/notices/${id}`, form);
      setPage("home");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Update failed");
    }
  }

  return (
    <section className="container">
      <NoticeEditor
        title="Update notice"
        form={form}
        setForm={setForm}
        error={error}
        onSubmit={submit}
        onCancel={() => setPage("home")}
      />
    </section>
  );
}

function NoticeEditor({ title, form, setForm, error, onSubmit, onCancel }) {
  return (
    <div className="form-card">
      <div className="form-heading">
        <div>
          <span className="eyebrow">NOTICE MANAGEMENT</span>
          <h1>{title}</h1>
        </div>
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
      </div>
      <form onSubmit={onSubmit}>
        <Field label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} />
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="academic">Academic</option>
            <option value="event">Event</option>
            <option value="exam">Exam</option>
          </select>
        </label>
        <label className="field">
          <span>Content</span>
          <textarea
            rows="8"
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            required
            minLength="5"
            maxLength="5000"
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="primary">Save Notice</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required />
    </label>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">DIGITAL NOTICE BOARD</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

export default App;
