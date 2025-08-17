import { useEffect, useState } from "react";
import { http } from "../api/http";
import type {Project} from "../types";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

const STATUS = ["todo","in_progress","done"] as const;

type FormState = {
  id?: number;
  name: string;
  description: string;
  status: string | ""; // "" — не отправлять поле (для проверки валидации)
};

export default function ProjectsPage() {
  const { push } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const [qName, setQName] = useState("");
  const [qStatus, setQStatus] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name:"", description:"", status:"todo" });

  async function load() {
    try {
      setLoading(true);
      const data = await http.get<Project[]>("/projects", {
        name: qName || undefined,
        status: qStatus || undefined
      });
      setProjects(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type: "error", message: `${e.status||""} ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial

  async function onApplyFilters() {
    await load();
  }

  function openCreate() {
    setForm({ name:"", description:"", status:"todo" });
    setOpen(true);
  }
  function openEdit(p: Project) {
    setForm({ id:p.id, name: p.name, description: p.description, status: p.status });
    setOpen(true);
  }

  async function saveProject() {
    try {
      if (form.id) {
        // PUT: если поле пустая строка — НЕ отправляем его (проверка валидации на бэке)
        const body: Record<string, unknown> = {};
        if (form.name !== "") body.name = form.name;
        if (form.description !== "") body.description = form.description;
        if (form.status !== "") body.status = form.status;

        await http.put<Project>(`/projects/${form.id}`, body);
        push({ type:"success", message: "Проект обновлён" });
      } else {
        const body: Record<string, unknown> = {};
        if (form.name !== "") body.name = form.name;
        if (form.description !== "") body.description = form.description;
        if (form.status !== "") body.status = form.status;

        await http.post<Project>("/projects", body);
        push({ type:"success", message: "Проект создан" });
      }
      setOpen(false);
      await load();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type:"error", message: `${e.status||""} ${e.message}` });
    }
  }

  async function removeProject(id: number) {
    if (!confirm("Удалить проект?")) return;
    try {
      await http.del<void>(`/projects/${id}`);
      push({ type:"success", message: "Удалено" });
      await load();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type:"error", message: `${e.status||""} ${e.message}` });
    }
  }

  return (
    <div className="container">
      <h1>Проекты</h1>

      <div className="card gap">
        <div className="row">
          <input className="input" placeholder="Фильтр по имени"
                 value={qName} onChange={e=>setQName(e.target.value)} />
          <select className="select" value={qStatus} onChange={e=>setQStatus(e.target.value)}>
            <option value="">Статус (любой)</option>
            <option value="todo">todo</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
          <button className="button" onClick={onApplyFilters} disabled={loading}>Применить</button>
          <div style={{flex:1}} />
          <button className="button primary" onClick={openCreate}>+ Новый проект</button>
        </div>

        <hr className="sep" />

        {projects.length === 0 ? (
          <div className="empty">{loading ? "Загрузка..." : "Ничего не найдено"}</div>
        ) : (
          <div className="grid">
            {projects.map(p => (
              <div className="card" key={p.id}>
                <div className="row" style={{justifyContent:"space-between"}}>
                  <strong>{p.name || <span className="empty">без названия</span>}</strong>
                  <span className={`badge ${p.status==="todo"?"todo":p.status==="in_progress"?"inprogress":"done"}`}>{p.status}</span>
                </div>
                <div style={{marginTop:8, color:"var(--muted)"}}>{p.description || <i>нет описания</i>}</div>
                <div className="footer-actions">
                  <Link className="button" to={`/projects/${p.id}`}>Открыть</Link>
                  <button className="button" onClick={()=>openEdit(p)}>Редактировать</button>
                  <button className="button danger" onClick={()=>removeProject(p.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={form.id ? "Редактировать проект" : "Новый проект"}
             footer={<>
               <button className="button" onClick={()=>setOpen(false)}>Отмена</button>
               <button className="button primary" onClick={saveProject}>{form.id ? "Сохранить" : "Создать"}</button>
             </>}>
        <label className="gap">
          <span>Название</span>
          <input className="input" placeholder="можно оставить пустым" value={form.name}
                 onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
        </label>
        <label className="gap">
          <span>Описание</span>
          <textarea className="input" rows={3} placeholder="..." value={form.description}
                    onChange={e=>setForm(f=>({...f, description:e.target.value}))} />
        </label>
        <label className="gap">
          <span>Статус</span>
          <select className="select" value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))}>
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="">— не отправлять —</option>
          </select>
        </label>
        <div className="badge">Пустые поля не будут включены в body — удобно проверить валидацию бэка.</div>
      </Modal>
    </div>
  );
}
