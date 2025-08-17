import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../api/http";
import type {ProjectWithTasks, Task} from "../types";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

type TaskForm = {
  id?: number;
  title: string;
  is_done: "omit" | "true" | "false"; // tri-state для проверки валидации
};

export default function ProjectPage() {
  const { id } = useParams();
  const { push } = useToast();

  const [data, setData] = useState<ProjectWithTasks | null>(null);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskForm>({ title: "", is_done: "omit" });

  async function load() {
    try {
      setLoading(true);
      const res = await http.get<ProjectWithTasks>(`/projects/${id}/with-tasks`);
      setData(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type:"error", message: `${e.status||""} ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  function openCreate() {
    setForm({ title: "", is_done: "omit" });
    setOpen(true);
  }
  function openEdit(t: Task) {
    setForm({ id: t.id, title: t.title, is_done: t.is_done ? "true" : "false" });
    setOpen(true);
  }

  async function loadTasks() {
    try {
      const tasks = await http.get<Task[]>(`/projects/${id}/tasks`);
      setData((prev) => (prev ? { ...prev, tasks } : prev));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type:"error", message: `${e.status||""} ${e.message}` });
    }
  }

  async function saveTask() {
    try {
      if (!data) return;
      if (form.id) {
        const body: Record<string, unknown> = {};
        if (form.title !== "") body.title = form.title;
        if (form.is_done !== "omit") body.is_done = form.is_done === "true";
        await http.put<Task>(`/tasks/${form.id}`, body);
        push({ type:"success", message: "Задача обновлена" });
      } else {
        if (form.title === "") {
          // хотим дать возможность отправить пустую строку? — отправляем пустую, пусть бэк решает
        }
        await http.post<Task>(`/projects/${id}/tasks`, { title: form.title });
        push({ type:"success", message: "Задача создана" });
      }
      setOpen(false);
      await load();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type:"error", message: `${e.status||""} ${e.message}` });
    }
  }

  async function removeTask(taskId: number) {
    if (!confirm("Удалить задачу?")) return;
    try {
      await http.del<void>(`/tasks/${taskId}`);
      push({ type:"success", message: "Удалено" });
      await load();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      push({ type:"error", message: `${e.status||""} ${e.message}` });
    }
  }

  return (
    <div className="container">
      <div className="row" style={{alignItems:"baseline", gap:16}}>
        <h1 style={{marginBottom:0}}>Проект</h1>
        <Link to="/" className="badge">← к списку</Link>
      </div>

      {!data ? (
        <div className="card">{loading ? "Загрузка..." : "Проект не найден"}</div>
      ) : (
        <>
          <div className="card gap">
            <div className="row" style={{justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:20, fontWeight:700}}>{data.project.name || <span className="empty">без названия</span>}</div>
                <div className="badge" style={{marginTop:8}}>{data.project.status}</div>
              </div>
              <button className="button primary" onClick={openCreate}>+ Новая задача</button>
            </div>
            <div style={{color:"var(--muted)"}}>{data.project.description || <i>нет описания</i>}</div>
          </div>

          <div className="row" style={{justifyContent:"space-between"}}>
            <h2 style={{margin:0}}>Задачи</h2>
            <button className="button ghost" onClick={loadTasks}>Обновить задачи</button>
          </div>
          {data.tasks.length === 0 ? (
            <div className="card empty">Задач пока нет</div>
          ) : (
            <div className="grid cards">
              {data.tasks.map(t => (
                <div className="card" key={t.id}>
                  <div className="row" style={{justifyContent:"space-between"}}>
                    <strong>{t.title || <span className="empty">без названия</span>}</strong>
                    <span className={`badge ${t.is_done?"ok":""}`}>{t.is_done ? "done" : "todo"}</span>
                  </div>
                  <div className="footer-actions">
                    <button className="button" onClick={()=>openEdit(t)}>Редактировать</button>
                    <button className="button danger" onClick={()=>removeTask(t.id)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title={form.id ? "Редактировать задачу" : "Новая задача"}
             footer={<>
               <button className="button" onClick={()=>setOpen(false)}>Отмена</button>
               <button className="button primary" onClick={saveTask}>{form.id ? "Сохранить" : "Создать"}</button>
             </>}>
        <label className="gap">
          <span>Заголовок</span>
          <input className="input" placeholder="можно оставить пустым" value={form.title}
                 onChange={e=>setForm(f=>({...f, title: e.target.value}))} />
        </label>
        {form.id && (
          <label className="gap">
            <span>Статус выполнения</span>
            <select className="select" value={form.is_done} onChange={e=>setForm(f=>({...f, is_done: e.target.value as TaskForm["is_done"]}))}>
              <option value="omit">— не отправлять —</option>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </label>
        )}
        <div className="badge">Пустые поля/«не отправлять» помогут проверить серверную валидацию.</div>
      </Modal>
    </div>
  );
}
