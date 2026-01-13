import EmailComposer from "../components/EmailComposer";

export default function Campaign() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        New Campaign
      </h1>

      <EmailComposer />
    </div>
  );
}

