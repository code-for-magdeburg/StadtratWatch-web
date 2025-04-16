"use client";

import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import React from "react";


export type BreadcrumbMenuItem = {
  title: string;
  url: string;
}

type Props = {
  electoralPeriodId: string;
  breadcrumbMenuItems: BreadcrumbMenuItem[];
  currentPageTitle: string;
};

export default function AppHeader({ electoralPeriodId, breadcrumbMenuItems, currentPageTitle }: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/ep/${electoralPeriodId}`}>Startseite</BreadcrumbLink>
          </BreadcrumbItem>
          {
            breadcrumbMenuItems.map((menuItem: BreadcrumbMenuItem, index: number) =>
              <React.Fragment key={index}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href={menuItem.url}>{menuItem.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            )
          }
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
