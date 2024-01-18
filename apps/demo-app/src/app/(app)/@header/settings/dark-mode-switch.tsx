"use client"

import * as React from "react"
import { Switch } from "@superplexo/ui/switch";
import { Label } from "@superplexo/ui/label";

import { useTheme } from "next-themes";

export function DarkModeSwitch() {
  const { setTheme, theme } = useTheme()

  console.log(theme)
  return (<div className="flex items-center space-x-2">
    <Switch id="dark-mode" onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
    <Label htmlFor="dark-mode">Dark Mode</Label>
  </div>
  )

}

