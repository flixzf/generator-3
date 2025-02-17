"use client";
import React, { useState } from "react";
import Page1 from "../components/pages/page1";
import Page2 from "../components/pages/page2";
import Page3 from "../components/pages/page3";
import Page4 from "../components/pages/page4";
import { OrgChartProvider } from "@/context/OrgChartContext";

export default function OrgChartPage() {
  const [currentPage, setCurrentPage] = useState("1");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "1":
        return <Page1 />;
      case "2":
        return <Page2 />;
      case "3":
        return <Page3 />;
      case "4":
        return <Page4 />;
      default:
        return <Page1 />;
    }
  };

  return (
    <OrgChartProvider>
      <div className="p-4">
        <select
          onChange={(e) => setCurrentPage(e.target.value)}
          value={currentPage}
          className="mb-4 p-2 border rounded"
        >
          <option value="1">페이지 1</option>
          <option value="2">페이지 2</option>
          <option value="3">페이지 3</option>
          <option value="4">집계 페이지 (페이지 4)</option>
        </select>
        {renderCurrentPage()}
      </div>
    </OrgChartProvider>
  );
}
