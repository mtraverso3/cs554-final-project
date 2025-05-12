"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BookOpenIcon,
  HomeIcon,
  LayersIcon,
  LogOut,
  SettingsIcon,
  User,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const appLinks = [
  {
    name: "Home",
    url: "/user/home",
    icon: <HomeIcon />,
  },
  {
    name: "Flashcard Library",
    url: "/user/flashcard-library",
    icon: <LayersIcon />,
  },
  {
    name: "Quiz Library",
    url: "/user/quiz-library",
    icon: <BookOpenIcon />,
  },
];

export function UserSidebar({ user }: { user: { name: string } }) {
  const {
    // state,
    open,
    // setOpen,
    // openMobile,
    // setOpenMobile,
    // isMobile,
    // toggleSidebar,
  } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {open ? (
            <div className="px-4 py-2 text-lg whitespace-nowrap overflow-hidden truncate">
              Hello, {user.name}
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <UserIcon />
            </div>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            {appLinks.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Explore Public</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/user/explore/decks">
                  <LayersIcon />
                  <span>Explore Decks</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/user/explore/quizzes">
                  <BookOpenIcon />
                  <span>Explore Quizzes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/user/profile">
                  <User />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/user/settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/auth/logout">
                  <LogOut />
                  <span>Logout</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
