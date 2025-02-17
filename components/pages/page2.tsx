"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { PositionBox, VerticalLine, MultiColumnDepartmentSection } from "@/components/common/OrganizationTree";

// === [1] Config 인터페이스 ===
interface Config {
  lineCount: number;      // 라인 수 (1 ~ 10 등)
  shiftsCount: number;    // 쉬프트 수
  miniLineCount: number;  // 미니라인 수
  hasTonguePrefit: boolean;
  stockfitRatio: string;
}

// === [2] Page2 컴포넌트 ===
const Page2: React.FC = () => {
  // 다(多)컬럼으로 표현할 부서 리스트 - 컴포넌트 최상단에 정의
  const multiColumnDepts = ["FG WH", "Bottom Market"];

  // Config 상태 추가
  const [config, setConfig] = useState<Config>({
    lineCount: 4,
    shiftsCount: 2,
    miniLineCount: 2,
    hasTonguePrefit: true,
    stockfitRatio: "2:1"
  });

  // === (A) 확대/축소 & 패닝(드래그) 관련 ===
  const [zoomScale, setZoomScale] = useState<number>(0.8); // 초기값 (조금 더 크게)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomScale((prev) => prev + 0.1);
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.1, prev - 0.1));
  const handleZoomReset = () => setZoomScale(0.8);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 마우스 가운데(또는 왼쪽) 버튼으로 드래그 시작
    if (e.button === 1 || e.button === 0) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    containerRef.current.scrollLeft = scrollPos.x - dx;
    containerRef.current.scrollTop = scrollPos.y - dy;
  };
  const handleMouseUp = useCallback(() => {
    if (isDragging && containerRef.current) {
      setScrollPos({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop,
      });
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    // 드래그 중 휠 스크롤 방지
    const preventWheel = (ev: WheelEvent) => {
      if (isDragging) ev.preventDefault();
    };
    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  // === (B) 라인 수에 따라 달라지는 TM 처리 ===
  // 1) 일반적인 "Line X" 식
  const makeSingleLines = (count: number, prefix: string = 'Line ') =>
    Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);

  // 2) 2라인씩 묶는 "Line 1-2", "Line 3-4", ... (홀수 남으면 단독)
  const makeDoubleLines = (count: number, prefix: string = 'Line ') => {
    const result: string[] = [];
    let i = 1;
    while (i <= count) {
      if (i + 1 <= count) {
        // 2개씩 묶음
        result.push(`${prefix}${i}-${i + 1}`);
        i += 2;
      } else {
        // 홀수 남으면 단독
        result.push(`${prefix}${i}`);
        i += 1;
      }
    }
    return result;
  };

  // === (C) 부서 목록 (lineCount 등에 따라 동적 생성) ===
  // 기존 departments를 동적으로 생성
  const departments = React.useMemo(() => {
    return [
      {
        title: ["Admin"],
        tl: [],
        tm: [
          ["Payroll"],
          ["APS"],
          ["Material"],
          ["Production"],
          ["GMES"],
          ["Admin Line 1-2"],
          ["Admin Line 3-4"],
        ],
      },
      {
        title: ["Small Tooling"],
        tl: ["Small Tooling"],
        tm: [["Cutting Die"], ["Pallet"], ["Pad/Mold"]],
      },
      {
        title: ["Raw Material"],
        tl: [],
        // lineCount 만큼 TM
        tm: makeSingleLines(config.lineCount).map((item) => [item]),
      },
      {
        title: ["Sub Material"],
        tl: ["SAP RO"],
        tm: [["Incoming Mgmt."], ["Distribution"]],
      },
      {
        title: ["ACC"],
        tl: ["ACC"],
        tm: makeSingleLines(config.lineCount).map((item) => [item]),
      },
      {
        title: "P&L",
        tl: ["P&L"],
        tm: [
          // 첫 번째 배열(0번)은 "Stencil" 라인들 (2라인씩 묶기)
          makeDoubleLines(config.lineCount).map(line => `Stencil ${line}`),
          // 두 번째는 고정
          ["Incoming & Setting"],
          // 세 번째는 역시 lineCount만큼 "Line 1" ... 생성
          makeSingleLines(config.lineCount),
        ],
      },
      {
        title: ["Bottom Market"],
        tl: ["Bottom Market Incoming"],
        tm: [
          // 첫 번째 그룹: Outsole Material Handler
          makeSingleLines(config.lineCount).map(line => `Outsole ${line}`),
          // 두 번째 그룹: Midsole Incoming & Setting
          ["Midsole Incoming & Setting"],         
          makeDoubleLines(config.lineCount).map(line => `Midsole ${line}`),
          // 세 번째 그룹: Midsole Material Handler
          
          // 네 번째 그룹: Airbag & Bottom ACC
          makeSingleLines(config.lineCount).map(line => `Airbag, Bottom ACC Line ${line}`)
        ],
      },
      {
        title: "FG WH",
        tl: ["FG WH"],
        tm: [
          makeSingleLines(4).map(i => `Shipping ${i}`),
          makeSingleLines(4).map(i => `Incoming & Setting ${i}`),
          ["Report"],
          ["Metal Detect"]
          
        ],
      },
    ];
  }, [config]);

  // === (D) TL, TM 레이아웃 계산 (수직 간격 등) ===
  const [dimensions, setDimensions] = useState({
    tlStartY: 0,
    tmStartY: 0,
    totalHeight: 0,
  });

  useEffect(() => {
    const boxHeight = 50;    // PositionBox 높이
    const verticalGap = 20;  // 박스 간 간격
    const glToTlGap = 20;    // GL 아래 TL 시작점
    const tlStartY = glToTlGap;

    // 가장 TM이 많은(=2차원 배열의 총 길이가 가장 큰) 부서 찾기
    const maxTmCount = Math.max(
      ...departments.map((dept) =>
        dept.tm.reduce((acc, arr) => acc + arr.length, 0)
      )
    );

    // TL이 1~2줄 있다는 가정으로, TM 시작을 tlStartY + 2박스 정도 아래
    const tmStartY = tlStartY + (boxHeight + verticalGap) * 2;

    // 전체 높이
    const totalHeight =
      tmStartY + boxHeight * maxTmCount + verticalGap * (maxTmCount - 1);

    setDimensions({ tlStartY, tmStartY, totalHeight });
  }, [departments]);

  // === (E) 인원 합계창에 표시할 "부서별 계산" (간단 예: 부서 수 / TL, TM 총합 등)
  // 일단은 Page1처럼 MGL/GL/TL/TM 합산 개념만 예시
  // calculateDepartmentCount 함수 삭제

  // === (F) DepartmentSection(부서별 TL/TM) 렌더링 컴포넌트 ===
  const DepartmentSection: React.FC<{
    title: string | string[];
    tlData: string[];
    tmData: string[][];
    tlStartY: number;
    tmStartY: number;
  }> = ({ title, tlData, tmData, tlStartY, tmStartY }) => {
    // title이 문자열인 경우(단일 부서명)와 배열인 경우(복수 표현) 모두 고려
    const isMultiColumnDept =
      (typeof title === "string" && multiColumnDepts.includes(title)) ||
      (Array.isArray(title) && title.some(t => multiColumnDepts.includes(t)));

    if (isMultiColumnDept) {
      return (
        <MultiColumnDepartmentSection
          tlData={tlData}
          tmData={tmData}
          tlStartY={tlStartY}
          tmStartY={tmStartY}
        />
      );
    }

    // 일반적인 단일 컬럼 부서의 경우
    return (
      <div className="flex flex-col items-center mx-4 relative">
        {tlData.length > 0 && (
          <div style={{ position: "absolute", top: `${tlStartY}px` }}>
            {tlData.map((tl, index) => (
              <div key={index} className="flex flex-col items-center">
                <PositionBox title="TL" subtitle={tl} level={3} />
                <VerticalLine height={20} />
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "absolute", top: `${tmStartY}px` }}>
          {(
            tlData.length > 0
              ? tmData
              : tmData.map((arr) => [arr[0]])
          ).map((tmArr, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              {tmArr.map((tmItem, tmIndex) => (
                <PositionBox key={tmIndex} title="TM" subtitle={tmItem} level={4} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // === (G) 실제 JSX 반환 ===
  return (
    <div className="flex flex-col h-screen relative">
      {/* 상단 컨테이너 */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          height: "80%",
          overflow: "hidden",
          backgroundColor: "#f2f2f2",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* 조직도 */}
        <div
          className="transition-transform duration-200"
          style={{
            minWidth: "fit-content",  // 내용물 크기에 맞춤
            minHeight: `${100 * zoomScale}%`,
          }}
        >
          <div
            className="transform-gpu"
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: "0 0",
              padding: "1rem",
              margin: "0",
              width: "max-content",
            }}
          >
            {/* 실제 조직도 */}
            <div
              className="flex flex-col items-center relative"
              style={{ 
                minHeight: dimensions.totalHeight + 200,
                width: "max-content"
              }}
            >
              {/* 최상단: MGL */}
              <PositionBox title="MGL" subtitle="Plant A" level={0} />
              <VerticalLine height={40} />

              {/* 부서(GL) */}
              <div className="flex flex-row justify-center flex-wrap">
                {departments.map((dept, index) => {
                  // 다컬럼 부서인 경우에만 간격 계산 적용
                  const isMultiColumn = 
                    (typeof dept.title === "string" && multiColumnDepts.includes(dept.title)) ||
                    (Array.isArray(dept.title) && dept.title.some(t => multiColumnDepts.includes(t)));

                  const tmArrayCount = isMultiColumn ? dept.tm.length : 0;
                  const baseGap = 1.5;
                  const minGap = 1;  // 기본 최소 간격
                  const gapMultiplier = 4.9;
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center relative"
                      style={{ 
                        minHeight: dimensions.totalHeight,
                        marginLeft: `${Math.max(minGap, baseGap + (tmArrayCount * gapMultiplier))}rem`,
                        marginRight: `${Math.max(minGap, baseGap + (tmArrayCount * gapMultiplier))}rem`,
                      }}
                    >
                      {typeof dept.title === "string" ? (
                        <PositionBox title="GL" subtitle={dept.title} level={2} />
                      ) : Array.isArray(dept.title) && dept.title.length > 0 ? (
                        <PositionBox 
                          title="" 
                          subtitle={dept.title.join(" ")} 
                          level={2} 
                          className="bg-white border border-white text-[2em] font-bold"
                        />
                      ) : null}
                      <VerticalLine height={20} />
                      <DepartmentSection
                        title={dept.title}
                        tlData={dept.tl}
                        tmData={dept.tm}
                        tlStartY={dimensions.tlStartY}
                        tmStartY={dimensions.tmStartY}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 인원 합계창 - 최상위 div에 대해 absolute 위치 지정 */}
      <div
        className="absolute z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-500"
        style={{ 
          right: "2rem", 
          bottom: "calc(20% + 2rem)",  // 하단 컨테이너(20%) + 여백
          width: "12rem"  // w-48과 동일
        }}
      >
        {/* MGL */}
        <div className="flex items-center gap-2">
          <span className="font-semibold w-16">MGL:</span>
          <div className="bg-gray-100 px-2 py-0.5 rounded">
            {1}
          </div>
        </div>
        {/* GL */}
        <div className="flex items-center gap-2">
          <span className="font-semibold w-16">GL:</span>
          <div className="bg-gray-100 px-2 py-0.5 rounded">
            {departments.length}
          </div>
        </div>
        {/* TL */}
        <div className="flex items-center gap-2">
          <span className="font-semibold w-16">TL:</span>
          <div className="bg-gray-100 px-2 py-0.5 rounded">
            {departments.reduce((acc, dept) => acc + dept.tl.length, 0)}
          </div>
        </div>
        {/* TM */}
        <div className="flex items-center gap-2">
          <span className="font-semibold w-16">TM:</span>
          <div className="bg-gray-100 px-2 py-0.5 rounded">
            {departments.reduce((acc, dept) => acc + dept.tm.reduce((sum, arr) => sum + arr.length, 0), 0)}
          </div>
        </div>
        {/* 총합 */}
        <div className="flex items-center gap-2 mt-1 pt-1 border-t">
          <span className="font-semibold w-16">총합:</span>
          <div className="bg-gray-200 px-3 py-0.5 rounded font-bold">
            {departments.length + departments.reduce((acc, dept) => acc + dept.tl.length, 0) + departments.reduce((acc, dept) => acc + dept.tm.reduce((sum, arr) => sum + arr.length, 0), 0)}
          </div>
        </div>
      </div>

      {/* 하단 컨테이너 */}
      <div className="p-4 bg-white border-t" style={{ height: "20%" }}>
        {/* (1) 확대/축소 버튼: 좌상단 */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 border border-gray-500 rounded hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 border border-gray-500 rounded hover:bg-gray-100"
          >
            -
          </button>
          <button
            onClick={handleZoomReset}
            className="w-20 h-10 border border-gray-500 rounded hover:bg-gray-100"
          >
            리셋
          </button>
        </div>

        {/* (3) config 설정 패널 */}
        <div className="flex items-center gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-semibold">라인 수</span>
            <input
              type="number"
              className="w-20 border p-1 rounded"
              value={config.lineCount}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, lineCount: +e.target.value }))
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Page2;
