import React, { useContext } from "react";
import { OrgChartContext } from "@/context/OrgChartContext";

export default function Page4() {
  const context = useContext(OrgChartContext);
  if (!context) return null;
  const { orgData } = context;

  // 예시: MGL, VSM, GL, TL, TM의 총합 계산
  const total =
    orgData.mgl + orgData.vsm + orgData.gl + orgData.tl + orgData.tm;

  return (
    <div className="p-8 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold">집계 페이지 (페이지 4)</h2>
      <p className="mt-4">전체 합계: {total}</p>
      {/* 필요에 따라 각 항목별 숫자도 표시할 수 있음 */}
    </div>
  );
}
