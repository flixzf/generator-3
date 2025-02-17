"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// 상단에 상수 추가
const POSITION_BOX_CONFIG = {
  width: 48, // tailwind의 w-48 (12rem)
  gap: 4,    // 1rem
} as const;

// ---------------------------
// **직책 박스 컴포넌트 (PositionBox)**
// ---------------------------
export const PositionBox: React.FC<{
  title: string;
  subtitle?: string;
  level: number;
  className?: string;
}> = ({ title, subtitle, level, className = '' }) => {
  let baseClassName = `
    w-${POSITION_BOX_CONFIG.width} h-20
    border border-gray-300 rounded
    flex flex-col justify-center items-center m-2
  `;
  if (level === 0) baseClassName += " bg-gray-700 text-white border-gray-500";
  else if (level === 1) baseClassName += " bg-gray-500 text-white border-gray-700";
  else if (level === 2) baseClassName += " bg-gray-400 border-gray-500";
  else if (level === 3) baseClassName += " bg-gray-300 border-gray-500";
  else baseClassName += " bg-blue-50 border-gray-500";

  return (
    <div className={`${baseClassName} ${className}`}>
      <div className="text-center">
        <div className="font-bold">{title}</div>
        {subtitle && <div className="text-sm">{subtitle}</div>}
      </div>
    </div>
  );
};

// ---------------------------
// **간단 연결선 컴포넌트 (VerticalLine)**
// ---------------------------
export const VerticalLine: React.FC<{
  height: number;
  marginTop?: number;
  marginBottom?: number;
}> = ({ height, marginTop = 0, marginBottom = 0 }) => {
  return (
    <div
      style={{
        width: "1px",
        height: `${height}px`,
        backgroundColor: "#666",
        margin: `${marginTop}px auto ${marginBottom}px auto`
      }}
    />
  );
};

