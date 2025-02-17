"use client";
import React, { useState, useEffect, useRef } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  PositionBox,
  MGLConnector,
  VSMGroup,
} from "@/components/common/OrganizationTree";

// ---------------------------
// Config 인터페이스
// ---------------------------
export interface Config {
  lineCount: number;
  shiftsCount: number;
  miniLineCount: number;
  hasTonguePrefit: boolean;
  stockfitRatio: string;
  cuttingPrefitCount: number;
  stitchingCount: number;
  stockfitCount: number;
  assemblyCount: number;
}

// ---------------------------
// 초기 값
// ---------------------------
const defaultConfig: Config = {
  lineCount: 4,
  shiftsCount: 2,
  miniLineCount: 2,
  hasTonguePrefit: true,
  stockfitRatio: "2:1",
  cuttingPrefitCount: 1,
  stitchingCount: 1,
  stockfitCount: 1,
  assemblyCount: 1,
};

// ---------------------------
// getProcessGroups 함수
// ---------------------------
function getProcessGroups(config: Config) {
  return [
    {
      gl: { subtitle: "Cutting-Prefit", count: config.cuttingPrefitCount },
      tlGroup: Array(config.shiftsCount)
        .fill(null)
        .map((_, idx) => ({ subtitle: `No-sew Shift ${idx + 1}` })),
      tmGroup: Array(config.shiftsCount)
        .fill(null)
        .map((_, idx) => ({ subtitle: `MH to No-sew Shift ${idx + 1}` })),
    },
    {
      gl: { subtitle: "Stitching", count: config.stitchingCount },
      tlGroup: [
        ...Array(config.miniLineCount)
          .fill(null)
          .map((_, idx) => ({ subtitle: `Mini Line ${idx + 1}` })),
        { subtitle: config.hasTonguePrefit ? "Tongue Prefit" : "No Tongue" },
      ],
      tmGroup: Array(config.miniLineCount)
        .fill(null)
        .map((_, idx) => ({ subtitle: `MH to Stitching ${idx + 1}` })),
    },
    {
      gl: { subtitle: "Stockfit", count: config.stockfitCount },
      tlGroup:
        config.stockfitRatio === "1:1"
          ? [{ subtitle: "Stockfit" }]
          : [{ subtitle: "Stockfit Input" }, { subtitle: "Stockfit Output" }],
      tmGroup: [{ subtitle: "MH → Assembly" }],
    },
    {
      gl: { subtitle: "Assembly", count: config.assemblyCount },
      tlGroup: [{ subtitle: "Input" }, { subtitle: "Cementing" }, { subtitle: "Finishing" }],
      tmGroup: [
        { subtitle: "MH → Assembly" },
        { subtitle: "MH → FG WH" },
        { subtitle: "MH → Last" },
      ],
    },
  ];
}

