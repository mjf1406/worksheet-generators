"use client";

import React, { Suspense, useState } from "react";
import { Plus, Info, ExternalLink, Loader2 } from "lucide-react";
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
import insertClass, {
  type ClassGrade,
  type Data,
  type Role,
  type CSVStudent,
} from "~/server/actions/insertClass";
import { useToast } from "~/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import GoogleClassList from "./Google/GoogleClassList";
import GoogleClassroomStudentTableDialog from "./Google/GoogleClassroomStudentTableDialog";

export default function NewClassDialog() {
  const router = useRouter();
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "template-upload" | "google-classroom"
  >("template-upload");

  // -- SHARED FIELDS FOR CSV OR GOOGLE CLASSROOM --
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState<ClassGrade>("1");
  const [classLanguage, setClassLanguage] = useState("en");
  const [classYear, setClassYear] = useState("");
  const [teacherRole, setTeacherRole] = useState("primary");

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isCsvValid, setCsvValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // For Google Classroom import:
  const [showGoogleStudentTable, setShowGoogleStudentTable] = useState(false);
  const [selectedGoogleCourseId, setSelectedGoogleCourseId] = useState<
    string | undefined
  >(undefined);

  // -----------------------------
  // CSV VALIDATION & HELPERS
  // -----------------------------
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
    setFile(file);
    const reader = new FileReader();
    reader.onload = async function (event) {
      const text = event?.target?.result as string;
      let data = csvToJson(text);
      console.log("🚀 ~ data:", data);
      data = data.filter(
        (i) => i.name_first_en != "" && i.name_last_en != "" && i.grade != "",
      );
      let isValid = false;
      for (const student of data) {
        if (
          !student.number ||
          !student.sex ||
          !student.name_first_en ||
          !student.name_last_en ||
          !student.grade ||
          !student.reading_level ||
          student.number === null ||
          student.sex === null ||
          student.name_first_en === null ||
          student.name_last_en === null ||
          student.grade === null ||
          student.reading_level === null ||
          student.number === "" ||
          student.sex === "" ||
          student.name_first_en === "" ||
          student.name_last_en === "" ||
          student.grade === "" ||
          student.reading_level === ""
        ) {
          const errorMsg =
            "One (or more) of the required fields is (are) empty. The required fields are number, sex, and name_first_en.";
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

  // -----------------------------
  // CSV SUBMISSION LOGIC
  // -----------------------------
  const handleCreateClassCsv = async () => {
    if (isCsvValid === false) {
      const errorMsg =
        "Invalid CSV: One (or more) of the required fields is (are) empty. The required fields are number, sex, and name_first_en.";
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
        class_grade: classGrade,
        class_year: classYear,
        role: teacherRole as Role,
        fileContents: String(text),
      };

      try {
        setLoading(true);
        await insertClass(newClass, userId, false, "template");
        setOpen(false);
        toast({
          title: "Class created successfully!",
          description: `${className} was successfully created with you as ${teacherRole} teacher.`,
        });
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

  // -----------------------------
  // MAIN 'CREATE CLASS' HANDLER
  // -----------------------------
  const handleCreateClass = async () => {
    if (activeTab === "google-classroom") {
      // We’re on the Google Classroom tab:
      // 1) Validate if a course is selected
      if (!selectedGoogleCourseId) {
        return toast({
          variant: "destructive",
          title: "No Google Classroom selected!",
          description: "Please select a course to import.",
        });
      }
      // 2) Show the fullscreen dialog for editing students
      setShowGoogleStudentTable(true);
      return;
    }

    // Otherwise, handle CSV submission
    await handleCreateClassCsv();
  };

  // Once user is done (or cancels) in the Google Classroom student table
  const handleGoogleTableClose = () => {
    setShowGoogleStudentTable(false);
    setOpen(false);
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <>
      {/* This dialog for editing GClass students appears when showGoogleStudentTable is true */}
      <GoogleClassroomStudentTableDialog
        open={showGoogleStudentTable}
        onClose={handleGoogleTableClose}
        selectedCourseId={selectedGoogleCourseId}
        // Pass the parent's grade/year to be used in final insertion:
        classGrade={classGrade}
        classYear={classYear}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <span className="pr-2">
              <Plus />
            </span>
            Create Class
          </Button>
        </DialogTrigger>
        <DialogContent className="flex h-full flex-col p-6 sm:w-full sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create a new class</DialogTitle>
            <DialogDescription>
              Create a new class to add to your class list.
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue="template-upload"
            className="mt-4"
            onValueChange={(val) =>
              setActiveTab(val as "template-upload" | "google-classroom")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="template-upload" className="text-background">
                Upload via Template
              </TabsTrigger>
              <TabsTrigger value="google-classroom" className="text-background">
                Import from Google Classroom
              </TabsTrigger>
            </TabsList>
            <div className="mt-4 flex-1 overflow-auto">
              {/* TAB 1: CSV / Template Upload */}
              <TabsContent value="template-upload">
                <div className="flex flex-col space-y-4">
                  {/* Step 1 */}
                  <div className="flex flex-col items-start gap-2 space-x-2">
                    <h2 className="flex items-center gap-1 text-2xl">Step 1</h2>
                    <span className="no-wrap inline-block">
                      Make a copy of and fill out the{" "}
                      <Link
                        href="https://docs.google.com/spreadsheets/d/1mI61R0IS04-8ALMWC5_NLkKZVNkjJas2ylj5V7cb0D8/edit?usp=sharing"
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
                  {/* Step 2 */}
                  <div className="flex flex-col items-start gap-2 space-x-2">
                    <h2 className="text-2xl">Step 2</h2>
                    <p>
                      <Label>
                        From Google Sheets, download the Class Template as{" "}
                        <b>Comma-separated values (.csv)</b>.
                      </Label>
                    </p>
                  </div>
                  {/* Step 3 */}
                  <div className="flex flex-col items-start gap-2 space-x-2">
                    <h2 className="text-2xl">Step 3</h2>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="class-template-upload">
                        Upload the Class Template
                      </Label>
                      <Input
                        id="class-template-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const selectedFile =
                            e.target.files && e.target.files.length > 0
                              ? e.target.files[0]
                              : null;
                          validateCsv(selectedFile ?? null);
                        }}
                      />
                    </div>
                  </div>
                  {/* Step 4 */}
                  <div className="flex flex-col items-start gap-2 space-x-2">
                    <h2 className="text-2xl">Step 4</h2>
                    <div className="space-y-2">
                      <div className="grid flex-1 gap-2">
                        <Label
                          htmlFor="class-name"
                          className="flex items-center"
                        >
                          Class name{" "}
                          <span className="pl-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info width={16} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    This is the display name of your class that
                                    you and your students will see.
                                  </p>
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
                      <div className="grid flex-1 gap-2">
                        <Label
                          htmlFor="class-grade"
                          className="flex items-center"
                        >
                          Class grade{" "}
                          <span className="pl-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info width={16} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    This is used to determine which students are
                                    behind in reading.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </span>
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setClassGrade(value as ClassGrade)
                          }
                        >
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
                      <div className="grid flex-1 gap-2">
                        <Label
                          htmlFor="class-year"
                          className="flex items-center"
                        >
                          Class year{" "}
                          <span className="pl-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info width={16} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    You might have the same class in multiple
                                    years, right? 😉
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
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: Google Classroom */}
              <TabsContent value="google-classroom">
                <div className="flex flex-col space-y-4">
                  <p>
                    To import classes from Google Classroom, please ensure you
                    have connected your Google account. This feature will allow
                    you to seamlessly import your classes without the need for
                    manual CSV uploads.
                  </p>

                  {/* Here is where you set the Grade and Year for the Google Classroom as well */}
                  <div className="grid gap-4">
                    <div className="grid max-w-sm flex-1 gap-2">
                      <Label
                        htmlFor="class-grade"
                        className="flex items-center"
                      >
                        Class grade{" "}
                        <span className="pl-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info width={16} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  This is used to determine which students are
                                  behind in reading.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setClassGrade(value as ClassGrade)
                        }
                      >
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
                    <div className="grid max-w-sm flex-1 gap-2">
                      <Label htmlFor="class-year" className="flex items-center">
                        Class year{" "}
                        <span className="pl-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info width={16} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  You might have the same class in multiple
                                  years, right? 😉
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      </Label>
                      <Input
                        id="gc-class-year"
                        placeholder="Enter class year"
                        value={classYear}
                        onChange={(e) => setClassYear(e.target.value)}
                      />
                    </div>
                  </div>

                  <Suspense
                    fallback={<div>Loading Google Classroom classes...</div>}
                  >
                    <GoogleClassList
                      onCourseSelected={(courseId) =>
                        setSelectedGoogleCourseId(courseId)
                      }
                    />
                  </Suspense>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          <DialogFooter className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleCreateClass}
              disabled={loading}
              className="ml-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create class"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
