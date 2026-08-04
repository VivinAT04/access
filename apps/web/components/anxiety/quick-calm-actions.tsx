"use client";


export function QuickCalmActions() {
  function openGuidedTools() {
    window.location.href = "/anxiety";
  }

  function returnToDashboard() {
    window.location.href = "/dashboard";
  }

  return (
    <div className="quick-calm-actions">
      <button
        className="button button-primary"
        onClick={openGuidedTools}
        type="button"
      >
        Open guided tools
      </button>

      <button
        className="button button-secondary"
        onClick={returnToDashboard}
        type="button"
      >
        Return to dashboard
      </button>
    </div>
  );
}
