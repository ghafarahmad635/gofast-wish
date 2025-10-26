import * as React from "react";

interface EmailTemplateProps {
  title: string;
  message: string;
}

export function EmailTemplate({ title, message }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", padding: "20px" }}>
      <h1 style={{ color: "#1E40AF" }}>{title}</h1>
      <p style={{ fontSize: "16px", lineHeight: "24px" }}>{message}</p>
      <p style={{ fontSize: "13px", color: "#666" }}>
        – The GoFast Wish Team
      </p>
    </div>
  );
}
