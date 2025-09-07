"use client";

import { useState, useEffect } from "react";

const BIN_ID = "68b8785143b1c97be935ba70";
const TODAY_ID = "68be10d4ae596e708fe62632";
const API_KEY = "$2a$10$RlqGKgZbf07v6KyuD9/qm.K/eYGgFu.FCqzpc1ahnjyKjhwbq05F6";

type Todo = {
  id: number;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [today, settoday] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [customToday, setCustomToday] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ BUSCAR TODOS DO JSONBIN
  const fetchTodos = async () => {
    try {
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
        {
          headers: {
            "X-Master-Key": API_KEY,
          },
        }
      );
      const data = await response.json();
      const responseToday = await fetch(
        `https://api.jsonbin.io/v3/b/${TODAY_ID}/latest`,
        {
          headers: {
            "X-Master-Key": API_KEY,
          },
        }
      );
      const todayData = await responseToday.json();
      settoday(todayData.record.today);
      setStart(todayData.record.today);
      setEnd(todayData.record.today);
      const todosWithDates = (data.record || []).map((todo: any) => ({
        ...todo,
        start: new Date(todo.start),
        end: new Date(todo.end),
      }));

      setTodos(todosWithDates);
    } catch (error) {
      console.error("Erro ao buscar TODOs:", error);
    } finally {
      setLoading(false);
    }
  };
  const changeDate = (target: any) => {
    setCustomToday(fixDate(target));
    setStart(target);
    setEnd(target);
  };
  // ✅ ADICIONAR TODO NO JSONBIN
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) return;

    const startDate = fixDate(start);
    const endDate = fixDate(end);
    const newTodo: Todo = {
      id: Date.now(),
      title,
      description,
      start: new Date(startDate),
      end: new Date(endDate),
      color: getRandomColor(),
    };

    try {
      const updatedTodos = [...todos, newTodo];

      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify(updatedTodos),
      });

      setTodos(updatedTodos);
      setTitle("");
      setDescription("");
      setStart(today);
      setEnd(today);
    } catch (error) {
      console.error("Erro ao adicionar TODO:", error);
    }
  };

  // ✅ DELETAR TODO DO JSONBIN
  const deleteTask = async (id: number) => {
    try {
      const updatedTodos = todos.filter((todo) => todo.id !== id);

      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify(updatedTodos),
      });

      setTodos(updatedTodos);
    } catch (error) {
      console.error("Erro ao deletar TODO:", error);
    }
  };

  // ✅ CARREGAR TODOS AO INICIAR
  useEffect(() => {
    fetchTodos();
  }, []);

  const realToday = new Date(today);
  const year = customToday?.getFullYear() ?? realToday.getFullYear();
  const month = customToday?.getMonth() ?? realToday.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7"];

  function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function fixDate(s: string) {
    return new Date(+s.split("-")[0], +s.split("-")[1] - 1, +s.split("-")[2]);
  }

  function getTodosForDay(day: number) {
    const date = new Date(year, month, day);
    return todos.filter((t) => date >= t.start && date <= t.end);
  }

  function isCustomToday(day: number) {
    if (!customToday) {
      return day === +today.split("-")[2];
    }
    return (
      customToday.getDate() === day &&
      customToday.getMonth() === month &&
      customToday.getFullYear() === year
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Carregando Quests...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen gap-6 p-6 bg-gray-100">
      {/* Calendário */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-700">
            {new Date(year, month).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </h1>

          {/* Definir "Hoje" customizado */}
          <form className="text-gray-400">
            <input
              type="date"
              defaultValue={today}
              onChange={(e) => changeDate(e.target.value)}
              className="border p-2 rounded text-sm"
            />
          </form>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="font-semibold text-gray-700 text-center">
              {d}
            </div>
          ))}

          {/* Espaços até o primeiro dia */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Dias */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTodos = getTodosForDay(day);
            const isToday = isCustomToday(day);

            return (
              <div
                key={day}
                className={`relative border rounded-lg p-2 h-20 text-center bg-white text-gray-400 flex flex-col justify-between ${
                  isToday ?? "ring-2 ring-blue-600 font-bold"
                }`}
              >
                <span>{day}</span>

                {/* bolinhas */}
                <div className="flex justify-center gap-1 flex-wrap">
                  {dayTodos.map((t) => (
                    <span
                      key={t.id}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                      title={t.title}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Área de tarefas */}
      <div className="w-80 bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-2 text-gray-700">Quests</h2>

        <form
          onSubmit={handleAddTodo}
          className="text-gray-400 flex flex-col gap-2 mb-4"
        >
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Adicionar
          </button>
        </form>

        <ul className="space-y-2">
          {todos.map((t) => {
            if (t.end.getMonth() === month || t.start.getMonth() === month) {
              return (
                <li
                  key={t.id}
                  className="border rounded p-2 bg-gray-50 text-sm flex flex-col"
                  style={{ borderLeft: `4px solid ${t.color}` }}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      {t.title}
                    </span>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="ml-2 text-black font-bold hover:text-red-600"
                    >
                      x
                    </button>
                  </div>
                  {t.description && (
                    <span className="text-gray-400">{t.description}</span>
                  )}
                  <span className="text-xs text-gray-600">
                    {t.start.toLocaleDateString()} →{" "}
                    {t.end.toLocaleDateString()}
                  </span>
                </li>
              );
            }
          })}
        </ul>
      </div>
    </main>
  );
}
