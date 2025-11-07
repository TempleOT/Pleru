"use client";

import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { ArrowLeft, Plus, User, Edit3 } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type BlueprintProfile = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  location: string;
};

// for the life-cycle section
type LifeCycle = {
  id: string;
  source: "numerology" | "human-design" | "astrology";
  title: string;
  start: string;
  end: string;
  frequency: string;
  lesson
