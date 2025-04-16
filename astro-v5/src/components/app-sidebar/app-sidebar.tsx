"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar.tsx";
import {ElectoralPeriodSwitcher} from "@/components/app-sidebar/electoral-period-switcher.tsx";
import type {Registry} from "@/model/registry.ts";


type Props = React.ComponentProps<typeof Sidebar> & {
    electoralPeriods: Registry[];
    electoralPeriod: Registry;
};


export default function AppSidebar({ electoralPeriods, electoralPeriod, ...props }: Props) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ElectoralPeriodSwitcher electoralPeriods={electoralPeriods} currentElectoralPeriod={electoralPeriod} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={`/ep/${electoralPeriod.id}/sessions`}>Sitzungen</a>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <a href={`/ep/${electoralPeriod.id}/factions`}>Fraktionen</a>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <a href={`/ep/${electoralPeriod.id}/parties`}>Parteien</a>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <a href={`/ep/${electoralPeriod.id}/persons`}>Personen</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
