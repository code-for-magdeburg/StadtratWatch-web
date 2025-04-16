"use client";

import type {Registry} from "@/model/registry.ts";
import * as React from "react"
import AppSidebar from "@/components/app-sidebar/app-sidebar.tsx";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppHeader, {type BreadcrumbMenuItem} from "@/components/app-header/app-header.tsx";


type Props = {
  children: React.ReactNode;
  electoralPeriod: Registry;
  electoralPeriods: Registry[];
  pageTitle: string;
  breadcrumbMenuItems?: BreadcrumbMenuItem[];
};


export default function AppSidebarWrapper(props: Props) {
  const {children, electoralPeriod, electoralPeriods, pageTitle, breadcrumbMenuItems } = props;
  return (
    <SidebarProvider>
      <AppSidebar electoralPeriods={electoralPeriods} electoralPeriod={electoralPeriod} />
      <SidebarInset>
        <AppHeader
          electoralPeriodId={electoralPeriod.id}
          breadcrumbMenuItems={breadcrumbMenuItems ?? []}
          currentPageTitle={pageTitle}
        />
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
