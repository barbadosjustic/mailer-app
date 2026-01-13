import { useState } from "react";

export default function EmailComposer() {
  const [format, setFormat] = useState("text"); // "text" | "html"
  const [body, setBody] = useState("");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setFormat("text")}
          className={`px-3 py-1 rounded ${
            format === "text"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Plain Text
        </button>

        <button
          onClick={() => setFormat("html")}
          className={`px-3 py-1 rounded ${
            format === "html"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          HTML
        </button>
      </div>

      {/* Body input */}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={8}
        className={`w-full p-2 border rounded ${
          format === "html" ? "font-mono" : ""
        }`}
        placeholder={
          format === "html"
            ? "<h1>Hello</h1><p>This is HTML</p>"
            : "Hello,\nThis is plain text"
        }
      />

      {/* Preview */}
      <div className="mt-4 border rounded p-3 bg-gray-50">
        <div className="text-sm font-semibold mb-2">
          Preview ({format.toUpperCase()})
        </div>

        {format === "html" ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm">
            {body}
          </pre>
        )}
      </div>
    </div>
  );
}

