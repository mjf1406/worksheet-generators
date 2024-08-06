"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  User,
  ChevronDown,
  ChevronUp,
  Newspaper,
  School,
  Wrench,
} from "lucide-react";
import UserAndTheme from "./UserAndTheme";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleSidebar = () => setIsOpen(!isOpen);
  // Assuming your categories are strings, if not, replace string with the appropriate type
  const toggleCategory = (category: string | null) => {
    setExpandedCategory((prevCategory) =>
      prevCategory === category ? null : category,
    );
  };

  const navItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      items: ["Overview", "Analytics", "Reports"],
    },
    {
      name: "Classes",
      icon: <School className="h-4 w-4" />,
      items: ["Class 1", "Class 2"],
    },
    {
      name: "Tools",
      icon: <Wrench className="h-4 w-4" />,
      items: [
        "Chromebook Assigner",
        "Classroom Jobs",
        "Classroom Clock",
        "Shuffler",
        "Random Picker",
        "Reading Passage Generator",
      ],
    },
    {
      name: "Worksheets",
      icon: <Newspaper className="h-4 w-4" />,
      items: [
        "Word Search",
        "Scramble Words",
        "Cloze",
        "Crossword",
        "Custom",
        "Vocabulary Hunt",
      ],
    },
    // Add more items as needed
  ];

  const bottomItems = [
    {
      name: "Account",
      icon: <User className="h-4 w-4" />,
    },
    {
      name: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className={`flex h-screen flex-col bg-foreground/10 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
    >
      <Button
        onClick={toggleSidebar}
        className="flex w-full justify-center p-2"
      >
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      <nav className="flex-grow overflow-y-auto">
        {navItems.map((item) => (
          <Collapsible
            key={item.name}
            open={expandedCategory === item.name && isOpen}
          >
            <CollapsibleTrigger
              className="flex w-full items-center p-2 hover:bg-accent hover:text-background"
              onClick={() => toggleCategory(item.name)}
            >
              {item.icon}
              {isOpen && (
                <>
                  <span className="ml-2">{item.name}</span>
                  {expandedCategory === item.name ? (
                    <ChevronUp className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  )}
                </>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {item.items
                .sort((a, b) => a.localeCompare(b))
                .map((subItem) => (
                  <Button
                    key={subItem}
                    variant="ghost"
                    className="w-full justify-start pl-8"
                  >
                    {subItem}
                  </Button>
                ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>

      <div className="mt-auto">
        {bottomItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="w-full justify-start p-2"
          >
            {item.icon}
            {isOpen && <span className="ml-2">{item.name}</span>}
          </Button>
        ))}
        <div className="flex flex-row items-center justify-start">
          <UserAndTheme />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
