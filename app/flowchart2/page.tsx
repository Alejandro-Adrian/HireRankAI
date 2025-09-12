"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Database, Settings, Code, Palette, Shield, Video, Brain, Globe } from "lucide-react"
import Link from "next/link"

export default function FileArchitectureFlowchart() {
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 8)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const FileNode = ({
    x,
    y,
    width = 200,
    height = 80,
    title,
    files,
    color,
    icon: Icon,
    description,
    step,
  }: {
    x: number
    y: number
    width?: number
    height?: number
    title: string
    files: string[]
    color: string
    icon: any
    description: string
    step: number
  }) => (
    <g
      className={`transition-all duration-1000 ${animationStep >= step ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {/* Main container */}
      <rect
        width={width}
        height={height}
        rx="12"
        className={`fill-${color}-500/20 stroke-${color}-400 stroke-2`}
        style={{
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
        }}
      />

      {/* Header */}
      <rect width={width} height="30" rx="12" className={`fill-${color}-500/40`} />

      {/* Icon */}
      <foreignObject x="8" y="5" width="20" height="20">
        <Icon className={`w-5 h-5 text-${color}-300`} />
      </foreignObject>

      {/* Title */}
      <text x="35" y="22" className={`fill-${color}-100 text-sm font-semibold`}>
        {title}
      </text>

      {/* File count badge */}
      <rect x={width - 35} y="8" width="25" height="14" rx="7" className={`fill-${color}-600`} />
      <text x={width - 22} y="18" className="fill-white text-xs font-bold text-center" textAnchor="middle">
        {files.length}
      </text>

      {/* Description */}
      <text x="10" y="50" className="fill-gray-300 text-xs">
        {description}
      </text>

      {/* File examples */}
      <text x="10" y="68" className={`fill-${color}-200 text-xs font-mono`}>
        {files.slice(0, 2).join(", ")}
        {files.length > 2 && "..."}
      </text>
    </g>
  )

  const ConnectionLine = ({
    x1,
    y1,
    x2,
    y2,
    color = "emerald",
    animated = false,
    step,
  }: {
    x1: number
    y1: number
    x2: number
    y2: number
    color?: string
    animated?: boolean
    step: number
  }) => {
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    const path = `M ${x1} ${y1} Q ${midX} ${midY - 50} ${x2} ${y2}`

    return (
      <g className={`transition-all duration-1000 ${animationStep >= step ? "opacity-100" : "opacity-0"}`}>
        <path d={path} className={`stroke-${color}-400 stroke-2 fill-none`} strokeDasharray={animated ? "5,5" : "none"}>
          {animated && <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />}
        </path>
        <circle cx={x2} cy={y2} r="4" className={`fill-${color}-400`} />
      </g>
    )
  }

  const fileGroups = [
    {
      title: "Configuration",
      files: [
        "package.json",
        "tsconfig.json",
        "tailwind.config.ts",
        "next.config.mjs",
        "components.json",
        "postcss.config.mjs",
        ".env.local.example",
        ".gitignore",
      ],
      color: "blue",
      icon: Settings,
      description: "Project setup & build configuration",
      x: 50,
      y: 50,
      step: 0,
    },
    {
      title: "App Router Pages",
      files: [
        "app/page.tsx",
        "app/layout.tsx",
        "app/dashboard/page.tsx",
        "app/algorithm/page.tsx",
        "app/flowchart/page.tsx",
        "app/rankings/create/page.tsx",
        "app/apply/[linkId]/page.tsx",
        "app/video-call/[meetingId]/page.tsx",
      ],
      color: "emerald",
      icon: Globe,
      description: "Next.js 13+ App Router pages & layouts",
      x: 300,
      y: 50,
      step: 1,
    },
    {
      title: "Authentication APIs",
      files: [
        "app/api/auth/login/route.ts",
        "app/api/auth/signup/route.ts",
        "app/api/auth/reset-password/route.ts",
        "app/api/auth/forgot-password/route.ts",
        "app/api/auth/verify-reset-code/route.ts",
        "app/api/auth/check-verification/route.ts",
        "app/api/auth/profile/route.ts",
        "app/api/auth/update-profile/route.ts",
      ],
      color: "purple",
      icon: Shield,
      description: "User authentication & session management",
      x: 550,
      y: 50,
      step: 2,
    },
    {
      title: "Application APIs",
      files: [
        "app/api/applications/route.ts",
        "app/api/applications/[id]/route.ts",
        "app/api/applications/[id]/score/route.ts",
        "app/api/applications/[id]/approve/route.ts",
        "app/api/applications/[id]/interview/route.ts",
      ],
      color: "orange",
      icon: FileText,
      description: "Job application CRUD & processing",
      x: 800,
      y: 50,
      step: 3,
    },
    {
      title: "Ranking APIs",
      files: [
        "app/api/rankings/route.ts",
        "app/api/rankings/[id]/route.ts",
        "app/api/rankings/[id]/applications/route.ts",
        "app/api/rankings/[id]/score-all/route.ts",
        "app/api/rankings/[id]/delete/route.ts",
      ],
      color: "red",
      icon: Database,
      description: "Ranking system management & scoring",
      x: 1050,
      y: 50,
      step: 4,
    },
    {
      title: "Video Call APIs",
      files: [
        "app/api/video-sessions/route.ts",
        "app/api/video-sessions/jitsi/route.ts",
        "app/api/signaling/offer/route.ts",
        "app/api/signaling/answer/route.ts",
        "app/api/signaling/ice-candidate/route.ts",
      ],
      color: "cyan",
      icon: Video,
      description: "Jitsi video call integration & WebRTC signaling",
      x: 1300,
      y: 50,
      step: 5,
    },
    {
      title: "Main Components",
      files: [
        "components/Dashboard.tsx",
        "components/ApplicationForm.tsx",
        "components/LoginForm.tsx",
        "components/SignupForm.tsx",
        "components/RankingBuilder.tsx",
        "components/ResultsDashboard.tsx",
        "components/VideoCallManager.tsx",
        "components/Settings.tsx",
      ],
      color: "emerald",
      icon: Code,
      description: "Core React components & UI logic",
      x: 50,
      y: 200,
      step: 1,
    },
    {
      title: "Ranking Steps",
      files: [
        "components/ranking-steps/JobPositionStep.tsx",
        "components/ranking-steps/CriteriaSelectionStep.tsx",
        "components/ranking-steps/CriteriaWeightingStep.tsx",
        "components/ranking-steps/ReviewStep.tsx",
      ],
      color: "indigo",
      icon: Code,
      description: "Multi-step ranking wizard components",
      x: 300,
      y: 200,
      step: 2,
    },
    {
      title: "UI Components",
      files: [
        "components/ui/button.tsx",
        "components/ui/card.tsx",
        "components/ui/input.tsx",
        "components/ui/form.tsx",
        "components/ui/dialog.tsx",
        "components/ui/badge.tsx",
        "components/ui/navigation.tsx",
        "...35 total",
      ],
      color: "pink",
      icon: Palette,
      description: "Shadcn/ui design system components",
      x: 550,
      y: 200,
      step: 3,
    },
    {
      title: "AI/ML Services",
      files: [
        "lib/advanced-ocr-service.ts",
        "lib/simple-resume-parser.ts",
        "lib/intelligent-scoring-service.ts",
        "lib/direct-scoring-service.ts",
        "lib/real-scoring.ts",
        "lib/scoring-service.ts",
        "lib/duplicate-detection.ts",
        "lib/position-skills-reference.ts",
      ],
      color: "violet",
      icon: Brain,
      description: "AI-powered resume analysis & scoring",
      x: 800,
      y: 200,
      step: 4,
    },
    {
      title: "Core Services",
      files: [
        "lib/supabase.ts",
        "lib/storage.ts",
        "lib/email.tsx",
        "lib/utils.ts",
        "lib/connection-manager.ts",
        "supabase/client.ts",
        "supabase/server.ts",
        "supabase/middleware.ts",
      ],
      color: "teal",
      icon: Database,
      description: "Database, storage & utility services",
      x: 1050,
      y: 200,
      step: 5,
    },
    {
      title: "Infrastructure",
      files: [
        "middleware.ts",
        "server.js",
        "hooks/use-mobile.tsx",
        "hooks/use-toast.ts",
        "app/globals.css",
        "styles/globals.css",
      ],
      color: "gray",
      icon: Settings,
      description: "Middleware, hooks & global styles",
      x: 1300,
      y: 200,
      step: 6,
    },
    {
      title: "Database Scripts",
      files: ["scripts/setup_database.sql", "scripts/reset_database.sql"],
      color: "yellow",
      icon: Database,
      description: "Database initialization & management",
      x: 50,
      y: 350,
      step: 0,
    },
    {
      title: "Documentation",
      files: ["README.md", "DEPLOYMENT.md", "docs/system-flowchart.jpg"],
      color: "green",
      icon: FileText,
      description: "Project documentation & guides",
      x: 300,
      y: 350,
      step: 1,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4">
      {/* Header */}
      <div className="w-full mb-8">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-emerald-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">File Architecture Map</h1>
                <p className="text-emerald-300">Complete system file structure and purposes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/flowchart">
                <Button
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 bg-transparent"
                >
                  System Flow
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <div className="w-full mb-8">
        <Card className="bg-slate-800/30 backdrop-blur-sm border-emerald-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">File Categories</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/40 border border-blue-400 rounded"></div>
              <span className="text-blue-300 text-sm">Configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500/40 border border-emerald-400 rounded"></div>
              <span className="text-emerald-300 text-sm">Pages & Components</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500/40 border border-purple-400 rounded"></div>
              <span className="text-purple-300 text-sm">Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500/40 border border-orange-400 rounded"></div>
              <span className="text-orange-300 text-sm">Applications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-violet-500/40 border border-violet-400 rounded"></div>
              <span className="text-violet-300 text-sm">AI/ML Services</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500/40 border border-cyan-400 rounded"></div>
              <span className="text-cyan-300 text-sm">Video Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500/40 border border-teal-400 rounded"></div>
              <span className="text-teal-300 text-sm">Core Services</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Flowchart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1600px] h-[500px] relative">
          <svg
            width="1600"
            height="500"
            className="w-full h-full"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
            }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connection lines showing relationships */}
            <ConnectionLine x1={250} y1={90} x2={300} y2={90} step={1} animated />
            <ConnectionLine x1={500} y1={90} x2={550} y2={90} step={2} animated />
            <ConnectionLine x1={750} y1={90} x2={800} y2={90} step={3} animated />
            <ConnectionLine x1={1000} y1={90} x2={1050} y2={90} step={4} animated />
            <ConnectionLine x1={1250} y1={90} x2={1300} y2={90} step={5} animated />

            {/* Vertical connections */}
            <ConnectionLine x1={150} y1={130} x2={150} y2={200} step={1} />
            <ConnectionLine x1={400} y1={130} x2={400} y2={200} step={2} />
            <ConnectionLine x1={650} y1={130} x2={650} y2={200} step={3} />
            <ConnectionLine x1={900} y1={130} x2={900} y2={200} step={4} />
            <ConnectionLine x1={1150} y1={130} x2={1150} y2={200} step={5} />
            <ConnectionLine x1={1400} y1={130} x2={1400} y2={200} step={6} />

            {/* Bottom row connections */}
            <ConnectionLine x1={150} y1={280} x2={150} y2={350} step={0} />
            <ConnectionLine x1={250} y1={280} x2={300} y2={350} step={1} />

            {/* File group nodes */}
            {fileGroups.map((group, index) => (
              <FileNode
                key={index}
                x={group.x}
                y={group.y}
                title={group.title}
                files={group.files}
                color={group.color}
                icon={group.icon}
                description={group.description}
                step={group.step}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* File Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fileGroups.map((group, index) => (
          <Card key={index} className="bg-slate-800/30 backdrop-blur-sm border-emerald-500/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 bg-${group.color}-500/20 rounded-lg`}>
                <group.icon className={`w-5 h-5 text-${group.color}-400`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{group.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {group.files.length} files
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-3">{group.description}</p>
            <div className="space-y-1">
              {group.files.slice(0, 5).map((file, fileIndex) => (
                <div key={fileIndex} className="text-xs font-mono text-gray-400 bg-slate-700/30 px-2 py-1 rounded">
                  {file}
                </div>
              ))}
              {group.files.length > 5 && (
                <div className="text-xs text-gray-500 italic">+{group.files.length - 5} more files...</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <div className="mt-8">
        <Card className="bg-slate-800/30 backdrop-blur-sm border-emerald-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">174+</div>
              <div className="text-sm text-gray-400">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">42</div>
              <div className="text-sm text-gray-400">API Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">50+</div>
              <div className="text-sm text-gray-400">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">8</div>
              <div className="text-sm text-gray-400">Core Services</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
