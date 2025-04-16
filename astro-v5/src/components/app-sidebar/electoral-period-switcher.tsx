"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type {Registry} from "@/model/registry.ts";

export function ElectoralPeriodSwitcher({
                                          electoralPeriods,
                                          currentElectoralPeriod
}: {
  electoralPeriods: Registry[]
  currentElectoralPeriod: Registry
}) {
  const [selectedElectoralPeriod, setSelectedElectoralPeriod] = React.useState(currentElectoralPeriod)

  const switchElectoralPeriod = (electoralPeriod: Registry) => {
    setSelectedElectoralPeriod(electoralPeriod)
    window.location.href = `/ep/${electoralPeriod.id}`
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-lg">StadtratWatch</span>
                <span className="text-muted-foreground">{selectedElectoralPeriod.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {electoralPeriods.map((electoralPeriod) => (
              <DropdownMenuItem
                key={electoralPeriod.id}
                onSelect={() => switchElectoralPeriod(electoralPeriod)}
              >
                {electoralPeriod.name}{" "}
                {electoralPeriod.id === currentElectoralPeriod.id && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
