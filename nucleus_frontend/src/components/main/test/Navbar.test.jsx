import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi, describe, it, beforeEach, expect } from "vitest";
import Navbar from "../Navbar";
import { BrowserRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  mockNavigate.mockReset();
});

describe("Navbar Component", () => {
  it("renders logo and navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Logo and buttons exist
    expect(screen.getByText(/NUCLEUS/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();

    // Only check for the first visible 'Sign Out' button (desktop)
    const signOutButtons = screen.getAllByRole("button", { name: /Sign Out/i });
    expect(signOutButtons[0]).toBeInTheDocument();

    // Only check one Profile link (avoid multiple matches)
    const profileLinks = screen.getAllByText(/Profile/i);
    expect(profileLinks[0]).toBeInTheDocument();
  });

  it("calls navigate and clears storage on logout", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Click first visible Sign Out (desktop)
    const signOutButton = screen.getAllByRole("button", { name: /Sign Out/i })[0];
    fireEvent.click(signOutButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });
});
