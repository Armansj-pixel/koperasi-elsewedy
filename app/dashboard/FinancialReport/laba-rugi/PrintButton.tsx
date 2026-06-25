"use client";

import React from "react";

export default function PrintButton() {
  return (
    <button className="btn-print" onClick={() => window.print()}>
      Export PDF
    </button>
  );
}
