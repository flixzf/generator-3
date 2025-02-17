"use client";
import React from "react";
import { OrganizationTree, Config } from "@/components/common/OrganizationTree";

// 기본 config 설정
const defaultConfig: Config = {
  lineCount: 4,
  shiftsCount: 2,
  miniLineCount: 2,
  hasTonguePrefit: true,
  stockfitRatio: "2:1"
};

export default function Page3() {
  return <OrganizationTree page="3" config={defaultConfig} />;
} 