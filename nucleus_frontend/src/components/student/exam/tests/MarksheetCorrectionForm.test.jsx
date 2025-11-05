import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import MarksheetCorrectionForm from "../MarksheetCorrectionForm";

// Mock localStorage
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() =>
      JSON.stringify({
        id: "123",
        moodle_id: "M123",
        department_id: 1,
      })
    ),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe("MarksheetCorrectionForm", () => {
  it("renders form fields correctly", async () => {
    render(
      <BrowserRouter>
        <MarksheetCorrectionForm />
      </BrowserRouter>
    );

    // Heading
    expect(await screen.findByText(/Marksheet Correction Request/i))
      .toBeInTheDocument();

    // Moodle ID input
    const moodleInput = await screen.findByLabelText(/Moodle ID/i);
    expect(moodleInput).toBeInTheDocument();
    expect(moodleInput).toHaveValue("M123");

    // Submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });
});
