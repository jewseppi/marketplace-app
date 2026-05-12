"use client";

import React from "react";
import { ErrorToast } from "@/components/ui/ErrorToast";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unexpected render error" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught render error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto max-w-3xl px-6 py-16">
            <ErrorToast
              title="This view hit a render error"
              message={this.state.message || "Please refresh or try another page."}
            />
          </div>
        )
      );
    }

    return this.props.children;
  }
}
