import React, { createContext, useState, ReactNode } from "react";

export interface OrgChartData {
  mgl: number;
  vsm: number;
  gl: number;
  tl: number;
  tm: number;
}

interface OrgChartContextProps {
  orgData: OrgChartData;
  updateOrgData: (newData: OrgChartData) => void;
}

export const OrgChartContext = createContext<OrgChartContextProps | undefined>(undefined);

export function OrgChartProvider({ children }: { children: ReactNode }) {
  const [orgData, setOrgData] = useState<OrgChartData>({
    mgl: 0,
    vsm: 0,
    gl: 0,
    tl: 0,
    tm: 0,
  });

  const updateOrgData = (newData: OrgChartData) => {
    setOrgData(newData);
  };

  return (
    <OrgChartContext.Provider value={{ orgData, updateOrgData }}>
      {children}
    </OrgChartContext.Provider>
  );
}