// ---------------------------
// 메인 컴포넌트
// ---------------------------
export default function Page1() {
  const [config, setConfig] = useState<Config>(defaultConfig);

  // 줌(확대/축소)
  const [zoomScale, setZoomScale] = useState<number>(1); // 초기: 1
  // 패닝(이동)
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 드래그용 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 참조 (상단 컨테이너, 조직도)
  const topContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // 확대/축소 핸들러
  const handleZoomIn = () => setZoomScale((prev) => prev + 0.1);
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.1, prev - 0.1));

  // "리셋"버튼: 다시 자동 맞춤
  const handleZoomReset = () => {
    fitChartToContainer();
  };

  // 드래그 핸들러 (조직도 이동)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 전역 mouseup 등록
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ===== 초기 렌더링 시, 조직도를 상단 컨테이너에 맞춤 =====
  useEffect(() => {
    // 마운트된 직후(조금 늦게) 측정하도록 setTimeout
    const timer = setTimeout(() => {
      fitChartToContainer();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // fitChartToContainer: 상단 컨테이너 크기에 조직도가 '가로/세로' 모두 들어가도록 스케일 계산 + 중앙정렬
  const fitChartToContainer = () => {
    if (!topContainerRef.current || !chartRef.current) return;

    // 우선 scale=1, translate=0으로 해서 실제 크기 측정
    setZoomScale(1);
    setTranslate({ x: 0, y: 0 });

    // 측정을 위해 약간 딜레이 후(react setState 비동기) getBoundingClientRect
    requestAnimationFrame(() => {
      const containerRect = topContainerRef.current!.getBoundingClientRect();
      const chartRect = chartRef.current!.getBoundingClientRect();

      if (chartRect.width === 0 || chartRect.height === 0) return;

      // 컨테이너 대비 조직도 스케일
      const scaleX = containerRect.width / chartRect.width;
      const scaleY = containerRect.height / chartRect.height;
      const newScale = Math.min(scaleX, scaleY);

      // 스케일 적용 후, 조직도 실제 크기
      const scaledWidth = chartRect.width * newScale;
      const scaledHeight = chartRect.height * newScale;

      // 중앙정렬 → (컨테이너 - 스케일적용조직도) / 2
      const offsetX = (containerRect.width - scaledWidth) / 2;
      const offsetY = (containerRect.height - scaledHeight) / 2;

      // 값 적용
      setZoomScale(newScale);
      setTranslate({ x: offsetX, y: offsetY });
    });
  };

  // 조직도 렌더링
  const renderOrgChart = () => {
    return (
      <div className="border rounded-lg shadow-sm p-12 bg-white">
        <div className="flex flex-col items-center">
          {/* 상단 MGL 박스 */}
          <PositionBox title="MGL" subtitle="Plant A" level={0} />
          {/* MGL → VSM 가로 연결 라인 */}
          <MGLConnector lineCount={config.lineCount} />
          {/* VSM 그룹들 (lineCount개) */}
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
  };

  // 인원 수 계산
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

  // 설정 패널
  const renderConfigPanel = () => {
    return (
      <div className="flex flex-col space-y-4">
        {/* 기타 설정 */}
        <div className="flex items-center space-x-4">
          <label className="flex flex-col">
            <span className="text-sm font-semibold">라인 수</span>
            <input
              type="number"
              className="w-20 border p-1 rounded"
              value={config.lineCount}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  lineCount: +e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">쉬프트 수</span>
            <input
              type="number"
              className="w-20 border p-1 rounded"
              value={config.shiftsCount}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  shiftsCount: +e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">미니 라인 수</span>
            <input
              type="number"
              className="w-20 border p-1 rounded"
              value={config.miniLineCount}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  miniLineCount: +e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">Stockfit 비율</span>
            <Select
              size="small"
              value={config.stockfitRatio}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  stockfitRatio: e.target.value as string,
                }))
              }
            >
              <MenuItem value="1:1">1:1</MenuItem>
              <MenuItem value="2:1">2:1</MenuItem>
            </Select>
          </label>
          <label className="flex flex-row items-center space-x-2">
            <span className="text-sm font-semibold">Tongue Prefit</span>
            <input
              type="checkbox"
              checked={config.hasTonguePrefit}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  hasTonguePrefit: e.target.checked,
                }))
              }
            />
          </label>
        </div>
      </div>
    );
  };

  // 실제 JSX
  return (
    <div className="flex flex-col h-screen">
      {/* 상단 컨테이너 (조직도 영역) */}
      <div
        ref={topContainerRef}
        className="relative"
        style={{
          height: "80%", // 상단 80%
          overflow: "hidden", // 스크롤바 대신 드래그 패닝
          backgroundColor: "#f2f2f2",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* 조직도 */}
        <div
          ref={chartRef}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoomScale})`,
            transformOrigin: "0 0",
          }}
        >
          {renderOrgChart()}
        </div>

        {/* 인원 합계창 - 상단 컨테이너 내에 플로팅(absolute) */}
        <div
          className="absolute z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-500 w-48"
          style={{ right: "2rem", bottom: "2rem" }} // 여유 간격
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold w-16">MGL:</span>
            <div className="bg-gray-100 px-2 py-0.5 rounded">
              {calculatePositionCount("MGL")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-16">VSM:</span>
            <div className="bg-gray-100 px-2 py-0.5 rounded">
              {calculatePositionCount("VSM")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-16">GL:</span>
            <div className="bg-gray-100 px-2 py-0.5 rounded">
              {calculatePositionCount("GL")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-16">TL:</span>
            <div className="bg-gray-100 px-2 py-0.5 rounded">
              {calculatePositionCount("TL")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-16">TM:</span>
            <div className="bg-gray-100 px-2 py-0.5 rounded">
              {calculatePositionCount("TM")}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t">
            <span className="font-semibold w-16">총합:</span>
            <div className="bg-gray-200 px-3 py-0.5 rounded font-bold">
              {totalPeople}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 컨테이너 (설정 영역) */}
      <div
        className="p-4 bg-white border-t"
        style={{
          height: "20%", // 하단 20%
        }}
      >
        {/* 줌 버튼들 */}
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

        {/* 설정 패널 */}
        {renderConfigPanel()}
      </div>
    </div>
  );
}
