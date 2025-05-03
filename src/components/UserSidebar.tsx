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
import { BookOpenIcon, HomeIcon, LayersIcon, UserIcon } from "lucide-react";
import Link from "next/link";

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
      </SidebarContent>
    </Sidebar>
  );
}
