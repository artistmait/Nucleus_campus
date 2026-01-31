import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export const DialogBox = ({ onSubmit }) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    onSubmit(feedback);
    setFeedback("");
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 h-10 bg-black text-white rounded-full w-1/6">
          Feedback
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

        {/* Content */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            How do you find our service?
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-sm text-gray-500">
            Please share your feedback below.
          </Dialog.Description>

          {/* Form must be OUTSIDE Description */}
          <form className="mt-4">
            <input
              className="w-full rounded border px-3 py-2"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="I am..."
            />
          </form>

          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="rounded bg-gray-200 px-3 py-1">Close</button>
            </Dialog.Close>

            <Dialog.Close asChild>
              <button
                onClick={handleSubmit}
                className="rounded bg-indigo-600 px-3 py-1"
              >
                Submit
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