// ---------------------------
// **MGLConnector 컴포넌트**
// ---------------------------
export const MGLConnector: React.FC<{ lineCount: number }> = ({ lineCount }) => {
  const horizontalLineHeight = 1;
  const horizontalPadding = 20;
  const horizontalWidth = lineCount * 250;
  const verticalLines = Array.from({ length: lineCount }, (_, i) => i);
  return (
    <div style={{ textAlign: "center" }}>
      <VerticalLine height={30} />
      <div
        style={{
          display: "inline-block",
          width: `${horizontalWidth}px`,
          height: `${horizontalLineHeight}px`,
          backgroundColor: "#666",
          marginTop: `${horizontalPadding}px`,
          marginBottom: `${horizontalPadding}px`,
          position: "relative",
        }}
      >
        {verticalLines.map((_, i) => {
          const leftRatio = i / (lineCount - 1 || 1);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${leftRatio * 100}%`,
                top: 0,
                width: "1px",
                height: "30px",
                backgroundColor: "#666",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------
// **연결선 컴포넌트 (ConnectingLines)**
// ---------------------------
export const ConnectingLines: React.FC<{
  count: number;
  type?: "vertical" | "horizontal";
}> = ({ count, type = "vertical" }) => {
  if (type !== "vertical") {
    return (
      <div className="relative h-4 w-full">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />
      </div>
    );
  }

  if (count <= 1) {
    return (
      <div className="relative w-full h-8">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-12">
      <div className="absolute left-1/2 top-0 bottom-1/2 w-px bg-gray-300" />
      <div
        className="absolute top-1/2 h-px bg-gray-300"
        style={{
          left: `${(0.5 / count) * 100}%`,
          right: `${(0.5 / count) * 100}%`,
        }}
      />
      {Array(count)
        .fill(null)
        .map((_, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 bottom-0 w-px bg-gray-300"
            style={{
              left: `${((idx + 0.5) / count) * 100}%`,
            }}
          />
        ))}
    </div>
  );
};


export const VSMGroup: React.FC<{ vsm: { subtitle: string }; config: Config }> = ({ vsm, config }) => {
  const processGroups = getProcessGroups(config);
  const tlHeights = processGroups.map(group => {
    const tlCount = group.tlGroup.length;
    return tlCount * 80 + (tlCount - 1) * 16;
  });
  const maxTLHeight = Math.max(...tlHeights);
  return (
    <div className="flex flex-col items-center mx-8">
      <PositionBox title="VSM" subtitle={vsm.subtitle} level={1} />
      <ConnectingLines count={3} type="vertical" />
      <div className="flex flex-row">
        {processGroups.map((group, idx) => {
          const glHeight = tlHeights[idx];
          const spacerHeight = Math.max(0, maxTLHeight - glHeight) + 30;
          return (
            <div key={idx} className="flex flex-col items-center mx-6">
              <PositionBox title="GL" subtitle={group.gl.subtitle} level={2} />
              <VerticalLine height={20} />
              <div className="flex flex-col">
                {group.tlGroup.map((tl, tlIdx) => (
                  <PositionBox key={tlIdx} title="TL" subtitle={tl.subtitle} level={3} />
                ))}
              </div>
              <div style={{ height: spacerHeight }} />
              <div className="flex flex-col">
                {group.tmGroup?.map((tm, tmIdx) => (
                  <PositionBox key={tmIdx} title="TM" subtitle={tm.subtitle} level={4} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// MultiColumnDepartmentSection 컴포넌트 추가
export const MultiColumnDepartmentSection: React.FC<{
  tlData: string[];
  tmData: string[][];
  tlStartY: number;
  tmStartY: number;
}> = ({ tlData, tmData, tlStartY, tmStartY }) => {
  const columnCount = tmData.length;
  const boxWidthRem = POSITION_BOX_CONFIG.width / 4;
  const gapRem = POSITION_BOX_CONFIG.gap / 4;
  
  // TM 섹션의 전체 너비 계산 (박스 너비 + 간격)
  const totalWidth = (columnCount * boxWidthRem) + ((columnCount - 1) * gapRem);
  
  // TL 박스의 중심 위치를 참조하기 위한 ref
  const tlBoxRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex flex-col items-center relative">
      {/* TL 섹션 */}
      {tlData.length > 0 && (
        <div 
          ref={tlBoxRef}
          style={{ 
            position: "absolute",
            top: `${tlStartY}px`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "fit-content"
          }}
        >
          {tlData.map((tl, index) => (
            <div key={index} className="flex flex-col items-center">
              <PositionBox title="TL" subtitle={tl} level={3} />
              <VerticalLine height={20} />
            </div>
          ))}
        </div>
      )}

      {/* TM 섹션 - TL 박스의 중심을 기준으로 정렬 */}
      <div style={{ 
        position: "absolute",
        top: `${tmStartY}px`,
        left: tlBoxRef.current ? 
          `calc(${tlBoxRef.current.offsetLeft + (tlBoxRef.current.offsetWidth / 2)}px)` : 
          "50%",
        transform: "translateX(-50%)",  // 자신의 너비의 절반만큼 왼쪽으로 이동
        display: "flex",
        gap: `${gapRem}rem`,
        width: `${totalWidth}rem`  // 전체 너비 (박스 + 간격)
      }}>
        {tmData.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col items-center" style={{ width: `${boxWidthRem}rem` }}>
            {column.map((tm, tmIndex) => (
              <PositionBox key={tmIndex} title="TM" subtitle={tm} level={4} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------
// **OrganizationTree 컴포넌트 (전체 조직도)**
// ---------------------------
export const OrganizationTree: React.FC<{ 
  page?: string;
  config: Config;  // config props 추가
}> = ({ 
  page = "1",
  config = {  // 기본값 설정
    lineCount: 4,
    shiftsCount: 2,
    miniLineCount: 2,
    hasTonguePrefit: true,
    stockfitRatio: "2:1"
  }
}) => {
  // 기본 확대/축소 값 (첫 화면에 조직도가 모두 보이도록 계산한 값)
  const [zoomScale, setZoomScale] = useState<number>(0.4);
  const handleZoomIn = () => setZoomScale((prev) => prev + 0.1);
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.1, prev - 0.1));
  const handleZoomReset = () => setZoomScale(0.4);

  // 드래그 상태 및 스크롤 관리
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    containerRef.current.scrollLeft = dx;
    containerRef.current.scrollTop = dy;
  };

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    const preventWheel = (e: WheelEvent) => {
      if (isDragging) e.preventDefault();
    };
    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  const calculatePositionCount = (position: string): number => {
    const groups = getProcessGroups(config);
    if (position === "MGL") return 1;
    if (position === "VSM") return config.lineCount;
    let total = 0;
    groups.forEach((group) => {
      if (position === "GL") total += group.gl.count;
      else if (position === "TL") total += group.tlGroup.length;
      else if (position === "TM") total += group.tmGroup.length;
    });
    return total * config.lineCount;
  };

  const totalPeople = ["MGL", "VSM", "GL", "TL", "TM"].reduce(
    (acc, pos) => acc + calculatePositionCount(pos),
    0
  );

  const renderOrgChart = (page: string) => {
    switch (page) {
      case "1":
        return (
          <div className="border rounded-lg shadow-sm p-12 mx-auto">
            <div className="flex flex-col items-center">
              <PositionBox title="MGL" subtitle="Plant A" level={0} />
              <MGLConnector lineCount={config.lineCount} />
              <div className="flex flex-row">
                {Array(config.lineCount)
                  .fill(null)
                  .map((_, i) => (
                    <VSMGroup
                      key={i}
                      vsm={{ subtitle: `Line ${i + 1}` }}
                      config={config}
                    />
                  ))}
              </div>
            </div>
          </div>
        );
      case "2":
        return (
          <div className="p-8 border rounded-lg shadow-sm mx-auto">
            <h2 className="text-xl font-bold">페이지 2</h2>
            <p className="mt-4">여기에 페이지 2의 디자인을 구현하세요.</p>
          </div>
        );
      case "3":
        return (
          <div className="p-8 border rounded-lg shadow-sm mx-auto">
            <h2 className="text-xl font-bold">페이지 3</h2>
            <p className="mt-4">여기에 페이지 3의 디자인을 구현하세요.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div
        ref={containerRef}
        className="h-[80%] relative"
        style={{
          overflow: "auto",
          cursor: isDragging ? "grabbing" : "grab",
          width: "100%",
          height: "100%",
          padding: "2rem",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="transition-transform duration-200"
          style={{
            minWidth: `${100 * zoomScale}%`,
            minHeight: `${100 * zoomScale}%`,
            transform: `scale(${zoomScale})`,
          }}
        >
          <div
            className="transform-gpu"
            style={{
              transformOrigin: "0 0",
              padding: "1rem",
              margin: "0 auto",
              width: "fit-content",
            }}
          >
            {renderOrgChart(page)}
          </div>
        </div>
      </div>
      <div className="h-[20%] border-t p-4 bg-white shadow-md flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 py-1 border border-gray-500 rounded hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 py-1 border border-gray-500 rounded hover:bg-gray-100"
          >
            -
          </button>
          <button
            onClick={handleZoomReset}
            className="w-20 h-10 py-1 border border-gray-500 rounded hover:bg-gray-100"
          >
            리셋
          </button>
        </div>
        <div className="flex items-center gap-4 h-40">
          <div className="fixed right-12 bottom-8 bg-white p-4 rounded-lg shadow-lg border border-gray-500 w-48">
            <div className="flex items-center gap-2">
              <span className="font-semibold w-20">MGL:</span>
              <div className="bg-gray-100 px-3 py-0.5 rounded">
                {calculatePositionCount("MGL")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold w-20">VSM:</span>
              <div className="bg-gray-100 px-3 py-0.5 rounded">
                {calculatePositionCount("VSM")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold w-20">GL:</span>
              <div className="bg-gray-100 px-3 py-0.5 rounded">
                {calculatePositionCount("GL")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold w-20">TL:</span>
              <div className="bg-gray-100 px-3 py-0.5 rounded">
                {calculatePositionCount("TL")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold w-20">TM:</span>
              <div className="bg-gray-100 px-3 py-0.5 rounded">
                {calculatePositionCount("TM")}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 pt-1 border-t">
              <span className="font-semibold w-20">총 인원수:</span>
              <div className="bg-gray-200 px-3 py-0.5 rounded font-bold">
                {totalPeople}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 내보낼 Config 인터페이스 추가
export interface Config {
  lineCount: number;
  shiftsCount: number;
  miniLineCount: number;
  hasTonguePrefit: boolean;
  stockfitRatio: string;
}
  
// 내보낼 getProcessGroups 함수 추가
export function getProcessGroups(config: Config) {
  return [
    {
      gl: { subtitle: "Cutting-Prefit", count: 1 },
      tlGroup: Array(config.shiftsCount)
        .fill(null)
        .map((_, idx) => ({ subtitle: `No-sew Shift ${idx + 1}` })),
      tmGroup: Array(config.shiftsCount)
        .fill(null)
        .map((_, idx) => ({ subtitle: `MH to No-sew Shift ${idx + 1}` })),
    },
    {
      gl: { subtitle: "Stitching", count: 1 },
      tlGroup: [
        ...Array(config.miniLineCount)
          .fill(null)
          .map((_, idx) => ({ subtitle: `Mini Line ${idx + 1}` })),
        { subtitle: "Tongue Prefit" },
      ],
      tmGroup: Array(config.miniLineCount)
        .fill(null)
        .map((_, idx) => ({ subtitle: `MH to Stitching ${idx + 1}` })),
    },
    {
      gl: { subtitle: "Stockfit", count: 1 },
      tlGroup:
        config.stockfitRatio === "1:1"
          ? [{ subtitle: "Stockfit" }]
          : [{ subtitle: "Stockfit Input" }, { subtitle: "Stockfit Output" }],
      tmGroup: [{ subtitle: "MH → Assembly" }],
    },
    {
      gl: { subtitle: "Assembly", count: 1 },
      tlGroup: [
        { subtitle: "Input" },
        { subtitle: "Cementing" },
        { subtitle: "Finishing" },
      ],
      tmGroup: [
        { subtitle: "MH → Assembly" },
        { subtitle: "MH → FG WH" },
        { subtitle: "MH → Last" },
      ],
    },
  ];
}
