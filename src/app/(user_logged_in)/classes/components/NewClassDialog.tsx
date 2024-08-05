"use client";

import { Plus, Info, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "@clerk/nextjs";
import insertClass, { type CSVStudent } from "~/server/actions/insertClass";
import React, { useState } from "react";
import type { Data, ClassGrade, Role } from "~/server/actions/insertClass";
import { useToast } from "~/components/ui/use-toast";
// import EventBus from "~/lib/EventBus";
import Link from "next/link";
import { useRouter } from "next/navigation";
function csvToJson(csvString: string): CSVStudent[] {
  const lines = csvString.split("\n");
  const result: CSVStudent[] = [];
  const headers = lines[0]?.split(",") ?? [];

  for (let i = 1; i < lines.length; i++) {
    const obj: CSVStudent = {};
    const currentLine = lines[i]?.split(",") ?? [];

    if (
      headers.length > 0 &&
      currentLine &&
      currentLine.length === headers.length
    ) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]?.trim();
        if (header === undefined) continue;
        obj[header] = currentLine[j]?.trim() ?? "";
      }
      result.push(obj);
    }
  }
  return result;
}

export default function NewClassDialog() {
  const router = useRouter();
  const { userId } = useAuth();
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [classLanguage, setClassLanguage] = useState("en"); // Default to English
  const [classYear, setClassYear] = useState("");
  const [teacherRole, setTeacherRole] = useState("primary"); // Default to primary
  const [open, setOpen] = useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isCsvValid, setCsvValid] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateCsv = (file: File | null) => {
    if (!file) {
      console.error("Failed to create class:");
      toast({
        variant: "destructive",
        title: "Failed to create the class!",
        description: "Please upload a file.",
      });
      throw new Error("Please upload a file");
    }
    setFile(file ?? null);
    const reader = new FileReader();
    reader.onload = async function (event) {
      const text = event?.target?.result as string;
      let data = csvToJson(text);
      data = data.filter(
        (i) => i.name_en != "" && i.name_alt != "" && i.grade != "",
      );
      console.log("🚀 ~ data:", data);
      let isValid = false;
      for (const student of data) {
        if (
          !student.number ||
          !student.sex ||
          !student.name_en ||
          !student.grade ||
          !student.reading_level ||
          student.number === null ||
          student.sex === null ||
          student.name_en === null ||
          student.grade === null ||
          student.reading_level === null ||
          student.number === "" ||
          student.sex === "" ||
          student.name_en === "" ||
          student.grade === "" ||
          student.reading_level === ""
        ) {
          const errorMsg =
            "One (or more) of the required fields is (are) empty. The required fields are number, sex, and name_en.";
          console.error("Failed to create class:", errorMsg);
          toast({
            variant: "destructive",
            title: "Invalid CSV!",
            description: errorMsg,
          });
          isValid = false;
          setCsvValid(false);
          break;
        }
        isValid = true;
      }
      if (isValid) setCsvValid(true);
    };
    reader.readAsText(file);
  };

  const handleCreateClass = async () => {
    if (isCsvValid === false) {
      const errorMsg =
        "Invalid CSV: One (or more) of the required fields is (are) empty. The required fields are number, sex, and name_en.";
      console.error("Failed to create class:", errorMsg);
      return toast({
        variant: "destructive",
        title: "Failed to create class!",
        description: errorMsg,
      });
    }
    if (!userId) {
      alert("User not authenticated.");
      return;
    }
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    if (!className || className === "") {
      alert("Please input a class name");
      return;
    }

    const reader = new FileReader();
    reader.onload = async function (event) {
      const text = event?.target?.result;
      const newClass: Data = {
        class_id: undefined,
        class_name: className,
        class_language: classLanguage,
        class_grade: classGrade as ClassGrade,
        class_year: classYear,
        role: teacherRole as Role,
        fileContents: String(text),
      };

      try {
        setLoading(true);
        await insertClass(newClass, userId, false);
        setOpen(false);
        toast({
          title: "Class created successfully!",
          description: `${className} was successfully created with you as ${teacherRole} teacher.`,
        });
        // EventBus.emit("classAdded", newClass);
        try {
          router.prefetch("/classes");
          router.push("/classes");
          router.refresh();
          window.location.href = "/classes";
        } catch (error) {
          const err = error as Error;
          console.error("Failed to refresh page:", err);
          throw new Error("Failed to refresh page:", err);
        }
      } catch (error) {
        setLoading(false);
        console.error("Failed to create class:", error);
        toast({
          variant: "destructive",
          title: "Failed to create the class!",
          description: "Please try again.",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <span className="pr-2">
              <Plus></Plus>
            </span>
            New Class
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new class</DialogTitle>
            <DialogDescription>
              Create a new class to add to your class list.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-start gap-2 space-x-2">
            <h2 className="flex items-center gap-1 text-2xl">
              Step 1
              <span className="">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info width={18}></Info>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        <b>
                          Where&apos;s the Google Classroom import? Why must I
                          use Google Sheets?
                        </b>{" "}
                        There is no Google Classroom import because importing
                        from Google Classroom does not include the student
                        number. So, you would have to add this on the website,
                        which I think has more friction than using Google Sheets
                        because it&apos;s probable that teachers already have 2
                        or 3 out of the 4 columns available in a Google Sheet.{" "}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </h2>
            <span className="no-wrap inline-block">
              Make a copy of and fill out the
              <Link
                href={
                  "https://docs.google.com/spreadsheets/d/1mI61R0IS04-8ALMWC5_NLkKZVNkjJas2ylj5V7cb0D8/edit?usp=sharing"
                }
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center underline"
              >
                Class Template <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </span>
            <span className="text-xs font-normal">
              The field <i>name_alt</i> is optional.
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 space-x-2">
            <h2 className="text-2xl">Step 2</h2>
            <p>
              <Label>
                From Google Sheets, download the Class Template as{" "}
                <b>Comma-separated values (.csv)</b>.
              </Label>
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 space-x-2">
            <h2 className="text-2xl">Step 3</h2>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="class-template-upload">
                Upload the Class Template
              </Label>
              <Input
                id="class-template-upload"
                type="file"
                onChange={(e) => {
                  const file =
                    e.target.files && e.target.files.length > 0
                      ? e.target.files[0]
                      : null;
                  validateCsv(file ?? null);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-start space-x-2">
            <h2 className="text-2xl">Step 4</h2>
            <div className="grid flex-1 gap-2">
              <Label htmlFor="class-name" className="flex items-center">
                Class name{" "}
                <span className="pl-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info width={16}></Info>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is the display name of your class.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </Label>
              <Input
                id="class-name"
                placeholder="Enter class name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col items-start space-x-2">
            <h2 className="text-2xl">Step 5</h2>
            <div className="grid flex-1 gap-2">
              <Label htmlFor="class-name" className="flex items-center">
                Class grade{" "}
                <span className="pl-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info width={16}></Info>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Choose your grade so you can compare to the other
                          classes therein.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </Label>
              <Select onValueChange={setClassGrade}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Class grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col items-start space-x-2">
            <h2 className="text-2xl">Step 6</h2>
            <div className="grid flex-1 gap-2">
              <Label htmlFor="class-name" className="flex items-center">
                Class year{" "}
                <span className="pl-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info width={16}></Info>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The year of this. It is used to load subject comments.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </Label>
              <Input
                id="class-year"
                placeholder="Enter class year"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <DialogFooter>
              {loading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Creating...
                </Button>
              ) : (
                <Button type="submit" onClick={handleCreateClass}>
                  Create class
                </Button>
              )}
            </DialogFooter>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
