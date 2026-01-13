import { useState, useEffect } from "react";
import api from "./services/api";
import { parseEmails } from "./utils/parseEmails";

export default function App() {
  /* ---------- Campaign Data ---------- */
  const [emails, setEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [fromName, setFromName] = useState("");
  const [delayMin, setDelayMin] = useState(1);
  const [delayMax, setDelayMax] = useState(60);

  /* ---------- Campaign State ---------- */
  const [campaignId, setCampaignId] = useState(null);
  const [queued, setQueued] = useState(0);
  const [sent, setSent] = useState(0);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  /* ---------- Upload TXT ---------- */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseEmails(text);

    setEmails(parsed);
    setQueued(0);
    setSent(0);
    setProgress(0);
    setCampaignId(null);
    setStatus("ready");
  };

  /* ---------- Send Campaign ---------- */
  const handleSend = async () => {
    if (!emails.length) {
      alert("Please upload a TXT file with emails.");
      return;
    }

    setStatus("queueing");

    try {
      const res = await api.post("/bulk-send", {
        recipients: emails,
        subject,
        body,
        fromName,
        format: "text",
        delayMin,
        delayMax
      });

      setQueued(res.data.queued);
      setCampaignId(res.data.campaignId);
      setSent(0);
      setProgress(0);
      setStatus("sending");
    } catch (err) {
      console.error(err);
      setStatus("failed");
    }
  };

  /* ---------- Live Progress (SSE) ---------- */
useEffect(() => {
  if (status !== "sending" || !campaignId) return;

  const source = new EventSource(`/api/progress/${campaignId}`);

  source.addEventListener("update", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.status === "completed") {
      setSent(queued);
      setProgress(100);
      setStatus("completed");
      source.close();
      return;
    }

    setSent(prev => Math.min(prev + 1, queued));
  });

  source.onerror = () => {
    source.close();
  };

  return () => source.close();
}, [status, campaignId, queued]);



  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-8">
      <div className="w-full max-w-4xl space-y-8 fade-in">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-slate-800">
            Bulk Mailer
          </h1>
          <span className="text-sm text-slate-500">
            Gmail Campaign Sender
          </span>
        </header>

        {/* Upload */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 card">
          <h2 className="text-lg font-medium text-slate-700">
            1. Upload Recipients
          </h2>

          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="block w-full text-sm"
          />

          <p className="text-sm text-slate-500">
            Loaded emails:{" "}
            <span className="font-semibold text-slate-700">
              {emails.length}
            </span>
          </p>
        </section>

        {/* Compose */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 card">
          <h2 className="text-lg font-medium text-slate-700">
            2. Compose Email
          </h2>

          <input
            className="w-full border rounded-md p-2"
            placeholder="From name (optional)"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
          />

          <input
            className="w-full border rounded-md p-2"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            className="w-full border rounded-md p-2 h-36 resize-none"
            placeholder="Email body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </section>

        {/* Controls */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 card">
          <h2 className="text-lg font-medium text-slate-700">
            3. Sending Rules
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">
                Min Delay (sec)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                className="w-full border rounded-md p-2"
                value={delayMin}
                onChange={(e) => setDelayMin(+e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">
                Max Delay (sec)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                className="w-full border rounded-md p-2"
                value={delayMax}
                onChange={(e) => setDelayMax(+e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={status === "sending"}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            Start Campaign
          </button>
	<button onClick={() => api.post("/pause")}>Pause</button>
	<button onClick={() => api.post("/resume")}>Resume</button>
	<button onClick={() => api.post("/stop")}>Stop</button>

        </section>

        {/* Progress */}
        {status !== "idle" && (
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4 card">
            <h2 className="text-lg font-medium text-slate-700">
              Campaign Progress
            </h2>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-500 h-3 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Sent: {sent}</span>
              <span>Total: {queued}</span>
              <span>{progress}%</span>
            </div>

            <p className="text-sm">
              Status:{" "}
              <span className="font-semibold capitalize">
                {status}
              </span>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}



