import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export const DialogBox = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    q1: "",
    q2: "",
    q3: "",
    text: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.q1 || !form.q2 || !form.q3) return;
    onSubmit({ ...form });
    setForm({ q1: "", q2: "", q3: "", text: "" });
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center justify-center h-10 px-5 bg-black text-white rounded-full whitespace-nowrap">
          Feedback
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

        {/* Content */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            Feedback Form
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-sm text-gray-500">
            Please answer the questions below to help us improve.
          </Dialog.Description>

          <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-medium text-gray-800">
                How is the website service?
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {["Good", "Average", "Bad"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="q1"
                      value={opt}
                      checked={form.q1 === opt}
                      onChange={handleChange}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">
                Has this automation helped in lessening your burden?
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {["Yes", "Somewhat", "No"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="q2"
                      value={opt}
                      checked={form.q2 === opt}
                      onChange={handleChange}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">
                Is the website easy to use and explore?
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {["Yes", "Somewhat", "No"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="q3"
                      value={opt}
                      checked={form.q3 === opt}
                      onChange={handleChange}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">
                Any other suggestions?
              </p>
              <textarea
                name="text"
                value={form.text}
                onChange={handleChange}
                placeholder="Type your feedback here..."
                rows={3}
                className="mt-2 w-full rounded border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button type="button" className="rounded bg-gray-200 px-3 py-1">
                  Close
                </button>
              </Dialog.Close>

              <button
                type="submit"
                className="rounded bg-indigo-600 px-3 py-1 text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
